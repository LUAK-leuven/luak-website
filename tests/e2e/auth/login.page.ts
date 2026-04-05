import type { Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

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

  async login(email: string, password: string = '123456789') {
    await this.page.goto('/login');
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async logout() {
    await this.page.goto('/profile/overview');
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }
}
