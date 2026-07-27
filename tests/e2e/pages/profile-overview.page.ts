import { expect, type Locator, type Page } from '@playwright/test';
import { navigateTo } from '~/tests/e2e/fixtures';

export class ProfileOverviewPage {
  static readonly path = '/profile/overview';

  constructor(private readonly page: Page) {}

  async navigate() {
    await navigateTo(this.page, ProfileOverviewPage.path);
  }

  static async navigate(page: Page) {
    await navigateTo(page, ProfileOverviewPage.path);
    return new ProfileOverviewPage(page);
  }

  get buyMembershipButton() {
    return this.page.getByTestId('buyMembershipButton');
  }

  get hiUserName() {
    return this.page.getByTestId('userName');
  }

  readonly buyMembership = async () => {
    await this.buyMembershipButton.click();
    return new BuyMembershipModal(this.page);
  };
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
