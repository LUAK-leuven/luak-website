import type { Page } from '@playwright/test';

export class ProfileOverviewPage {
  private readonly page: Page;
  static readonly path = '/profile/overview';

  constructor(page: Page) {
    this.page = page;
  }
  
  get buyMembershipButton() {
    return this.page.getByTestId('buyMembershipButton');
  }

  get hiUserName() {
    return this.page.getByTestId('userName');
  }
}