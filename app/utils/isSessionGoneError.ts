import {
  isAuthApiError,
  isAuthSessionMissingError,
} from '@supabase/supabase-js';
import type { AuthError } from '@supabase/supabase-js';

const SESSION_GONE_AUTH_CODES: ReadonlySet<string | undefined> = new Set([
  'session_not_found',
]);

export const isSessionGoneError = (error: AuthError | null): boolean =>
  isAuthSessionMissingError(error) ||
  (isAuthApiError(error) && SESSION_GONE_AUTH_CODES.has(error.code));
