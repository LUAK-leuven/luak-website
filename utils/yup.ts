import * as yup from "yup";
import type { AnyObject, Maybe, Schema, Flags } from "yup";

const phoneRegExp = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

yup.addMethod<yup.StringSchema>(yup.string, "phone", function () {
  return this.matches(phoneRegExp, "Format of the phone number is incorrect.");
});

declare module "yup" {
    interface StringSchema<
      TType extends Maybe<string> = string | undefined,
      TContext extends AnyObject = AnyObject,
      TDefault = undefined,
      TFlags extends Flags = "",
    > extends Schema<TType, TContext, TDefault, TFlags> {
      phone(): this
    }
  }
  

export default yup;
