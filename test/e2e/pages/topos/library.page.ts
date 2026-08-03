import type { Locator, Page } from '@playwright/test';
import { TopoDetailsPage } from './details.page';
import { navigateTo } from '#test/e2e/fixtures';

export class TopoLibraryPage {
  private readonly page: Page;
  static readonly path = '/topos/library/';

  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchInput = this.page
      .getByTestId('search-input')
      .getByRole('textbox');
  }

  async navigate() {
    await TopoLibraryPage.navigate(this.page);
  }

  static async navigate(page: Page) {
    await navigateTo(page, TopoLibraryPage.path);
    return new TopoLibraryPage(page);
  }

  getTopo(title: string) {
    const topoLocator = this.page.getByTestId(`topo-${title}`);
    return { linkToDetails: topoLocator.getByRole('link') };
  }

  async navigateToDetails(title: string) {
    await this.getTopo(title).linkToDetails.click();
    return new TopoDetailsPage(this.page);
  }

  typeOfClimbing(type: string) {
    return this.page.getByTestId(`toc.${type}`);
  }

  country(country: string) {
    return this.page.getByTestId(`country.${country}`);
  }
}
