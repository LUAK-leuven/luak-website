import { expect, test } from 'vitest';

import { createGearName, createRetirementDate } from '#shared/api/rest/gear';
import { createDepositFee } from '#shared/api/rest/rental';
import { createAvailableAmount } from '#shared/api/rest/rental/availability';
import {
  createRentalItemId,
  createTotalAmount,
} from '#shared/api/rest/rental/rentalItem';
import { createTitle, createYearPublished } from '#shared/api/rest/topo';
import { aRandomGearItemId } from '#test/builders/ids';
import {
  toRentalFormGearItem,
  toRentalFormTopoItem,
} from '~/composables/board/rental/rentalFormItems';

// TODO LUAK-39: Clean up these tests
test('maps a gear item to a rental form item with its name', () => {
  const id = aRandomGearItemId();

  const item = toRentalFormGearItem({
    id,
    name: createGearName('Carabiner'),
    totalAmount: createTotalAmount(10),
    availableAmount: createAvailableAmount(4),
    earliestRetirementDate: createRetirementDate('infinite'),
    depositFee: createDepositFee(100),
  });

  expect(item).toEqual({
    id,
    name: 'Carabiner',
    totalAmount: 10,
    availableAmount: 4,
    depositFee: 100,
  });
});

test('names a topo with its publication year in parentheses', () => {
  const id = createRentalItemId(crypto.randomUUID());

  const item = toRentalFormTopoItem({
    id,
    title: createTitle('Topo Flone'),
    yearPublished: createYearPublished(2019),
    availableAmount: createAvailableAmount(2),
    totalAmount: createTotalAmount(2),
  });

  expect(item.name).toBe('Topo Flone (2019)');
  expect(item.id).toBe(id);
});

test('names a topo without publication year by its title', () => {
  const item = toRentalFormTopoItem({
    id: createRentalItemId(crypto.randomUUID()),
    title: createTitle('Freyr'),
    yearPublished: undefined,
    availableAmount: createAvailableAmount(1),
    totalAmount: createTotalAmount(1),
  });

  expect(item.name).toBe('Freyr');
});
