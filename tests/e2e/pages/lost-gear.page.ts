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

  readonly gearItemName: Locator;
  readonly inventorySelection: Locator;

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

    this.gearItemName = this.page.getByTestId('gear.name');
    this.inventorySelection = this.page
      .getByTestId('inventory-selection')
      .getByTestId('table-row');

    this.saveButton = this.page.getByTestId('saveButton');
  }

  async navigate() {
    await navigateTo(this.page, LostGearPage.path);
  }

  async expectToHave(
    args: {
      rental?: {
        member?: string;
        depositFee?: number;
        paymentMethod?: 'cash' | 'transfer';
        dateBorrow?: string;
        dateReturn?: string;
      };
    } & (
      | {
          topo: {
            title?: string;
            year?: number;
            rentedAmount?: number;
            unreturnedAmount?: number;
            lostAmount?: number;
          };
        }
      | {
          gear: {
            name?: string;
            rentedAmount?: number;
            unreturnedAmount?: number;
            lostAmount?: number;
            inventoryItem?: undefined;
          };
        }
    ),
  ) {
    if (args.rental) {
      await Promise.all([
        optionalExpect(this.member).toContainText(args.rental.member),
        optionalExpect(this.depositFee).toContainText(
          args.rental.depositFee?.toFixed(2),
        ),
        optionalExpect(this.paymentMethod).toHaveText(
          args.rental.paymentMethod,
        ),
        optionalExpect(this.dateBorrow).toContainText(args.rental.dateBorrow),
        optionalExpect(this.dateReturn).toContainText(args.rental.dateReturn),
      ]);
    }
    if ('topo' in args) {
      await Promise.all([
        optionalExpect(this.topoTitle).toContainText(args.topo.title),
        optionalExpect(this.year).toContainText(args.topo.year?.toFixed()),
        optionalExpect(this.rentedAmount).toContainText(
          args.topo.rentedAmount?.toFixed(),
        ),
        optionalExpect(this.unreturnedAmount).toContainText(
          args.topo.unreturnedAmount?.toFixed(),
        ),
        optionalExpect(this.lostAmount).toHaveValue(
          args.topo.lostAmount?.toFixed(),
        ),
      ]);
    } else {
      await Promise.all([
        optionalExpect(this.gearItemName).toContainText(args.gear.name),
        optionalExpect(this.rentedAmount).toContainText(
          args.gear.rentedAmount?.toFixed(),
        ),
        optionalExpect(this.unreturnedAmount).toContainText(
          args.gear.unreturnedAmount?.toFixed(),
        ),
        optionalExpect(this.lostAmount).toHaveValue(
          args.gear.lostAmount?.toFixed(),
        ),
      ]);
    }
  }
}

const optionalExpect = (locator: Locator) => {
  return {
    toHaveText: async (expected: string | undefined) => {
      if (expected !== undefined) await expect(locator).toHaveText(expected);
    },
    toContainText: async (expected: string | undefined) => {
      if (expected !== undefined) await expect(locator).toContainText(expected);
    },
    toHaveValue: async (expected: string | undefined) => {
      if (expected !== undefined) await expect(locator).toHaveValue(expected);
    },
  };
};
