import type { Page } from '@playwright/test';
import { navigateTo } from '~/tests/e2e/fixtures';

export class ProfileOverviewPage {
  static readonly path = '/profile/overview';

  constructor(private readonly page: Page) {}

  async navigate() {
    await navigateTo(this.page, ProfileOverviewPage.path);
  }

  static async navigate(page: Page) {
    await navigateTo(page, ProfileOverviewPage.path);
    return new ProfileOverviewPage(page);
  }

  get buyMembershipButton() {
    return this.page.getByTestId('buyMembershipButton');
  }

  get hiUserName() {
    return this.page.getByTestId('userName');
  }
}
