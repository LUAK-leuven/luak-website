import { expect, test } from 'vitest';
import type { TopoLibraryRecord } from '#server/domain/topo/topo';
import { TopoServiceImpl } from '#server/service/topo';
import { createPlaceInLibrary } from '#shared/api/rest/topo';
import {
  aRandomTopoId,
  aTopoLibraryRecord,
  aTopoRecord,
} from '#test/builders/topo';
import {
  topoRepositoryMock,
  inventoryRepositoryMock,
  rentalRepositoryMock,
} from '#test/mocks';
import {
  createInitialAmount,
  createItemArchivedAmount,
  createItemLostAmount,
  type InventoryItemEvent,
} from '#shared/api/rest/inventory';

test.describe('TopoService', () => {
  test('maps topo details and folds inventory events', async () => {
    const topoId = aRandomTopoId();
    const topoRepository = topoRepositoryMock({
      getDetails: () =>
        Promise.resolve(
          aTopoRecord({
            id: topoId,
            place_in_library: createPlaceInLibrary('A1'),
            totalAmount: createInitialAmount(3),
          }),
        ),
    });

    const events: InventoryItemEvent[] = [
      {
        eventName: 'ItemLostEvent' as const,
        lostAmount: createItemLostAmount(1),
        occurredOn: '2026-01-01',
      },
      {
        eventName: 'ItemArchivedEvent' as const,
        amount: createItemArchivedAmount(1),
        occurredOn: '2026-01-02',
      },
    ];
    const inventoryRepository = inventoryRepositoryMock({
      getInventoryItemEvents: () => Promise.resolve(events),
    });
    const rentalRepository = rentalRepositoryMock({
      getRentalsForTopo: () => Promise.resolve([]),
    });
    const details = await new TopoServiceImpl(
      topoRepository,
      inventoryRepository,
      rentalRepository,
    ).getDetails(topoId);

    expect(details).toMatchObject({
      id: topoId,
      placeInLibrary: 'A1',
      initialAmount: 3,
      amount: 1,
      events,
      rentals: [],
    });
  });

  test('filters out-of-stock topos when requested', async () => {
    const inStockTopoId = aRandomTopoId();
    const topoRepository = topoRepositoryMock({
      getTopoLibrary: () =>
        Promise.resolve([
          aTopoLibraryRecord({
            id: inStockTopoId,
            initialAmount: createInitialAmount(1),
          }),
          aTopoLibraryRecord({
            id: aRandomTopoId(),
            initialAmount: createInitialAmount(0),
          }),
        ] satisfies TopoLibraryRecord[]),
      getAllTopoInventoryItemEvents: () => Promise.resolve([]),
    });

    const topos = await new TopoServiceImpl(
      topoRepository,
      inventoryRepositoryMock(),
      rentalRepositoryMock(),
    ).getTopoLibrary({ includeOutOfStock: false });

    expect(topos.map((topo) => topo.id)).toEqual([inStockTopoId]);
  });
});
