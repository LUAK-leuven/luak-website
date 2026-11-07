import * as yup from 'yup';

export const depositFeeSchema = yup
  .number()
  .label('deposit fee')
  .required()
  .min(0)
  .integer('Deposit fee must be a whole number.');
