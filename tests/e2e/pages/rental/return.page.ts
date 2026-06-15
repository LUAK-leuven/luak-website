import type { Locator, Page } from '@playwright/test';
import { LostGearPage } from '../lost-gear.page';
import type { RentalId } from '~/types/rental';
import { navigateTo } from '~/tests/e2e/fixtures';
import { uuidRegex } from '~/utils/utils';

export class RentalReturnPage {
  private readonly page: Page;

  readonly path = (rentalId: RentalId) => `/board/rentals/${rentalId}/return/`;
  readonly urlRegex = new RegExp(`\\/board\\/rentals\\/${uuidRegex}\\/return`);

  readonly depositReturned: Locator;
  readonly comments: Locator;

  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.depositReturned = page.getByTestId('depositReturned');
    this.comments = page.getByTestId('editComments');

    this.saveButton = page.getByTestId('saveButton');
  }

  readonly navigate = async (rentalId: RentalId) => {
    await navigateTo(this.page, this.path(rentalId));
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
      more: {
        menuButton: item.getByTestId('rentalItemMenuButton'),
        markAsLost: item.getByTestId('markAsLost'),
      },
    };
  }

  async markItemAsLost(name: string) {
    const item = this.rentedItem(name);
    await item.more.menuButton.click();
    await item.more.markAsLost.click();
    return new LostGearPage(this.page);
  }
}
