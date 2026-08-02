import type { Locator, Page } from '@playwright/test';
import type { TopoId } from '~/shared/types/gear';
import { navigateTo } from '#test/e2e/fixtures';

export class TopoDetailsPage {
  private readonly page: Page;

  static readonly path = (topoId: TopoId) => `/topos/${topoId}/`;

  readonly amount: Locator;

  constructor(page: Page) {
    this.page = page;

    this.amount = page.getByTestId('amount');
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
