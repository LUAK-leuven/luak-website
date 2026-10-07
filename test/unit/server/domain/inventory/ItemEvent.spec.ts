import { describe, expect, test } from 'vitest';
import { parseEvent } from '#server/domain/inventory/ItemEvent';

describe('parseEvent', () => {
  test('parses item lost events', () => {
    const event = parseEvent({
      eventName: 'ItemLostEvent',
      rentalId: '00000000-0000-0000-0000-000000000000',
      lostAmount: 1,
    });

    expect(event).toEqual({
      eventName: 'ItemLostEvent',
      rentalId: '00000000-0000-0000-0000-000000000000',
      lostAmount: 1,
    });
  });
});
