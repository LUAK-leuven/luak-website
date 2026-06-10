import type { Page } from '@playwright/test';

export class GearInventoryPage {
  private readonly page: Page;
  readonly path = '/board/gear';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(this.path);
  }

  gearItem(itemName: string) {
    const row = this.page.getByTestId(`gearItem-${itemName}`);
    return {
      navigateToDetails: async () => {
        await row.getByTestId('linkToDetails').click();
      },
      availableAmount: row.getByTestId('availableAmount'),
      totalAmount: row.getByTestId('totalAmount'),
    };
  }
}
