import type { Page } from '@playwright/test';
import { navigateTo } from '~/tests/e2e/fixtures';

export class LostGearPage {
  private readonly page: Page;
  static readonly path = '/board/lost-gear';

  constructor(page: Page) {
    this.page = page;
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  async navigate() {
    await navigateTo(this.page, LostGearPage.path);
  }
}
