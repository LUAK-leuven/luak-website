import { expect, type Page } from '@playwright/test';
import { testUsers } from '~/tests/e2e/fixtures';
import type { Dayjs } from 'dayjs';
import type { RentalId } from '~/types/rental';

export class RentalDetailsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getRentalId() {
    return (await this.page
      .getByTestId('detailsPage.id')
      .innerText()) as RentalId;
  }

  get member() {
    return {
      fullName: this.page.getByTestId('member.fullName'),
      email: this.page.getByTestId('member.email'),
      phone: this.page.getByTestId('member.phone'),
    };
  }

  get boardMember() {
    return this.page.getByTestId('boardMember');
  }

  get dateBorrow() {
    return this.page.getByTestId('dateBorrow');
  }

  get dateReturn() {
    return this.page.getByTestId('dateReturn');
  }

  get depositFee() {
    return this.page.getByTestId('depositFee');
  }

  get paymentMethod() {
    return this.page.getByTestId('paymentMethod');
  }

  get status() {
    return this.page.getByTestId('status');
  }

  get comments() {
    return this.page.getByTestId('comments');
  }

  get editComments() {
    return this.page.getByTestId('editComments');
  }

  get depositReturned() {
    return this.page.getByTestId('depositReturned');
  }

  get editButton() {
    return this.page.getByTestId('editButton');
  }

  get returnButton() {
    return this.page.getByTestId('returnButton');
  }

  get saveButton() {
    return this.page.getByTestId('saveButton');
  }

  rentedItem(name: string) {
    const item = this.page.getByTestId(`rental-item-${name}`);
    return {
      item,
      rentedAmount: item.getByTestId('rentedAmount'),
      returnedAmount: item.getByTestId('returnedAmount'),
      returnedAmountInput: item.getByTestId('returnedAmountInput'),
      quickReturn: item.getByTestId('quickReturn'),
    };
  }

  async expectToHave(args: {
    memberName?: string;
    memberPhone?: string;
    memberEmail?: string;
    dateBorrow?: Dayjs;
    dateReturn?: Dayjs;
    depositFee?: number;
    paymentMethod?: 'cash' | 'transfer';
    status?: 'Not returned' | 'Partially returned' | 'Returned' | 'Reserved';
    comments?: string;
    numberOfItems?: number;
  }) {
    if (args.memberName) {
      await expect(this.member.fullName).toContainText(args.memberName);
    }
    if (args.memberEmail) {
      await expect(this.member.email).toHaveText(args.memberEmail);
    }
    if (args.memberPhone) {
      await expect(this.member.phone).toHaveText(args.memberPhone);
    }
    await expect(this.boardMember).toContainText(testUsers.boardMember);
    if (args.dateBorrow)
      await expect(this.dateBorrow).toHaveText(
        args.dateBorrow.format('YYYY-MM-DD'),
      );
    if (args.dateReturn)
      await expect(this.dateReturn).toHaveText(
        args.dateReturn.format('YYYY-MM-DD'),
      );
    if (args.depositFee)
      await expect(this.depositFee).toHaveText(args.depositFee.toFixed(2));
    if (args.paymentMethod)
      await expect(this.paymentMethod).toContainText(args.paymentMethod);
    if (args.status) await expect(this.status).toHaveText(args.status);
    if (args.comments) {
      if (args.comments === '') await expect(this.comments).toBeHidden();
      else await expect(this.comments).toHaveText(args.comments);
    }
    if (args.numberOfItems)
      await expect(this.page.getByTestId(/rental-item/)).toHaveCount(
        args.numberOfItems,
      );

    return this.getRentalId();
  }

  async expectItem(
    name: string,
    rentedAmount: number,
    returnedAmount: number = 0,
  ) {
    await expect(this.rentedItem(name).item).toBeVisible();
    await expect(this.rentedItem(name).rentedAmount).toHaveText(
      rentedAmount.toString(),
    );
    await expect(this.rentedItem(name).returnedAmount).toHaveText(
      returnedAmount.toString(),
    );
  }
}
