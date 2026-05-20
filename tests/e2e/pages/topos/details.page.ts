import type { Locator, Page } from '@playwright/test';

export class TopoDetailsPage {
  private readonly page: Page;

  readonly amount: Locator;

  constructor(page: Page) {
    this.page = page;

    this.amount = page.getByTestId('amount');
  }
}
