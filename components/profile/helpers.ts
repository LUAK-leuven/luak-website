import type { Database } from '~/types/database.types';

// Helper function to format student status enum values for display
export const formatStudentStatus = (
  status: Database['public']['Enums']['student'],
) => {
  const statusMap = {
    student_kul: 'Kul',
    phd_kul: 'PhD',
    student_other: 'Other',
    not_student: 'No',
  };
  return statusMap[status] || status;
};

// Helper function to format KBF/UIAA status enum values for display
export const formatKbfUiaaStatus = (
  status: Database['public']['Enums']['kbf_uiaa'],
) => {
  const statusMap = {
    not: 'No',
    kbf_luak: 'LUAK',
    kbf_other: 'KBF',
    uiaa: 'UIAA',
  };
  return statusMap[status] || status;
};

// CSV headers mapping
export const csvHeaders = {
  Name: 'name',
  Email: 'email',
  Phone: 'phone_number',
  WhatsApp: 'has_whatsapp',
  StudentStatus: 'student',
  Sportscard: 'sportscard',
  KBFStatus: 'kbf_uiaa_member',
  SubscriptionDate: 'created_at',
};
