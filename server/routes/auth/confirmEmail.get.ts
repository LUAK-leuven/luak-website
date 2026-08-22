import { object as zodObject, string as zodString, union } from 'zod';
import {
  type EmailConfirmationCookie,
  emailConfirmationCookieName,
} from '~~/shared/api/cookies/email-confirmation';
import { serverSupabaseClient } from '#supabase/server';

const querySchema = union([
  zodObject({ code: zodString() }),
  zodObject({
    error: zodString(),
    error_description: zodString(),
    error_code: zodString(),
  }),
]);

export default defineEventHandler(async (event) => {
  const result = await getValidatedQuery(event, (query) =>
    querySchema.safeParse(query),
  );
  if (!result.success) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid query parameters',
    });
  }

  let toast: EmailConfirmationCookie;
  let redirectUrl: string;

  if ('code' in result.data) {
    const sb = await serverSupabaseClient(event);
    const { error } = await sb.auth.exchangeCodeForSession(result.data.code);
    if (error) {
      console.warn(
        `Error exchanging code '${result.data.code}' for session:`,
        error,
      );
      toast = {
        type: 'success',
        message: 'Email confirmed successfully',
      };
      redirectUrl = '/login/#';
    } else {
      toast = {
        type: 'success',
        message: 'Email confirmed successfully',
      };
      redirectUrl = '/profile/overview/#';
    }
  } else {
    toast = {
      type: 'error',
      message: result.data.error_description,
    };
    redirectUrl = '/#';
  }

  setCookie(event, emailConfirmationCookieName, JSON.stringify(toast));

  return sendRedirect(event, redirectUrl);
});
