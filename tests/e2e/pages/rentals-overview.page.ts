import type { Page } from '@playwright/test';
import type { RentalId } from '~/types/rental';
import { navigateTo } from '~/tests/e2e/fixtures';

export class RentalsOverviewPage {
  private readonly page: Page;
  static readonly path = '/board/rentals';

  constructor(page: Page) {
    this.page = page;
  }

  static readonly navigate = async (page: Page) => {
    await navigateTo(page, RentalsOverviewPage.path);
    return new RentalsOverviewPage(page);
  };

  rentalSummary(rentalId: RentalId) {
    return this.page.getByTestId(`rental-${rentalId}`);
  }
}
