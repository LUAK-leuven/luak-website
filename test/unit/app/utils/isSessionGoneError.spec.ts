import {
  AuthApiError,
  AuthSessionMissingError,
  AuthWeakPasswordError,
} from '@supabase/supabase-js';
import { expect, test } from 'vitest';
import { isSessionGoneError } from '~/utils/isSessionGoneError';

const SESSION_GONE_CODES = [
  'session_not_found',
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
] as const;

test.each(SESSION_GONE_CODES)(
  'isSessionGoneError classifies an AuthApiError with code %s as session gone',
  (code) => {
    const error = new AuthApiError('Auth session missing!', 403, code);

    expect(isSessionGoneError(error)).toBe(true);
  },
);

test('isSessionGoneError classifies an AuthSessionMissingError as session gone', () => {
  expect(isSessionGoneError(new AuthSessionMissingError())).toBe(true);
});

test('isSessionGoneError does not classify a weak password error as session gone', () => {
  const error = new AuthWeakPasswordError(
    'Password should be at least 6 characters.',
    422,
    ['length'],
  );

  expect(isSessionGoneError(error)).toBe(false);
});

test('isSessionGoneError does not classify an AuthApiError with an unfamiliar code as session gone', () => {
  const error = new AuthApiError('Something new happened', 400, 'some_code');

  expect(isSessionGoneError(error)).toBe(false);
});
