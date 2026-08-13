import type { Locator, Page } from '@playwright/test';

export class ResetPasswordPage {
  readonly newPasswordInput: Locator;
  readonly changePasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorDialog: Locator;

  constructor(private readonly page: Page) {
    this.newPasswordInput = page
      .getByTestId('new-password')
      .getByRole('textbox');
    this.changePasswordInput = page
      .getByTestId('confirm-password')
      .getByRole('textbox');
    this.submitButton = page.getByTestId('submitButton');
    this.errorDialog = page.getByTestId('errorDialog');
  }
}
