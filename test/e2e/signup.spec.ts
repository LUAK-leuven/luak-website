import { TestUser } from '#test/TestUser';
import { test } from '#test/e2e/fixtures';
import { expect } from '@playwright/test';
import { ProfileOverviewPage } from './pages/profile/overview.page';
import { SignupPage } from './pages/signup.page';

const newUser = new TestUser({
  firstName: 'New',
  lastName: 'User',
  email: 'example@test.com',
  password: 'pass1234',
});

test('Can sign up a new user', async ({ page }) => {
  const signupPage = await SignupPage.navigate(page);

  await signupPage.fillForm({
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    password: newUser.password,
  });
  await signupPage.submitButton.click();

  const profilePage = new ProfileOverviewPage(page);
  await expect(profilePage.hiUserName).toBeVisible();
});
