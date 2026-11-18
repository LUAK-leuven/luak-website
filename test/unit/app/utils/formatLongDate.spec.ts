import { expect, test } from 'vitest';

import { formatLongDate } from '~/utils/formatLongDate';

test('formatLongDate formats a date with long weekday, day, long month and year', () => {
  expect(formatLongDate(new Date(2026, 10, 13, 12), 'en-US')).toBe(
    'Friday, November 13, 2026',
  );
});

test('formatLongDate does not zero-pad the day of the month', () => {
  expect(formatLongDate(new Date(2026, 0, 5, 12), 'en-US')).toBe(
    'Monday, January 5, 2026',
  );
});

test('formatLongDate accepts a date string, as stored in content', () => {
  expect(formatLongDate('2026-11-13T12:00:00', 'en-US')).toBe(
    'Friday, November 13, 2026',
  );
});
