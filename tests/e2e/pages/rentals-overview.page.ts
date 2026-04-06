import type { Page } from '@playwright/test';
import type { RentalId } from '~/types/rental';

export class RentalsOverviewPage {
  private readonly page: Page;
  readonly path = '/board/rentals';

  constructor(page: Page) {
    this.page = page;
  }

  rentalSummary(rentalId: RentalId) {
    return this.page.getByTestId(`rental-${rentalId}`);
  }
}
