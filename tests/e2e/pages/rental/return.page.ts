import type { Page } from '@playwright/test';

export class RentalReturnPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

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
}
