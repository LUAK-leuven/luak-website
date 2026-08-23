import {
  emailConfirmationCookieName,
  type EmailConfirmationCookie,
} from '~~/shared/api/cookies/email-confirmation';

export default defineNuxtPlugin(() => {
  const cookie = useCookie<EmailConfirmationCookie | undefined>(
    emailConfirmationCookieName,
  );

  if (cookie.value !== undefined) {
    useToast().show(cookie.value.type, cookie.value.message);
    cookie.value = undefined;
  }
});
