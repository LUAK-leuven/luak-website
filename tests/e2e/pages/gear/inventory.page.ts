import type { Page } from '@playwright/test';
import { GearDetailsPage } from './details.page';

export class GearInventoryPage {
  readonly path = '/board/gear';

  constructor(private readonly page: Page) {}

  async navigate() {
    await this.page.goto(this.path);
  }

  static async navigate(page: Page) {
    const gearInventoryPage = new GearInventoryPage(page);
    await gearInventoryPage.navigate();
    return gearInventoryPage;
  }

  gearItem(itemName: string) {
    const row = this.page.getByTestId(`gearItem-${itemName}`);
    return {
      navigateToDetails: async () => {
        await row.getByTestId('linkToDetails').click();
        return new GearDetailsPage(this.page);
      },
      availableAmount: row.getByTestId('availableAmount'),
      totalAmount: row.getByTestId('totalAmount'),
    };
  }
}
