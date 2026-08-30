import type { Locator, Page } from '@playwright/test';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';

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
}
