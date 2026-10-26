import { describe, expect, test } from 'vitest';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoLibraryRecord, TopoRecord } from '#server/domain/topo/topo';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { RentalRepository } from '#server/domain/rental/repository';
import { TopoServiceImpl } from '#server/service/topo';
import { aRandomTopoId } from '#test/builders/ids';
import {
  createAuthor,
  createClimbingType,
  createCountry,
  createDetails,
  createInitialAmount,
  createLanguage,
  createPlaceInLibrary,
  createTag,
  createTitle,
  createTopoId,
  createYearPublished,
} from '#shared/api/rest/topo';

describe('TopoService', () => {
  test('maps topo details and folds inventory events', async () => {
    const topoId = aRandomTopoId();
    const topoRepository = {
      getDetails: () =>
        Promise.resolve({
          id: topoId,
          title: createTitle('Topo'),
          authors: [createAuthor('Author')],
          condition: undefined,
          countries: [createCountry('Norway')],
          details: createDetails('Details'),
          languages: [createLanguage('English')],
          place_in_library: createPlaceInLibrary('A1'),
          tags: [createTag('guidebook')],
          types_of_climbing: [createClimbingType('sport')],
          year_published: createYearPublished(2020),
          totalAmount: createInitialAmount(3),
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
            id: createTopoId('in-stock'),
            authors: [],
            condition: undefined,
            countries: [],
            placeInLibrary: createPlaceInLibrary('A1'),
            tags: [],
            title: createTitle('In stock'),
            typesOfClimbing: [],
            yearPublished: undefined,
            initialAmount: createInitialAmount(1),
          },
          {
            id: createTopoId('out-of-stock'),
            authors: [],
            condition: undefined,
            countries: [],
            placeInLibrary: createPlaceInLibrary('A2'),
            tags: [],
            title: createTitle('Out of stock'),
            typesOfClimbing: [],
            yearPublished: undefined,
            initialAmount: createInitialAmount(0),
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
