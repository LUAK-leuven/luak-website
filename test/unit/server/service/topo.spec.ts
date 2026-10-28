import { expect, test } from 'vitest';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoLibraryRecord } from '#server/domain/topo/topo';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { RentalRepository } from '#server/domain/rental/repository';
import { TopoServiceImpl } from '#server/service/topo';
import {
  createInitialAmount,
  createPlaceInLibrary,
} from '#shared/api/rest/topo';
import {
  aRandomTopoId,
  aTopoLibraryRecord,
  aTopoRecord,
} from '#test/testUtils/builders/topo';

test.describe('TopoService', () => {
  test('maps topo details and folds inventory events', async () => {
    const topoId = aRandomTopoId();
    const topoRepository = {
      getDetails: () =>
        Promise.resolve(
          aTopoRecord({
            id: topoId,
            place_in_library: createPlaceInLibrary('A1'),
            totalAmount: createInitialAmount(3),
          }),
        ),
    } satisfies Pick<TopoRepository, 'getDetails'>;

    const events = [
      {
        eventName: 'ItemLostEvent' as const,
        lostAmount: 1,
        occurredOn: '2026-01-01',
      },
      {
        eventName: 'ItemArchivedEvent' as const,
        amount: 1,
        occurredOn: '2026-01-02',
      },
    ];
    const inventoryRepository = {
      getInventoryItemEvents: () => Promise.resolve(events),
    } satisfies Pick<InventoryRepository, 'getInventoryItemEvents'>;
    const rentalRepository = {
      getRentalsForTopo: () => Promise.resolve([]),
    } satisfies Pick<RentalRepository, 'getRentalsForTopo'>;

    const details = await new TopoServiceImpl(
      topoRepository as unknown as TopoRepository,
      inventoryRepository as unknown as InventoryRepository,
      rentalRepository as unknown as RentalRepository,
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
    const topoRepository = {
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
    } satisfies Pick<
      TopoRepository,
      'getTopoLibrary' | 'getAllTopoInventoryItemEvents'
    >;

    const topos = await new TopoServiceImpl(
      topoRepository as unknown as TopoRepository,
      {} as InventoryRepository,
      {} as RentalRepository,
    ).getTopoLibrary({ includeOutOfStock: false });

    expect(topos.map((topo) => topo.id)).toEqual([inStockTopoId]);
  });
});
