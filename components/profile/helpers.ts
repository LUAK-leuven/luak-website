import type { Database } from "~/types/database.types";

// Helper function to format student status enum values for display
export const formatStudentStatus = (
  status: Database["public"]["Enums"]["student"],
) => {
  const statusMap = {
    student_kul: "KU Leuven Student",
    phd_kul: "KU Leuven PhD",
    student_other: "Other Student",
    not_student: "Not a Student",
  };
  return statusMap[status] || status;
};

// Helper function to format KBF/UIAA status enum values for display
export const formatKbfUiaaStatus = (
  status: Database["public"]["Enums"]["kbf_uiaa"],
) => {
  const statusMap = {
    not: "None",
    kbf_luak: "KBF via LUAK",
    kbf_other: "KBF via Other Club",
    uiaa: "UIAA Member",
  };
  return statusMap[status] || status;
};

// CSV headers mapping
export const csvHeaders = {
  Name: "name",
  Email: "email",
  Phone: "phone_number",
  WhatsApp: "has_whatsapp",
  StudentStatus: "student",
  Sportscard: "sportscard",
  KBFStatus: "kbf_uiaa_member",
  SubscriptionDate: "created_at",
}; 