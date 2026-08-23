import { navigateTo } from '#test/e2e/fixtures';
import type { Locator, Page } from '@playwright/test';

export class SignupPage {
  static readonly path = '/signup';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByTestId('firstName').getByRole('textbox');
    this.lastNameInput = page.getByTestId('lastName').getByRole('textbox');
    this.emailInput = page.getByTestId('email').getByRole('textbox');
    this.phoneInput = page.getByTestId('phone').getByRole('textbox');
    this.passwordInput = page.getByTestId('password').getByRole('textbox');
    this.confirmPasswordInput = page
      .getByTestId('confirm-password')
      .getByRole('textbox');
    this.submitButton = page.getByTestId('submitButton');
  }

  static async navigate(page: Page) {
    await navigateTo(page, SignupPage.path);
    return new SignupPage(page);
  }

  readonly fillForm = async (user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) => {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    if (user.phoneNumber !== undefined)
      await this.phoneInput.fill(user.phoneNumber);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
  };
}
