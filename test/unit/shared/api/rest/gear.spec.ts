import { expect, test } from 'vitest';
import { createLifeSpanInYears } from '#shared/api/rest/gear';

test('creates a positive lifespan in years', () => {
  expect(createLifeSpanInYears(5)).toBe(5);
});

test('creates an infinite lifespan', () => {
  expect(createLifeSpanInYears('infinite')).toBe('infinite');
});

test.each([0, -1, 1.5])('rejects invalid lifespan %s', (lifespan) => {
  expect(() => createLifeSpanInYears(lifespan)).toThrow();
});
