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

  get rentalId() {
    return this.page.getByTestId('rental-id').getByRole('textbox');
  }

  get gearItemId() {
    return this.page.getByTestId('gear-item-id').getByRole('textbox');
  }

  get inventoryId() {
    return this.page.getByTestId('inventory-id').getByRole('textbox');
  }

  get dateLost() {
    return this.page.getByTestId('date-lost').getByRole('textbox');
  }

  get lostAmount() {
    return this.page.getByTestId('lost-amount').getByRole('spinbutton');
  }

  errorMessage(fieldTestId: string) {
    return this.page.getByTestId(fieldTestId).getByTestId('error-message');
  }

  async navigate() {
    await navigateTo(this.page, LostGearPage.path);
  }
}
