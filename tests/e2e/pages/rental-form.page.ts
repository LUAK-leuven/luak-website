import type { Page } from '@playwright/test';
import type { Dayjs } from 'dayjs';

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

  get comments() {
    return this.page.getByTestId('rental.form.comments');
  }

  selectComponent(which: 'gear' | 'topos') {
    switch (which) {
      case 'gear':
        return this.select('Search gear to add');
      case 'topos':
        return this.select('Search topos');
    }
  }

  private select(placeholder: string) {
    return {
      search: this.page.getByPlaceholder(placeholder),
      select: (name: string) =>
        this.page.getByRole('list').getByRole('button', { name: name }),
      listItem: (name: string) => {
        const item = this.page
          .getByTestId('rental.form.listItem')
          .filter({ hasText: name });
        return {
          name: item.getByTestId('name'),
          amount: item.getByTestId('amount'),
          deposit: item.getByTestId('deposit'),
          remove: item.getByTestId('remove'),
        };
      },
    };
  }

  get depositFee() {
    return this.page
      .getByTestId('rental.form.depositFee')
      .getByRole('spinbutton');
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

  async fillForm(args: {
    member: string;
    dateBorrow?: Dayjs;
    dateReturn?: Dayjs;
    comments?: string;
    depositFee?: number;
    paymentMethod: 'cash' | 'transfer';
  }) {
    await this.selectMember(args.member);
    if (args.dateBorrow) {
      await this.dateBorrow.fill(args.dateBorrow.format('YYYY-MM-DD'));
    }
    if (args.dateReturn) {
      await this.dateReturn.fill(args.dateReturn.format('YYYY-MM-DD'));
    }
    if (args.comments) {
      await this.comments.fill(args.comments);
    }
    if (args.depositFee) {
      await this.depositFee.clear();
      await this.depositFee.fill(args.depositFee.toString());
    } else {
      await this.depositFee.click();
    }

    await this.selectPaymentMethod(args.paymentMethod);
  }

  async addItem(which: 'gear' | 'topos', name: string, amount?: number) {
    const { search, select, listItem } = this.selectComponent(which);
    await search.fill(name);
    await select(name).click();
    await listItem(name).name.isVisible();
    if (amount !== undefined)
      await listItem(name).amount.fill(amount.toString());
  }
}
