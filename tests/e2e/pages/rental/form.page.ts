import { expect, type Locator, type Page } from '@playwright/test';
import type { Dayjs } from 'dayjs';

export class RentalFormPage {
  private readonly page: Page;
  readonly path = '/board/rentals/form';

  readonly boardMember: Locator;
  readonly contactFullName: Locator;
  readonly contactEmail: Locator;
  readonly contactPhoneNumber: Locator;
  readonly dateBorrow: Locator;
  readonly dateReturn: Locator;
  readonly comments: Locator;
  readonly depositFee: Locator;
  readonly paymentMethod: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.boardMember = this.page
      .getByTestId('rental.form.boardMember')
      .getByRole('textbox');
    this.contactFullName = this.page
      .getByTestId('contact.fullName')
      .getByRole('textbox');
    this.contactEmail = this.page
      .getByTestId('contact.email')
      .getByRole('textbox');
    this.contactPhoneNumber = this.page
      .getByTestId('contact.phoneNumber')
      .getByRole('textbox');
    this.dateBorrow = this.page
      .getByTestId('rental.form.dateBorrow')
      .getByRole('textbox');
    this.dateReturn = this.page
      .getByTestId('rental.form.dateReturn')
      .getByRole('textbox');
    this.comments = this.page.getByTestId('rental.form.comments');
    this.depositFee = this.page
      .getByTestId('rental.form.depositFee')
      .getByRole('spinbutton');
    this.paymentMethod = this.page.getByTestId('rental.form.paymentMethod');
    this.submitButton = this.page.getByTestId('rental.form.submit');
  }

  async navigate() {
    await this.page.goto(this.path);
  }

  selectComponent(which: 'gear' | 'topos') {
    switch (which) {
      case 'gear':
        return this.select('Search gear to add ...');
      case 'topos':
        return this.select('Search topos ...');
    }
  }

  private select(placeholder: string) {
    const options = this.page.getByTestId(
      `searchable-select-options-${placeholder}`,
    );
    return {
      search: this.page.getByPlaceholder(placeholder),
      options,
      option: (name: string) => options.getByRole('button', { name: name }),
      listItem: (name: string) => {
        const item = this.page
          .getByTestId('rental.form.listItem')
          .filter({ hasText: name });
        return {
          name: item.getByTestId('name'),
          amount: item.getByTestId('amount').getByRole('spinbutton'),
          deposit: item.getByTestId('deposit'),
          remove: item.getByTestId('remove'),
        };
      },
    };
  }

  private selectMemberComponent() {
    return this.select('select member');
  }

  async selectMember(memberName: string) {
    const { search, option } = this.selectMemberComponent();
    await search.click();
    try {
      await option(memberName).click({ timeout: 200 });
    } catch {
      await search.blur();
      await search.click();
      await option(memberName).click({ timeout: 200 });
    }
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

  async selectSearchBar(which: 'gear' | 'topos') {
    const { search, options } = this.selectComponent(which);
    await search.click();
    try {
      await expect(options).toBeVisible({ timeout: 200 });
    } catch {
      await search.blur();
      await search.click();
      await expect(options).toBeVisible({ timeout: 200 });
    }
  }

  async addItem(which: 'gear' | 'topos', name: string, amount?: number) {
    const { search, option, listItem } = this.selectComponent(which);
    await search.fill(name);
    await option(name).click();
    await listItem(name).name.isVisible();
    if (amount !== undefined)
      await listItem(name).amount.fill(amount.toString());
  }
}
