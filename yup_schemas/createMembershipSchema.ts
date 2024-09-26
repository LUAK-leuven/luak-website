import type { Database } from "~/types/database.types";
import * as yup from "yup";

type MembershipTable = Database["public"]["Tables"]["Memberships"]["Row"];
type KbfUiaaMember = MembershipTable["kbf_uiaa_member"];
type Student = MembershipTable["student"];

export default yup.object({
  kbf_uiaa_member: yup
    .mixed<KbfUiaaMember>()
    .oneOf(["not", "kbf_luak", "kbf_other", "uiaa"])
    .required().label("Member federation (kbf/uiaa)"),
  student: yup
    .mixed<Student>()
    .oneOf(["student_kul", "phd_kul", "student_other", "not_student"])
    .required().label("Student status"),
  sportscard: yup.bool().required(),
  houserules: yup.bool().oneOf([true]).label("Houserules").required(),
});
