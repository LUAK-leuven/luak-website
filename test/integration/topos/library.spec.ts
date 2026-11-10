import { beforeAll, expect, test } from 'vitest';
import { testServiceBuilder } from '#test/testServices';
import { createTopoId, type TopoLibraryItem } from '#shared/api/rest/topo';
import {
  createItemArchivedAmount,
  createItemLostAmount,
} from '#shared/api/rest/inventory';

const $fetch = testServiceBuilder().serverTestService().fetch;

const idTopoFlone = createTopoId('539bca6e-417e-44b3-8e6a-fecf223b49a2');
const idTopoAilefroide = createTopoId('184c489c-bee4-4a09-87d1-2b711e2a1248');

beforeAll(async () => {
  const { testDao } = testServiceBuilder();
  await testDao().addInventoryItemEvent({
    itemId: idTopoAilefroide,
    event: {
      eventName: 'ItemLostEvent',
      lostAmount: createItemLostAmount(1),
    },
  });
  await testDao().addInventoryItemEvent({
    itemId: idTopoFlone,
    event: {
      eventName: 'ItemArchivedEvent',
      amount: createItemArchivedAmount(1),
    },
  });
});

test('Does not return topos with total amount 0 for non-board members', async () => {
  const library = await $fetch<TopoLibraryItem[]>(
    '/api/topos/library',
    'paidMembership',
  );

  expect(library).toHaveLength(1);
  expect(library[0]!.amount).toBe(1);
});

test('Also returns topos with total amount 0 for board members', async () => {
  const library = await $fetch<TopoLibraryItem[]>(
    '/api/topos/library',
    'boardMember',
  );

  expect(library).toHaveLength(2);
  expect(library.find((topo) => topo.id === idTopoAilefroide)!.amount).toBe(0);
  expect(library.find((topo) => topo.id === idTopoFlone)!.amount).toBe(1);
});
