import { expect, type Page } from '@playwright/test';
import { navigateTo } from '#test/e2e/fixtures';
import { ProfileOverviewPage } from '#test/e2e/pages/profile/overview.page';

export class LoginPage {
  private readonly page: Page;
  static readonly path = '/login';

  constructor(page: Page) {
    this.page = page;
  }

  static async navigate(page: Page) {
    await navigateTo(page, LoginPage.path);
    return new LoginPage(page);
  }

  get submitButton() {
    return this.page.getByTestId('login.submit');
  }

  get email() {
    return this.page.getByTestId('login.email').getByRole('textbox');
  }

  get password() {
    return this.page.getByTestId('login.password').getByRole('textbox');
  }

  get errorMessage() {
    return this.page.getByTestId('login.password').getByTestId('error-message');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async loginAsserted(email: string, password: string) {
    await this.login(email, password);

    await expect(this.errorMessage).toBeHidden();
    await this.page.waitForURL(ProfileOverviewPage.path);
    return new ProfileOverviewPage(this.page);
  }
}
