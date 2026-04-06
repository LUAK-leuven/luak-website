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

  async expectToHave(_args: {
    memberEmail: string;
    dateBorrow: Dayjs;
    dateReturn: Dayjs;
    depositFee: number;
    paymentMethod: 'cash' | 'transfer';
    status: 'Not returned' | 'Partially returned' | 'Returned' | 'Reserved';
    comments: string;
  }) {
    const args = {
      ..._args,
    };
    await expect(this.member.email).toHaveText(args.memberEmail);
    await expect(this.boardMember).toContainText(testUsers.boardMember);
    await expect(this.dateBorrow).toHaveText(
      args.dateBorrow.format('YYYY-MM-DD'),
    );
    await expect(this.dateReturn).toHaveText(
      args.dateReturn.format('YYYY-MM-DD'),
    );
    await expect(this.depositFee).toHaveText(`${args.depositFee}`);
    await expect(this.paymentMethod).toContainText(args.paymentMethod);
    await expect(this.status).toHaveText(args.status);
    if (args.comments === '') await expect(this.comments).toBeHidden();
    else await expect(this.comments).toHaveText(args.comments);

    return this.getRentalId();
  }
}
