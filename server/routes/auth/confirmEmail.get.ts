import { object as zodObject, string as zodString, union } from 'zod';

import luakEventHandler from '#server/luakEventHandler';
import {
  type EmailConfirmationCookie,
  emailConfirmationCookieName,
} from '#shared/api/cookies/email-confirmation';

const querySchema = union([
  zodObject({ code: zodString() }),
  zodObject({
    error: zodString(),
    error_description: zodString(),
    error_code: zodString(),
  }),
]);

export default luakEventHandler(
  async ({ getQueryParams, services: { supabase }, event }) => {
    const queryParams = await getQueryParams(querySchema);

    let toast: EmailConfirmationCookie;
    let redirectUrl: string;

    if ('code' in queryParams) {
      const { error } = await supabase.auth.exchangeCodeForSession(
        queryParams.code,
      );
      if (error) {
        console.warn(
          `Error exchanging code '${queryParams.code}' for session:`,
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
        message: queryParams.error_description,
      };
      redirectUrl = '/#';
    }

    setCookie(event, emailConfirmationCookieName, JSON.stringify(toast));

    return sendRedirect(event, redirectUrl);
  },
);
