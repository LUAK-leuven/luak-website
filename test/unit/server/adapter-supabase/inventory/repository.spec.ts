import { expect, test } from 'vitest';

import { mapInventoryItemEvent } from '#server/adapter-supabase/inventory/repository';

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
