import { expect, type Locator, type Page } from '@playwright/test';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';
import { ProfileSettingsPage } from '#test/e2e/pages/profile/settings.page';
import type { TestUser } from '#test/testUtils/TestUser';
import { LoginPage } from '#test/e2e/pages/login.page';

export class AppPage {
  readonly toastMessage: Locator;

  constructor(private readonly page: Page) {
    this.toastMessage = page.getByTestId('toast').first();
  }

  toastAt(index: number): Locator {
    return this.page.getByTestId('toast').nth(index);
  }

  readonly toMyProfile = async () =>
    await ProfileOverviewPage.navigate(this.page);

  readonly toMySettings = async () =>
    await ProfileSettingsPage.navigate(this.page);

  async login(user: TestUser) {
    const loginPage = await LoginPage.navigate(this.page);
    const profilePage = await loginPage.loginAsserted(
      user.email,
      user.password,
    );
    await expect(profilePage.hiUserName).toBeVisible();
    return profilePage;
  }
}
