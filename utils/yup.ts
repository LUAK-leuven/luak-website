import * as yup from "yup";

const phoneRegExp = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const yup_phone = yup.string().matches(
  phoneRegExp,
  "Format of the phone number is incorrect.",
);
const yup_password = yup.string().min(6);

export { yup_password, yup_phone };
