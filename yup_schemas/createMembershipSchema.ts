import type { Database } from "~/types/database.types";
type MembershipTable = Database["public"]["Tables"]["Memberships"]["Row"];
type KbfUiaaMember = MembershipTable["kbf_uiaa_member"];
type Student = MembershipTable["student"];

export default yup.object({
  kbf_uiaa_member: yup
    .mixed<KbfUiaaMember>()
    .oneOf(["not", "kbf_luak", "kbf_other", "uiaa"])
    .required(),
  student: yup
    .mixed<Student>()
    .oneOf(["student_kul", "phd_kul", "student_other", "not_student"])
    .required(),
  sportscard: yup.bool().required(),
});
