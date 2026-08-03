import type { Locator, Page } from '@playwright/test';

export class GearDetailsPage {
  readonly gearItemAmount: Locator;
  readonly inventoryRows: Locator;

  readonly amount: Locator;

  constructor(private readonly page: Page) {
    this.gearItemAmount = page.getByTestId('gearItem-amount');
    this.inventoryRows = page.getByTestId('inventory-row');

    this.amount = this.inventoryRows.getByTestId('amount');
  }
}
