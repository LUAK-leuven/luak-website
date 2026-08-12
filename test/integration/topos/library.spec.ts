import { beforeAll, expect, test } from 'vitest';
import { testServiceBuilder } from '~/test/testUtils/testServices';
import type { TopoLibraryItem } from '~/shared/types/topos';
import type { TopoId } from '~/shared/types/gear';

const $fetch = testServiceBuilder().serverTestService().fetch;

const idTopoFlone = '539bca6e-417e-44b3-8e6a-fecf223b49a2' as TopoId;
const idTopoAilefroide = '184c489c-bee4-4a09-87d1-2b711e2a1248' as TopoId;

beforeAll(async () => {
  const { testDao } = testServiceBuilder();
  await testDao().cleanInventoryEvents();
  await testDao().clearRentals();

  await testDao().addInventoryItemEvent({
    itemId: {
      itemId: idTopoAilefroide,
      itemType: 'topo',
    },
    event: {
      eventName: 'ItemLostEvent',
      lostAmount: 1,
    },
  });
  await testDao().addInventoryItemEvent({
    itemId: {
      itemId: idTopoFlone,
      itemType: 'topo',
    },
    event: {
      eventName: 'ItemArchivedEvent',
      amount: 1,
    },
  });
});

test('Does not return topos with total amount 0 for non-board members', async () => {
  const library = (await $fetch(
    '/api/topos/library',
    'paidMembership',
  )) as TopoLibraryItem[];

  expect(library).toHaveLength(1);
  expect(library[0]!.amount).toBe(1);
});

test('Also returns topos with total amount 0 for board members', async () => {
  const library = (await $fetch(
    '/api/topos/library',
    'boardMember',
  )) as TopoLibraryItem[];

  expect(library).toHaveLength(2);
  expect(library.find((topo) => topo.id === idTopoAilefroide)!.amount).toBe(0);
  expect(library.find((topo) => topo.id === idTopoFlone)!.amount).toBe(1);
});
