import { describe, expect, test } from 'vitest';
import type { TopoRepository } from '#server/domain/topo/repository';
import type {
  TopoId,
  TopoLibraryRecord,
  TopoRecord,
} from '#server/domain/topo/topo';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { RentalRepository } from '#server/domain/rental/repository';
import { TopoServiceImpl } from '#server/service/topo';
import { aRandomTopoId } from '#test/builders/ids';
import {
  initialAmount,
  yearPublished,
  type Author,
  type ClimbingType,
  type Country,
  type Details,
  type Language,
  type PlaceInLibrary,
  type Tag,
  type Title,
} from '#shared/api/rest/topo';

describe('TopoService', () => {
  test('maps topo details and folds inventory events', async () => {
    const topoId = aRandomTopoId();
    const topoRepository = {
      getDetails: () =>
        Promise.resolve({
          id: topoId,
          title: 'Topo' as Title,
          authors: ['Author' as Author],
          condition: undefined,
          countries: ['Norway' as Country],
          details: 'Details' as Details,
          languages: ['English' as Language],
          place_in_library: 'A1' as PlaceInLibrary,
          tags: ['guidebook' as Tag],
          types_of_climbing: ['sport' as ClimbingType],
          year_published: yearPublished(2020),
          totalAmount: initialAmount(3),
        }),
    } satisfies Pick<TopoRepository, 'getDetails'> satisfies {
      getDetails: () => Promise<TopoRecord>;
    };
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
      typesOfClimbing: ['sport'],
      yearPublished: 2020,
      initialAmount: 3,
      amount: 1,
      events,
      rentals: [],
    });
  });

  test('filters out-of-stock topos when requested', async () => {
    const topoRepository = {
      getTopoLibrary: () =>
        Promise.resolve([
          {
            id: 'in-stock' as TopoId,
            authors: [],
            condition: undefined,
            countries: [],
            placeInLibrary: 'A1' as PlaceInLibrary,
            tags: [],
            title: 'In stock' as Title,
            typesOfClimbing: [],
            yearPublished: undefined,
            initialAmount: initialAmount(1),
          },
          {
            id: 'out-of-stock' as TopoId,
            authors: [],
            condition: undefined,
            countries: [],
            placeInLibrary: 'A2' as PlaceInLibrary,
            tags: [],
            title: 'Out of stock' as Title,
            typesOfClimbing: [],
            yearPublished: undefined,
            initialAmount: initialAmount(0),
          },
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

    expect(topos.map((topo) => topo.id)).toEqual(['in-stock']);
  });
});
