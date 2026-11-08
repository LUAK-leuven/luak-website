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
  createOccurredOn,
  type InventoryItemEvent,
} from '#shared/api/rest/inventory';
import { createOutstandingAmount } from '#shared/api/rest/rental';

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
        occurredOn: createOccurredOn('2026-01-01T00:00:00.000Z'),
      },
      {
        eventName: 'ItemArchivedEvent' as const,
        amount: createItemArchivedAmount(1),
        occurredOn: createOccurredOn('2026-01-02T00:00:00.000Z'),
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

  test('allows negative availability when more topos are rented than stocked', async () => {
    const topo = aTopoLibraryRecord({ initialAmount: createInitialAmount(1) });
    const topos = await new TopoServiceImpl(
      topoRepositoryMock({
        getTopos: () => Promise.resolve([topo]),
        getAllTopoInventoryItemEvents: () => Promise.resolve([]),
      }),
      inventoryRepositoryMock(),
      rentalRepositoryMock({
        getRentedTopoAmounts: () =>
          Promise.resolve([
            { topoId: topo.id, rentedAmount: createOutstandingAmount(2) },
          ]),
      }),
    ).getTopos();

    expect(topos[0]?.availableAmount).toBe(-1);
  });
});
