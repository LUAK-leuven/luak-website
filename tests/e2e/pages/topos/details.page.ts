import type { Locator, Page } from '@playwright/test';

export class TopoDetailsPage {
  private readonly page: Page;

  readonly availableAmount: Locator;
  readonly totalAmount: Locator;

  constructor(page: Page) {
    this.page = page;

    this.availableAmount = page.getByTestId('available');
    this.totalAmount = page.getByTestId('total');
  }
}
