import type { Locator } from '@playwright/test';

export class ItemHistoryComponent {
  private readonly history: Locator;
  readonly itemLostEvents: Locator;
  readonly itemArchivedEvents: Locator;

  constructor(history: Locator) {
    this.history = history;

    this.itemLostEvents = this.history.getByTestId('lostItem');
    this.itemArchivedEvents = this.history.getByTestId('archived');
  }
}
