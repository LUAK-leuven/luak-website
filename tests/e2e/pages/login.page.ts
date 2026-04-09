import type { Page } from '@playwright/test';

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

  async login(email: string, password: string = '123456789') {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async loginAsserted(email: string, password: string = '123456789') {
    await this.page.goto(LoginPage.path);
    try {
      await this.login(email, password);
      if (await this.errorMessage.isVisible())
        await this.login(email, password);
      await this.page.waitForURL('/profile/overview', { timeout: 3_000 });
    } catch {
      await this.login(email, password);
      if (await this.errorMessage.isVisible())
        await this.login(email, password);
      await this.page.waitForURL('/profile/overview', { timeout: 3_000 });
    }
  }

  async logout() {
    await this.page.goto('/profile/overview');
    await this.logoutButton.click();
    await this.page.waitForURL(LoginPage.path);
  }
}
