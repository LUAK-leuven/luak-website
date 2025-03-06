<script lang="ts" setup>
import type { Database } from "~/types/database.types";
import {
  formatStudentStatus,
  formatKbfUiaaStatus,
} from "~/components/profile/helpers";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const isLoading = ref(true);
const error = ref<string | null>(null);
const subscriptions = ref<
  Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    phone_number: string | null;
    has_whatsapp: boolean;
    student: Database["public"]["Enums"]["student"];
    sportscard: boolean;
    kbf_uiaa_member: Database["public"]["Enums"]["kbf_uiaa"];
    created_at: string;
  }>
>([]);
const searchTerm = ref("");
const filterType = ref("all");
const sortField = ref("created_at");
const sortDirection = ref("desc");

// Check if user is a board member
const checkBoardMemberAccess = async () => {
  if (!user.value) {
    error.value = "You must be logged in to view this page.";
    isLoading.value = false;
    return false;
  }

  const { data, error: boardError } = await supabase
    .from("BoardMembers")
    .select("*")
    .eq("user_id", user.value.id)
    .single();

  if (boardError || !data) {
    error.value = "You do not have permission to view this page.";
    isLoading.value = false;
    return false;
  }

  return true;
};

// Fetch all active subscriptions
const fetchSubscriptions = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from("Users")
      .select(
        `
        id,
        first_name,
        last_name,
        phone_number,
        email,
        has_whatsapp,
        Memberships (
          id,
          student,
          sportscard,
          kbf_uiaa_member,
          created_at,
          year,
          Payments (
            approved
          )
        )
      `,
      )
      .eq("Memberships.year", 2024)
      .eq("Memberships.Payments.approved", true);

    if (fetchError) throw fetchError;

    // Format the data to match our needs
    const formattedData = data
      .flatMap((user) =>
        user.Memberships.map((membership) => ({
          id: membership.id,
          userId: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email || "",
          phone_number: user.phone_number,
          has_whatsapp: user.has_whatsapp,
          student: membership.student,
          sportscard: membership.sportscard,
          kbf_uiaa_member: membership.kbf_uiaa_member,
          created_at: membership.created_at,
        })),
      )
      .filter((sub) => sub.name); // Ensure we have a name

    subscriptions.value = formattedData;
    error.value = null;
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    error.value = "Failed to load subscription data. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

// Initialize data
const initData = async () => {
  const hasAccess = await checkBoardMemberAccess();
  if (hasAccess) {
    await fetchSubscriptions();
  }
};

// Toggle sort direction
const toggleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
};

// Computed property for filtered and sorted subscriptions
const filteredSubscriptions = computed(() => {
  return subscriptions.value
    .filter((sub) => {
      const matchesSearch = sub.name
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase());

      if (filterType.value === "all") return matchesSearch;
      if (filterType.value === "student")
        return matchesSearch && sub.student !== "not_student";
      if (filterType.value === "non-student")
        return matchesSearch && sub.student === "not_student";
      if (filterType.value === "sportscard")
        return matchesSearch && sub.sportscard;
      if (filterType.value === "no-sportscard")
        return matchesSearch && !sub.sportscard;
      if (filterType.value === "kbf-uiaa")
        return matchesSearch && sub.kbf_uiaa_member !== "not";
      if (filterType.value === "no-kbf-uiaa")
        return matchesSearch && sub.kbf_uiaa_member === "not";
      if (filterType.value === "whatsapp")
        return matchesSearch && sub.has_whatsapp;
      if (filterType.value === "no-whatsapp")
        return matchesSearch && !sub.has_whatsapp;

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortField.value === "name") {
        return sortDirection.value === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField.value === "created_at") {
        return sortDirection.value === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });
});

// Load data on component mount
onMounted(() => {
  initData();
});
</script>

<template>
  <FullPageCard>
    <template #title>👥 Members Overview </template>

    <!-- Error message -->
    <div class="alert alert-error" v-if="error">
      <span>{{ error }}</span>
    </div>

    <!-- Loading state -->
    <div class="flex justify-center items-center py-10" v-else-if="isLoading">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Data display -->
    <div v-else>
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="form-control flex-1">
          <label class="label">
            <span class="label-text">Search by name</span>
          </label>
          <input
            class="input input-bordered w-full"
            v-model="searchTerm"
            type="text"
            placeholder="Search by name"
          />
        </div>

        <div class="form-control w-full md:w-64">
          <label class="label">
            <span class="label-text">Filter by</span>
          </label>
          <select class="select select-bordered w-full" v-model="filterType">
            <option value="all">All Members</option>
            <option value="student">Students Only</option>
            <option value="non-student">Non-Students Only</option>
            <option value="sportscard">With Sportscard</option>
            <option value="no-sportscard">Without Sportscard</option>
            <option value="kbf-uiaa">With KBF/UIAA</option>
            <option value="no-kbf-uiaa">Without KBF/UIAA</option>
            <option value="whatsapp">With WhatsApp</option>
            <option value="no-whatsapp">Without WhatsApp</option>
          </select>
        </div>
      </div>

      <!-- Subscription count and export button -->
      <div class="flex justify-between items-center mb-4">
        <p>Total active subscriptions: {{ filteredSubscriptions.length }}</p>
        <ProfileCsvExport
          :data="filteredSubscriptions"
          filename="subscriptions"
          :disabled="filteredSubscriptions.length === 0"
        />
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th class="cursor-pointer" @click="toggleSort('name')">
                Name
                {{
                  sortField === "name"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""
                }}
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>WhatsApp</th>
              <th>Student Status</th>
              <th>Sportscard</th>
              <th>KBF/UIAA Status</th>
              <th class="cursor-pointer" @click="toggleSort('created_at')">
                Subscription Date
                {{
                  sortField === "created_at"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""
                }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sub in filteredSubscriptions" :key="sub.id">
              <td>{{ sub.name }}</td>
              <td>{{ sub.email }}</td>
              <td>{{ sub.phone_number || "-" }}</td>
              <td>
                <div
                  class="badge"
                  :class="sub.has_whatsapp ? 'badge-primary' : 'badge-ghost'"
                >
                  {{ sub.has_whatsapp ? "Yes" : "No" }}
                </div>
              </td>
              <td>
                <div
                  class="badge"
                  :class="{
                    'badge-success': sub.student === 'student_kul',
                    'badge-success-content': sub.student === 'phd_kul',
                    'badge-info': sub.student === 'student_other',
                    'badge-ghost': sub.student === 'not_student',
                  }"
                >
                  {{ formatStudentStatus(sub.student) }}
                </div>
              </td>
              <td>
                <div
                  class="badge"
                  :class="sub.sportscard ? 'badge-info' : 'badge-ghost'"
                >
                  {{ sub.sportscard ? "Yes" : "No" }}
                </div>
              </td>
              <td>
                <div
                  class="badge"
                  :class="{
                    'badge-warning': sub.kbf_uiaa_member === 'kbf_luak',
                    'badge-warning-content':
                      sub.kbf_uiaa_member === 'kbf_other',
                    'badge-secondary': sub.kbf_uiaa_member === 'uiaa',
                    'badge-ghost': sub.kbf_uiaa_member === 'not',
                  }"
                >
                  {{ formatKbfUiaaStatus(sub.kbf_uiaa_member) }}
                </div>
              </td>
              <td>{{ new Date(sub.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No results message -->
      <div class="text-center py-10" v-if="filteredSubscriptions.length === 0">
        <p>No subscriptions found matching your criteria.</p>
      </div>
    </div>
  </FullPageCard>
</template>
