import { TestUser } from '#test/TestUser';
import { login, navigateTo, test } from '#test/e2e/fixtures';
import { expect } from '@playwright/test';
import { SignupPage } from '#test/e2e/pages/signup.page';
import { testServiceBuilder } from '#test/testServices';
import dayjs from 'dayjs';
import { findBy } from '~/shared/utils/utils';
import { ProfileOverviewPage } from './pages/profile/overview.page';

test('Can sign up a new user', async ({ page, luakPage }) => {
  const signupPage = await SignupPage.navigate(page);

  const newUser = new TestUser({
    firstName: 'New',
    lastName: 'User',
    email: 'example@test.com',
    password: 'pass1234',
  });

  await signupPage.fillForm({
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    password: newUser.password,
  });
  const start = dayjs();
  await signupPage.submitButton.click();

  await expect(page).toHaveURL('/');
  await expect(luakPage.toastMessage).toContainText(
    'A confirmation email has been sent to example@test.com. Confirm your email address to enable your account.',
  );

  const email = await testServiceBuilder()
    .mailpitService()
    .waitForEmail((message) => {
      if (message.Read) return false;
      if (message.Subject !== 'Confirm your email') return false;
      if (dayjs(message.Created).isBefore(start)) return false;
      if (findBy(message.To, 'Address', newUser.email) === undefined)
        return false;
      return true;
    });
  const confirmationLink = extractConfirmationLink(email.Text);
  await navigateTo(page, confirmationLink);

  const profilePage = new ProfileOverviewPage(page);
  await expect(profilePage.hiUserName).toContainText(newUser.firstName);
  await expect(luakPage.toastMessage).toContainText(
    'Email confirmed successfully',
  );

  await profilePage.logout();
  await login(page, newUser);
  await profilePage.logout();

  // Show error when confirmation link is not valid
  await navigateTo(page, confirmationLink);

  await expect(page).toHaveURL('/');
  await expect(luakPage.toastMessage).toContainClass('alert-error');
});

const extractConfirmationLink = (text: string) => {
  const match = text.match(/(?<=Confirm your mail \( ).+(?= \))/);
  if (match === null)
    throw new Error('Could not extract confirmation link from email.');
  return match[0];
};
