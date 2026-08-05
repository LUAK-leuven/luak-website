import { expect, type Locator, type Page } from '@playwright/test';
import { navigateTo } from '#test/e2e/fixtures';
import { LoginPage } from './login.page';

export class ProfileOverviewPage {
  static readonly path = '/profile/overview';

  readonly logoutButton: Locator;
  readonly buyMembershipButton: Locator;
  readonly hiUserName: Locator;

  constructor(private readonly page: Page) {
    this.logoutButton = this.page.getByTestId('profile.logout');
    this.buyMembershipButton = this.page.getByTestId('buyMembershipButton');
    this.hiUserName = this.page.getByTestId('userName');
  }

  async navigate() {
    await navigateTo(this.page, ProfileOverviewPage.path);
  }

  static async navigate(page: Page) {
    await navigateTo(page, ProfileOverviewPage.path);
    return new ProfileOverviewPage(page);
  }

  readonly buyMembership = async () => {
    await this.buyMembershipButton.click();
    return new BuyMembershipModal(this.page);
  };

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL(LoginPage.path);
    return new LoginPage(this.page);
  }
}

class BuyMembershipModal {
  private readonly kbfUiaaSelect: Locator;
  private readonly studentSelect: Locator;
  private readonly sportscardCheckbox: Locator;
  private readonly houseRules: Locator;

  private readonly price: Locator;
  private readonly buyMembershipButton: Locator;

  constructor(private readonly page: Page) {
    this.kbfUiaaSelect = this.page.getByTestId('kbf-uiaa-select');
    this.studentSelect = this.page.getByTestId('student-select');
    this.sportscardCheckbox = this.page.getByTestId('sportscard');
    this.houseRules = this.page.getByTestId('houserules');

    this.price = this.page.getByTestId('price');
    this.buyMembershipButton = this.page.getByTestId('buy-membership-button');
  }

  readonly expectPrice = async (expectedPrice: number) => {
    await expect(this.price).toContainText(expectedPrice.toFixed());
  };

  readonly fillForm = async (
    args: {
      kbfUiaa?: 'not' | 'kbf_luak' | 'kbf_other' | 'uiaa';
      student?: 'not_student' | 'student_kul' | 'student_other' | 'phd_kul';
      sportscard?: boolean;
      acceptHouseRules?: boolean;
    } = {},
  ) => {
    await this.kbfUiaaSelect.selectOption(args.kbfUiaa ?? 'not');
    await this.studentSelect.selectOption(args.student ?? 'not_student');
    if (args.sportscard) {
      await this.sportscardCheckbox.check();
    }
    if (args.acceptHouseRules ?? true) {
      await this.houseRules.check();
    }
  };

  readonly buyMembership = async () => {
    await this.buyMembershipButton.click();
    await expect(this.buyMembershipButton).toBeHidden();
  };
}
