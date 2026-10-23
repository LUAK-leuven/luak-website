import {
  isAuthApiError,
  isAuthSessionMissingError,
} from '@supabase/supabase-js';
import type { AuthError } from '@supabase/supabase-js';

const SESSION_GONE_AUTH_CODES: ReadonlySet<string | undefined> = new Set([
  'session_not_found',
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
]);

export const isSessionGoneError = (error: AuthError): boolean =>
  isAuthSessionMissingError(error) ||
  (isAuthApiError(error) && SESSION_GONE_AUTH_CODES.has(error.code));
