import { expect, type Page } from '@playwright/test';
import type { Dayjs } from 'dayjs';
import type { RentalId } from '~/types/rental';
import { testUsers } from '../../testUtils/TestUser';
import { uuidRegex } from '~/utils/utils';

export class RentalDetailsPage {
  private readonly page: Page;

  readonly urlRegex = new RegExp(`\\/board\\/rentals\\/${uuidRegex}`);
  readonly path = (rentalId: RentalId) => `/board/rentals/${rentalId}/`;

  constructor(page: Page) {
    this.page = page;
  }

  async getRentalId() {
    await expect(this.page.getByTestId('detailsPage.id')).toBeVisible();
    const rentalId = (await this.page
      .getByTestId('detailsPage.id')
      .innerText()) as RentalId;
    expect(rentalId).toBeTruthy();
    return rentalId;
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

  get editButton() {
    return this.page.getByTestId('editButton');
  }

  get returnButton() {
    return this.page.getByTestId('returnButton');
  }

  rentedItem(name: string) {
    const item = this.page.getByTestId(`rental-item-${name}`);
    return {
      item,
      rentedAmount: item.getByTestId('rentedAmount'),
      returnedAmount: item.getByTestId('returnedAmount'),
      lostItems: item.getByTestId('lostItem'),
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
    await expect(this.boardMember).toContainText(
      testUsers.boardMember.fullName,
    );
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

    return await this.getRentalId();
  }

  async expectItem(args: {
    name: string;
    rentedAmount: number;
    returnedAmount?: number;
    lostAmount?: number;
  }) {
    const item = this.rentedItem(args.name);
    await expect(item.item).toBeVisible();
    await expect(item.rentedAmount).toHaveText(args.rentedAmount.toString());
    await expect(item.returnedAmount).toHaveText(
      args.returnedAmount?.toString() ?? '0',
    );

    if (args.lostAmount !== undefined) {
      await expect(item.lostItems).toHaveCount(1);
      await expect(item.lostItems).toHaveText(
        `${args.lostAmount.toFixed()} item(s) Lost`,
      );
    }
  }
}
