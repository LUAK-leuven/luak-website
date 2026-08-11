import type { Locator, Page } from '@playwright/test';
import type { TopoId } from '~/shared/types/gear';
import { navigateTo } from '#test/e2e/fixtures';
import { ItemHistoryComponent } from '#test/e2e/pages/ItemHistory';

export class TopoDetailsPage {
  private readonly page: Page;

  static readonly path = (topoId: TopoId) => `/topos/${topoId}/`;

  readonly amount: Locator;
  readonly history: ItemHistoryComponent;

  constructor(page: Page) {
    this.page = page;

    this.amount = page.getByTestId('amount');
    this.history = new ItemHistoryComponent(page.getByTestId('history'));
  }

  static readonly navigate = async (page: Page, topoId: TopoId) => {
    const topoDetailsPage = new TopoDetailsPage(page);
    await topoDetailsPage.navigate(topoId);
    return topoDetailsPage;
  };

  readonly navigate = async (topoId: TopoId) => {
    await navigateTo(this.page, TopoDetailsPage.path(topoId));
  };
}
