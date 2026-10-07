import { describe, expect, test } from 'vitest';
import { mapTopoCondition } from '#server/adapter-supabase/topo/repository';

describe('mapTopoCondition', () => {
  test.each([
    null,
    'as_good_as_new',
    'good',
    'used',
    'damaged',
    'falling_appart',
  ] as const)('maps %s unchanged', (condition) => {
    expect(mapTopoCondition(condition)).toBe(condition);
  });
});
