export const validateLengthIsBetween = (
  value: string | undefined | null,
  name: string,
  min: number,
  max: number,
) => {
  if (!!value && !(min <= value.length && value.length <= max))
    throw `${name} must be between ${min} and ${max} characters`;
};
