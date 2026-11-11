import { expect, test } from 'vitest';

import { depositFeeSchema } from '~/composables/board/rental/depositFeeSchema';

test('accepts a zero deposit fee', async () => {
  await expect(depositFeeSchema.validate(0)).resolves.toBe(0);
});

test('rejects fractional deposit fees with a clear message', async () => {
  await expect(depositFeeSchema.validate(1.5)).rejects.toThrow(
    'Deposit fee must be a whole number.',
  );
});

test('rejects negative deposit fees', async () => {
  await expect(depositFeeSchema.validate(-1)).rejects.toThrow();
});
