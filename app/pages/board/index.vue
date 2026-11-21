<script setup lang="ts"></script>
<template>
  <FullPageCard>
    <template #title> Board section </template>

    <div class="flex flex-wrap justify-evenly gap-5">
      <ActionCard image="IMG_20240410_125659.jpg">
        <template #title> Create Rental 🧗 </template>
        <template #description> Make a new rental for a luak member </template>
        <template #actions>
          <NuxtLink
            class="btn bg-blue-400 hover:bg-blue-300 border-0"
            :to="{ name: 'board-rentals-form' }">
            Rental form
          </NuxtLink>
        </template>
      </ActionCard>

      <ActionCard image="IMG_20240410_125659.jpg">
        <template #title> Rentals 👀 </template>
        <template #description>
          An overview of all active rentals. Here you can find a rental to
          manage.
        </template>
        <template #actions>
          <NuxtLink class="btn btn-primary" :to="{ name: 'board-rentals' }">
            Rentals
          </NuxtLink>
        </template>
      </ActionCard>

      <ActionCard image="IMG_20240410_125659.jpg">
        <template #title> Memberships 👥 </template>
        <template #description>
          List all users with an active membership
        </template>
        <template #actions>
          <NuxtLink
            class="btn btn-secondary"
            :to="{ name: 'board-subscriptions-overview' }">
            View Memberships
          </NuxtLink>
        </template>
      </ActionCard>

      <ActionCard image="20241102_134927[1].jpg">
        <template #title> 📋 Inventory </template>
        <template #description>
          List of all inventory items that can be rented
        </template>
        <template #actions>
          <NuxtLink class="btn btn-primary" :to="{ name: 'board-inventory' }">
            To inventory
          </NuxtLink>
        </template>
      </ActionCard>

      <ActionCard image="luak_inside.jpg">
        <template #title> 📝 Studio mode </template>
        <template #description>
          Log in to Nuxt Studio to edit the website content
        </template>
        <template #actions>
          <a class="btn btn-neutral" href="/_studio"> Studio Mode </a>
        </template>
      </ActionCard>

      <ActionCard image="chardonnet.jpg">
        <template #title> 🪢 Climbing gear </template>
        <template #description>
          Information about climbing gear. Purchase date, lifespan, expected
          retirement date, etc.
        </template>
        <template #actions>
          <NuxtLink
            class="btn btn-secondary"
            :to="{ name: 'board-gear-retirement' }">
            Climbing gear
          </NuxtLink>
        </template>
      </ActionCard>
    </div>
  </FullPageCard>
</template>
