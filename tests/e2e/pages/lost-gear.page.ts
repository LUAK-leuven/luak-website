import { navigateTo } from '~/tests/e2e/fixtures';
import { FullPageCard } from './FullPageCard';
import { expect, type Locator, type Page } from '@playwright/test';

export class LostGearPage extends FullPageCard {
  static readonly path = '/board/lost-gear';

  readonly member: Locator;
  readonly depositFee: Locator;
  readonly paymentMethod: Locator;
  readonly dateBorrow: Locator;
  readonly dateReturn: Locator;

  readonly topoTitle: Locator;
  readonly year: Locator;
  readonly rentedAmount: Locator;
  readonly unreturnedAmount: Locator;
  readonly lostAmount: Locator;
  readonly lostAmountError: Locator;

  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);

    this.member = this.page.getByTestId('member');
    this.depositFee = this.page.getByTestId('depositFee');
    this.paymentMethod = this.page.getByTestId('paymentMethod');
    this.dateBorrow = this.page.getByTestId('dateBorrow');
    this.dateReturn = this.page.getByTestId('dateReturn');

    this.topoTitle = this.page.getByTestId('topo.title');
    this.year = this.page.getByTestId('topo.year_published');
    this.rentedAmount = this.page.getByTestId('returnedAmount');
    this.rentedAmount = this.page.getByTestId('rentedAmount');
    this.unreturnedAmount = this.page.getByTestId('unreturnedAmount');
    this.lostAmount = this.page
      .getByTestId('lostAmount')
      .getByRole('spinbutton');
    this.lostAmountError = this.page.getByTestId('lostAmount.error');

    this.saveButton = this.page.getByTestId('saveButton');
  }

  async navigate() {
    await navigateTo(this.page, LostGearPage.path);
  }

  async expectToHave(args: {
    rental: {
      member?: string;
      depositFee?: number;
      paymentMethod?: 'cash' | 'transfer';
      dateBorrow?: string;
      dateReturn?: string;
    };
    topo: {
      title?: string;
      year?: number;
      rentedAmount?: number;
      unreturnedAmount?: number;
      lostAmount?: number;
    };
  }) {
    if (args.rental.member !== undefined) {
      await expect(this.member).toContainText(args.rental.member);
    }
    if (args.rental.depositFee !== undefined) {
      await expect(this.depositFee).toContainText(
        args.rental.depositFee.toFixed(2),
      );
    }
    if (args.rental.paymentMethod !== undefined) {
      await expect(this.paymentMethod).toHaveText(args.rental.paymentMethod);
    }
    if (args.rental.dateBorrow !== undefined) {
      await expect(this.dateBorrow).toContainText(args.rental.dateBorrow);
    }
    if (args.rental.dateReturn !== undefined) {
      await expect(this.dateReturn).toHaveText(args.rental.dateReturn);
    }
    if (args.topo.title !== undefined) {
      await expect(this.topoTitle).toContainText(args.topo.title);
    }
    if (args.topo.year !== undefined) {
      await expect(this.year).toContainText(args.topo.year.toFixed());
    }
    if (args.topo.rentedAmount !== undefined) {
      await expect(this.rentedAmount).toContainText(
        args.topo.rentedAmount.toFixed(),
      );
    }
    if (args.topo.unreturnedAmount !== undefined) {
      await expect(this.unreturnedAmount).toContainText(
        args.topo.unreturnedAmount.toFixed(),
      );
    }
    if (args.topo.lostAmount !== undefined) {
      await expect(this.lostAmount).toHaveValue(args.topo.lostAmount.toFixed());
    }
  }
}
