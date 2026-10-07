import { describe, expect, test } from 'vitest';
import type { TopoDetails } from '#shared/api/rest/topo';
import type { RentalId } from '#shared/types/rental';
import type { TopoId } from '#shared/types/gear';

describe('TopoDetails DTO', () => {
  test('describes topo details, inventory events, and rentals', () => {
    const details: TopoDetails = {
      id: 'topo-id' as TopoId,
      title: 'Topo',
      authors: ['Author'],
      condition: null,
      countries: ['Norway'],
      typesOfClimbing: ['sport'],
      details: undefined,
      languages: ['English'],
      placeInLibrary: 'A1',
      tags: ['guidebook'],
      yearPublished: null,
      initialAmount: 2,
      amount: 1,
      events: [
        {
          eventName: 'ItemLostEvent',
          rentalId: 'rental-id' as RentalId,
          lostAmount: 1,
          occurredOn: '2026-01-01',
        },
        { eventName: 'ItemArchivedEvent', amount: 1, occurredOn: '2026-01-02' },
      ],
      rentals: [
        { id: 'rental-id' as RentalId, rentedAmount: 1, memberName: 'Member' },
      ],
    };

    expect(details.events).toHaveLength(2);
    expect(details.rentals[0]?.rentedAmount).toBe(1);
  });
});
