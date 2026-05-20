import { object as zodObject, string as zodString } from 'zod';
import type { infer as Infer } from 'zod';

const contactInfoSchema = zodObject({
  fullName: zodString().nonempty(),
  email: zodString().nonempty().optional(),
  phoneNumber: zodString().nonempty().optional(),
});

export type ContactInfo = Infer<typeof contactInfoSchema>;

export const parseContactInfo = (data: unknown): ContactInfo => {
  return contactInfoSchema.parse(data);
};
