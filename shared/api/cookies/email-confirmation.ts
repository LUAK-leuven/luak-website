export const emailConfirmationCookieName = 'email-confirmation';
export type EmailConfirmationCookie = {
  type: 'success' | 'error';
  message: string;
};
