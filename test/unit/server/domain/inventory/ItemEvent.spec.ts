import { describe, expect, it } from 'vitest';
import {
  itemArchivedEvent,
  itemLostEvent,
  parseEvent,
} from '#server/domain/inventory/ItemEvent';
import { aRandomRentalId } from '~~/test/testUtils/builders/ids';

describe('parseEvent', () => {
  it('parses a minimal item lost event', () => {
    expect(
      parseEvent({
        eventName: 'ItemLostEvent',
        lostAmount: 1,
      }),
    ).toEqual({
      eventName: 'ItemLostEvent',
      lostAmount: 1,
    });
  });

  it('parses an item lost event with a rental', () => {
    const rentalId = aRandomRentalId();

    expect(
      parseEvent({
        eventName: 'ItemLostEvent',
        rentalId,
        lostAmount: 2,
      }),
    ).toEqual({
      eventName: 'ItemLostEvent',
      rentalId,
      lostAmount: 2,
    });
  });

  it('parses an item archived event', () => {
    expect(parseEvent({ eventName: 'ItemArchivedEvent', amount: 1 })).toEqual({
      eventName: 'ItemArchivedEvent',
      amount: 1,
    });
  });

  it.each([
    ['unknown event name', { eventName: 'UnknownEvent', lostAmount: 1 }],
    ['missing lost amount', { eventName: 'ItemLostEvent' }],
    ['zero lost amount', { eventName: 'ItemLostEvent', lostAmount: 0 }],
    ['negative lost amount', { eventName: 'ItemLostEvent', lostAmount: -1 }],
    [
      'invalid rental id',
      { eventName: 'ItemLostEvent', rentalId: 'not-a-uuid', lostAmount: 1 },
    ],
  ])('throws for %s', (_description, input) => {
    expect(() => parseEvent(input)).toThrow();
  });

  it('throws for non-object input', () => {
    expect(() => parseEvent(null)).toThrow();
  });
});

describe('item event factories', () => {
  it('creates an item lost event', () => {
    const rentalId = aRandomRentalId();

    expect(itemLostEvent(rentalId, 2)).toEqual({
      eventName: 'ItemLostEvent',
      rentalId,
      lostAmount: 2,
    });
  });

  it('creates an item archived event', () => {
    expect(itemArchivedEvent(2)).toEqual({
      eventName: 'ItemArchivedEvent',
      amount: 2,
    });
  });
});
