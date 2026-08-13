import type { Locator, Page } from '@playwright/test';
import { navigateTo } from '#test/e2e/fixtures';

export class ForgotPasswordPage {
  static readonly path = '/forgot-password';

  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByTestId('emailInput').getByRole('textbox');
    this.submitButton = page.getByTestId('submitButton');
  }

  static async navigate(page: Page) {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.navigate();
    return forgotPasswordPage;
  }

  async navigate() {
    await navigateTo(this.page, ForgotPasswordPage.path);
  }
}
