import { expect, type Locator, type Page } from '@playwright/test';
import type { RentalId } from '~/types/rental';
import { navigateTo } from '~/tests/e2e/fixtures';
import { uuidRegex } from '~/utils/utils';
import { RentalDetailsPage } from './details.page';

export class RentalReturnPage {
  private readonly page: Page;

  readonly path = (rentalId: RentalId) => `/board/rentals/${rentalId}/return/`;
  readonly urlRegex = new RegExp(
    `.+\\/board\\/rentals\\/${uuidRegex}\\/return`,
  );

  readonly depositReturned: Locator;
  readonly comments: Locator;

  private readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.depositReturned = page.getByTestId('depositReturned');
    this.comments = page.getByTestId('editComments');

    this.saveButton = page.getByTestId('saveButton');
  }

  readonly navigate = async (rentalId: RentalId) => {
    await navigateTo(this.page, this.path(rentalId));
  };

  readonly submit = async () => {
    await this.saveButton.click();
    await expect(this.page).toHaveURL(RentalDetailsPage.urlRegex);
    await this.page.getByTestId('toast-close-button').click();
    return new RentalDetailsPage(this.page);
  };

  rentedItem(name: string) {
    const item = this.page.getByTestId(`rental-item-${name}`);
    return {
      item,
      rentedAmount: item.getByTestId('rentedAmount'),
      returnedAmount: item.getByTestId('returnedAmount'),
      returnedAmountInput: item
        .getByTestId('returnedAmountInput')
        .getByRole('spinbutton'),
      quickReturn: item.getByTestId('quickReturn'),
    };
  }
}
