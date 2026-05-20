import type { Page } from '@playwright/test';
import { TopoDetailsPage } from './details.page';

export class TopoLibraryPage {
  private readonly page: Page;
  static readonly path = '/topos/library/';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(TopoLibraryPage.path);
  }

  getTopo(title: string) {
    const topoLocator = this.page.getByTestId(`topo-${title}`);
    return { linkToDetails: topoLocator.getByRole('link') };
  }

  async navigateToDetails(title: string) {
    await this.getTopo(title).linkToDetails.click();
    return new TopoDetailsPage(this.page);
  }
}
