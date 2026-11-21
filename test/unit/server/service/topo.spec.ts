import { expect, test } from 'vitest';

import {
  createInitialAmount,
  createItemArchivedAmount,
  createItemLostAmount,
  createOccurredOn,
  type InventoryItemEvent,
} from '#shared/api/rest/inventory';
import { createPlaceInLibrary } from '#shared/api/rest/topo';
import type { TopoLibraryRecord } from '#shared/domain/topo/topo';
import { TopoServiceImpl } from '#shared/service/topo';
import { aRandomTopoId, aTopoLibraryRecord } from '#test/builders/topo';
import { inventoryRepositoryMock, topoRepositoryMock } from '#test/mocks';

test.describe('TopoService', () => {
  test('maps topo details and folds inventory events', async () => {
    const topoId = aRandomTopoId();
    const topoRepository = topoRepositoryMock({
      getDetails: () =>
        Promise.resolve(
          aTopoLibraryRecord({
            id: topoId,
            placeInLibrary: createPlaceInLibrary('A1'),
            amount: createInitialAmount(3),
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

    const details = await new TopoServiceImpl(
      topoRepository,
      inventoryRepository,
    ).getDetails(topoId);

    expect(details).toMatchObject({
      id: topoId,
      placeInLibrary: 'A1',
      amount: 1,
    });
  });

  test('filters out-of-stock topos when requested', async () => {
    const inStockTopoId = aRandomTopoId();
    const topoRepository = topoRepositoryMock({
      getTopoLibrary: () =>
        Promise.resolve([
          aTopoLibraryRecord({
            id: inStockTopoId,
            amount: createInitialAmount(1),
          }),
          aTopoLibraryRecord({
            id: aRandomTopoId(),
            amount: createInitialAmount(0),
          }),
        ] satisfies TopoLibraryRecord[]),
      getAllTopoInventoryItemEvents: () => Promise.resolve({}),
    });

    const topos = await new TopoServiceImpl(
      topoRepository,
      inventoryRepositoryMock(),
    ).getTopoLibrary({ includeOutOfStock: false });

    expect(topos.map((topo) => topo.id)).toEqual([inStockTopoId]);
  });
});
