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

  async login(email: string, password: string = '123456789') {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();

    try {
      await expect
        .poll(
          async () => {
            return (
              (await this.errorMessage.isVisible()) ||
              (await this.submitButton.getByTestId('loading').isVisible()) ||
              (await this.page.getByTestId('page.title').isVisible())
            );
          },
          { timeout: 2_000 },
        )
        .toBe(true);
    } catch {
      console.log(
        `error: ${await this.errorMessage.isVisible()}\nloading: ${await this.submitButton.getByTestId('loading').isVisible()}\nprofile:${await this.page.getByTestId('page.title').isVisible()}`,
      );
      return 'timeout';
    }

    return (await this.errorMessage.isVisible()) ? 'error' : 'loading';
  }

  async loginAsserted(email: string, password: string = '123456789') {
    await navigateTo(this.page, LoginPage.path);
    let result: 'error' | 'loading' | 'timeout' = await this.login(
      email,
      password,
    );
    switch (result) {
      case 'error': {
        result = await this.login(email, password);
        switch (result) {
          case 'error': {
            throw `Error - Failed to login user ${email}.`;
          }
          case 'timeout': {
            throw `Timeout - Failed to login user ${email}.`;
          }
          case 'loading': {
            await expect(this.submitButton.getByTestId('loading')).toBeHidden();
            await this.page.waitForURL('/profile/overview', { timeout: 2_000 });
            return;
          }
        }
        break;
      }
      case 'timeout': {
        result = await this.login(email, password);
        switch (result) {
          case 'error': {
            throw `Error - Failed to login user ${email}.`;
          }
          case 'timeout': {
            throw `Timeout - Failed to login user ${email}.`;
          }
          case 'loading': {
            await expect(this.submitButton.getByTestId('loading')).toBeHidden();
            await this.page.waitForURL('/profile/overview', { timeout: 2_000 });
            return;
          }
        }
        break;
      }
      case 'loading': {
        await expect(this.submitButton.getByTestId('loading')).toBeHidden();
        await this.page.waitForURL('/profile/overview', { timeout: 2_000 });
        return;
      }
    }
  }

  async logout() {
    await navigateTo(this.page, '/profile/overview');
    await this.logoutButton.click();
    await this.page.waitForURL(LoginPage.path);
  }
}
