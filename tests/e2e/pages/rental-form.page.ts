import type { Page } from '@playwright/test';
import { testUsers } from '~/tests/e2e/fixtures';

export class RentalFormPage {
  private readonly page: Page;
  readonly path = '/board/rentals/form';

  constructor(page: Page) {
    this.page = page;
  }

  get boardMember() {
    return this.page
      .getByTestId('rental.form.boardMember')
      .getByRole('textbox');
  }

  get dateBorrow() {
    return this.page.getByTestId('rental.form.dateBorrow').getByRole('textbox');
  }

  get dateReturn() {
    return this.page.getByTestId('rental.form.dateReturn').getByRole('textbox');
  }

  get depositFee() {
    return this.page.getByTestId('rental.form.depositFee');
  }

  get paymentMethod() {
    return this.page.getByTestId('rental.form.paymentMethod');
  }

  get submitButton() {
    return this.page.getByTestId('rental.form.submit');
  }

  async selectMember(memberName: string) {
    const memberSelect = this.page.getByTestId('rental.form.memberSelect');
    await memberSelect.getByRole('textbox').focus();
    await this.page
      .getByRole('list')
      .getByRole('button')
      .getByText(memberName)
      .click();
  }

  async selectPaymentMethod(paymentMethod: 'cash' | 'transfer') {
    await this.paymentMethod.selectOption(paymentMethod);
  }

  async submit() {
    await this.submitButton.click();
  }

  async submitMinimal(
    _args: {
      member?: string;
      paymentMethod?: 'cash' | 'transfer';
    } = {},
  ) {
    const args = { member: testUsers.paidMembership, paymentMethod: 'cash' as const, ..._args}
    await this.selectMember(args.member);
    await this.depositFee.click();
    await this.selectPaymentMethod(args.paymentMethod);

    await this.submit();
  }
}
