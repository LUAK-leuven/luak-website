import { expect, test } from 'vitest';
import {
  mapGearItem,
  mapInventoryItemEvent,
} from '#server/adapter-supabase/inventory/repository';

test('maps a database lifespan of zero to infinite', () => {
  expect(
    mapGearItem({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Carabiner',
      lifespan: 0,
      deposit_fee: 2500,
    }).lifespan,
  ).toBe('infinite');
});

test('maps a database event timestamp to OccurredOn', () => {
  expect(
    mapInventoryItemEvent({
      occured_on: '2026-01-01T12:30:00+00:00',
      event: { eventName: 'ItemArchivedEvent', amount: 2 },
    }),
  ).toMatchObject({
    occurredOn: '2026-01-01T12:30:00.000Z',
    eventName: 'ItemArchivedEvent',
    amount: 2,
  });
});
