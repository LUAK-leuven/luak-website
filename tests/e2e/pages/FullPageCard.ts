import type { Page } from '@playwright/test';

export class FullPageCard {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get title() {
    return this.page.getByTestId('page.title');
  }
}
