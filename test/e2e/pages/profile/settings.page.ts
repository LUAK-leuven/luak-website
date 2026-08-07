import type { Locator, Page } from '@playwright/test';
import { navigateTo } from '#test/e2e/fixtures';

export class ProfileSettingsPage {
  static readonly path = '/profile/settings';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly whatsAppCheckbox: Locator;
  readonly newsletterCheckbox: Locator;
  readonly changeInfoButton: Locator;

  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByTestId('firstName').getByRole('textbox');
    this.lastNameInput = page.getByTestId('lastName').getByRole('textbox');
    this.phoneNumberInput = page
      .getByTestId('phoneNumber')
      .getByRole('textbox');
    this.whatsAppCheckbox = page.getByTestId('whatsApp');
    this.newsletterCheckbox = page.getByTestId('newsletter');
    this.changeInfoButton = page.getByTestId('changeInfo');

    this.newPasswordInput = page
      .getByTestId('new-password')
      .getByRole('textbox');
    this.confirmPasswordInput = page
      .getByTestId('confirm-password')
      .getByRole('textbox');
    this.changePasswordButton = page.getByTestId('change-password-button');
  }

  async navigate() {
    await navigateTo(this.page, ProfileSettingsPage.path);
  }

  static async navigate(page: Page) {
    await navigateTo(page, ProfileSettingsPage.path);
    return new ProfileSettingsPage(page);
  }
}
