import { expect, type Locator, type Page } from '@playwright/test';

import type { TopoId } from '#shared/api/rest/topo';
import { navigateTo } from '#test/e2e/fixtures';

export class TopoDetailsPage {
  private readonly page: Page;

  static readonly path = (topoId: TopoId) => `/topos/${topoId}/`;

  private readonly amount: Locator;

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

  readonly expectAmount = async (value: number) => {
    await expect(this.amount).toHaveText(value.toFixed());
  };
}
