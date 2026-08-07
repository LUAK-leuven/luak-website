import { DomainValidationException } from '~/model/DomainValidationException';

export const validateLengthIsBetween = (
  value: string | undefined | null,
  name: string,
  min: number,
  max: number,
) => {
  if (!!value && !(min <= value.length && value.length <= max))
    throw new DomainValidationException(
      `${name} must be between ${min.toFixed()} and ${max.toFixed()} characters`,
    );
};
