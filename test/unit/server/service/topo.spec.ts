import { describe, expect, test } from 'vitest';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoRecord } from '#server/domain/topo/topo';
import type { GearDao } from '#server/repository/gear';
import type { RentalDao } from '#server/repository/rentals';
import { TopoServiceImpl } from '#server/service/topo';

describe('TopoService', () => {
  test('maps topo details and folds inventory events', async () => {
    const topoRepository = {
      getDetails: () =>
        Promise.resolve({
          id: 'topo-id' as TopoId,
          title: 'Topo',
          authors: ['Author'],
          condition: null,
          countries: ['Norway'],
          details: 'Details',
          languages: ['English'],
          place_in_library: 'A1',
          tags: ['guidebook'],
          types_of_climbing: ['sport'],
          year_published: 2020,
          totalAmount: 3,
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
    const gearRepository = {
      getInventoryItemEvents: () => Promise.resolve(events),
    } satisfies Pick<GearDao, 'getInventoryItemEvents'>;
    const rentalRepository = {
      getRentalsForTopo: () => Promise.resolve([]),
    } satisfies Pick<RentalDao, 'getRentalsForTopo'>;

    const details = await new TopoServiceImpl(
      topoRepository as unknown as TopoRepository,
      gearRepository as unknown as GearDao,
      rentalRepository as unknown as RentalDao,
    ).getDetails('topo-id' as TopoId);

    expect(details).toMatchObject({
      id: 'topo-id',
      placeInLibrary: 'A1',
      typesOfClimbing: ['sport'],
      yearPublished: 2020,
      initialAmount: 3,
      amount: 1,
      events,
      rentals: [],
    });
  });
});
