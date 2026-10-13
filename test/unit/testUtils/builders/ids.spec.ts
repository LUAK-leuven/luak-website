import { describe, expect, test } from 'vitest';
import {
  aRandomGearInventoryId,
  aRandomGearItemId,
  aRandomRentalId,
  aRandomTopoId,
} from '#test/builders/ids';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('random id builders', () => {
  test.each([
    ['rental', aRandomRentalId],
    ['topo', aRandomTopoId],
    ['gear item', aRandomGearItemId],
    ['gear inventory', aRandomGearInventoryId],
  ])('builds distinct valid %s ids', (_name, builder) => {
    const first = builder();
    const second = builder();

    expect(first).toMatch(uuidPattern);
    expect(second).toMatch(uuidPattern);
    expect(first).not.toBe(second);
  });
});
