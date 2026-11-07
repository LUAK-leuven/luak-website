import { createDepositFee } from '#shared/api/rest/rental';
import { randomInt, randomOf } from '#shared/utils/utils';

export const aRandomDepositFee = () =>
  createDepositFee(randomOf([0, randomInt(1, 100)]));
