import { expect, type Page } from '@playwright/test';
import { navigateTo } from '~/tests/e2e/fixtures';

export class LoginPage {
  private readonly page: Page;
  static readonly path = '/login';

  constructor(page: Page) {
    this.page = page;
  }

  get submitButton() {
    return this.page.getByTestId('login.submit');
  }

  get logoutButton() {
    return this.page.getByTestId('profile.logout');
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
    await navigateTo(this.page, LoginPage.path);
    await this.login(email, password);

    await expect(this.errorMessage).toBeHidden();
    await this.page.waitForURL('/profile/overview');
    return;
  }

  async logout() {
    await navigateTo(this.page, '/profile/overview');
    await this.logoutButton.click();
    await this.page.waitForURL(LoginPage.path);
  }
}
