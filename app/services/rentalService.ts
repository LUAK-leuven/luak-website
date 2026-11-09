import type { SupabaseClient } from '@supabase/supabase-js';
import {
  RentalSummary,
  RentalDetails,
  PublicRentalDetails,
  RentalItem,
} from '~/model/Rental';
import { getFullName } from './userService';
import { object as zodObject, string as zodString } from 'zod';
import { createGearItemId } from '#shared/api/rest/gear';
import {
  createDepositFee,
  createRentalId,
  createRentalItemId,
  type RentalId,
} from '#shared/api/rest/rental';
import { createUserId, type UserId } from '#shared/api/rest/user';
import type { Database } from '#shared/types/database.types';

export class RentalService {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  readonly saveRental = async (
    rental: UnsavedRental,
  ): Promise<{ id: RentalId | undefined; error: string | undefined }> => {
    const { error, data } = await this.supabaseClient.rpc('create_rental', {
      p_board_member_id: rental.boardMemberId,
      // @ts-expect-error: type generation doesn't work for nullable function types
      p_member_id: rental.memberId ?? null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_items: Object.entries(rental.gear)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          item_id: id,
          rented_amount: amount,
        }))
        .concat(
          Object.entries(rental.topos)
            .filter(([_, amount]) => amount !== undefined)
            .map(([id, amount]) => ({
              item_id: id,
              rented_amount: amount,
            })),
        ),
      p_payment_method: rental.paymentMethod,
      // @ts-expect-error: type generation doesn't work for nullable function types
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      // @ts-expect-error: type generation doesn't work for nullable function types
      p_comments: rental.comments ?? null,
    });

    return {
      id: data === null ? undefined : createRentalId(data),
      error: error?.message,
    };
  };

  readonly getRentals = async () => {
    const { data } = await this.supabaseClient
      .from('Rentals')
      .select(
        `
          id,
          member:Users!Rentals_member_id_fkey (
            first_name,
            last_name
          ),
          date_return,
          date_borrow,
          contact_info,
          deposit_returned,
          deposit,
          RentedItems(
            rented_amount,
            returned_amount,
            lost_amount,
            RentalItems(id, name, item_type)
          )
        `,
      )
      .throwOnError();

    return data;
  };

  readonly getRental = async (rentalId: RentalId) => {
    const { data } = await this.supabaseClient
      .from('Rentals')
      .select(
        `
          id,
          board_member:Users!Rentals_board_member_id_fkey(
            first_name,
            last_name
          ),
          member:Users!Rentals_member_id_fkey(
            first_name,
            last_name,
            email,
            phone_number,
            id
          ),
          date_borrow,
          date_return,
          deposit,
          deposit_returned,
          payment_method,
          RentedItems(
            RentalItems(id, name, item_type),
            rented_amount,
            returned_amount,
            lost_amount
          ),
          contact_info,
          comments
        `,
      )
      .eq('id', rentalId)
      .single()
      .throwOnError();

    return data;
  };

  readonly updateRental = async (
    id: RentalId,
    rentalUpdate: Omit<RentalUpdate, 'id'>,
  ) => {
    const { error } = await this.supabaseClient.rpc('update_rental', {
      p_rental_id: id,
      p_date_return: rentalUpdate.dateReturn,
      p_deposit_returned: rentalUpdate.depositReturned,
      p_items: rentalUpdate.gear
        .concat(rentalUpdate.topos)
        .map(({ id, returned_amount }) => ({
          item_id: id,
          returned_amount,
        })),
      // @ts-expect-error: type generation doesn't work for nullable function types
      p_comments: rentalUpdate.comments ?? null,
    });
    if (error) console.warn('updateRental: ', error);
    return { error: error?.message };
  };

  readonly editRental = async (
    id: RentalId,
    rental: Omit<Omit<UnsavedRental, 'memberId'>, 'boardMemberId'>,
  ) => {
    const { error } = await this.supabaseClient.rpc('edit_rental', {
      p_rental_id: id,
      // @ts-expect-error: type generation doesn't work for nullable function types
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_items: Object.entries(rental.gear)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          item_id: id,
          rented_amount: amount,
        }))
        .concat(
          Object.entries(rental.topos)
            .filter(([_, amount]) => amount !== undefined)
            .map(([id, amount]) => ({
              item_id: id,
              rented_amount: amount,
            })),
        ),
      p_payment_method: rental.paymentMethod,
      // @ts-expect-error: type generation doesn't work for nullable function types
      p_comments: rental.comments ?? null,
    });
    if (error) console.warn('editRental: ', error);
    return { error: error?.message };
  };

  readonly getRentalsForUser = async (userId: UserId) => {
    const { data } = await this.supabaseClient
      .from('Rentals')
      .select(
        `
          id,
          date_borrow,
          date_return,
          deposit,
          deposit_returned,
          payment_method,
          RentedItems(
            RentalItems(id, name, item_type),
            rented_amount,
            returned_amount,
            lost_amount
          )
        `,
      )
      .eq('member_id', userId)
      .throwOnError();

    return data;
  };
}

// Mappers

type RentalSummaryVo = Awaited<ReturnType<RentalService['getRentals']>>[number];

export const rentalSummaryFromDb = (args: RentalSummaryVo): RentalSummary => {
  const contactInfo: ContactInfo = contactInfoFromDb(args);

  return new RentalSummary({
    id: createRentalId(args.id),
    gear: extractGearItems(args.RentedItems),
    topos: extractTopoItems(args.RentedItems),
    memberName: contactInfo.fullName,
    dateReturn: args.date_return,
    dateBorrow: args.date_borrow,
    depositReturned: args.deposit_returned,
    depositFee: createDepositFee(args.deposit),
  });
};

type RentalDetailsVo = Awaited<ReturnType<RentalService['getRental']>>;

export const rentalDetailsFromDb = (args: RentalDetailsVo): RentalDetails => {
  const contactInfo: ContactInfo = contactInfoFromDb(args);

  return new RentalDetails({
    id: createRentalId(args.id),
    gear: extractGearItems(args.RentedItems),
    topos: extractTopoItems(args.RentedItems),
    contactInfo,
    dateReturn: args.date_return,
    dateBorrow: args.date_borrow,
    depositReturned: args.deposit_returned,
    depositFee: createDepositFee(args.deposit),
    // Due to RLS board_member is only available for board members.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    boardMember: args.board_member ? getFullName(args.board_member) : '',
    paymentMethod: args.payment_method,
    comments: args.comments ?? '',
    memberId: args.member === null ? undefined : createUserId(args.member.id),
  });
};

type PublicRentalDetailsVo = Awaited<
  ReturnType<RentalService['getRentalsForUser']>
>[number];

export const publicRentalDetailsFromDb = (
  args: PublicRentalDetailsVo,
): PublicRentalDetails => {
  return new PublicRentalDetails({
    id: createRentalId(args.id),
    gear: extractGearItems(args.RentedItems),
    topos: extractTopoItems(args.RentedItems),
    dateReturn: args.date_return,
    dateBorrow: args.date_borrow,
    depositReturned: args.deposit_returned,
    depositFee: createDepositFee(args.deposit),
    paymentMethod: args.payment_method,
  });
};

export const contactInfoFromDb = (args: {
  member: {
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string | null;
  } | null;
  contact_info: string | null;
}): ContactInfo => {
  if (args.member) return contactInfoFromMember(args.member);
  if (args.contact_info) return contactInfoFromJsonString(args.contact_info);
  return {
    fullName: 'Failed to get contact info',
    email: undefined,
    phoneNumber: undefined,
  };
};

const contactInfoFromMember = (member: {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string | null;
}): ContactInfo => {
  return {
    fullName: getFullName(member),
    email: member.email,
    phoneNumber: member.phone_number ?? undefined,
  };
};

const contactInfoFromJsonString = (jsonString: string): ContactInfo => {
  const parsed = contactInfoSchema.parse(JSON.parse(jsonString));
  return {
    fullName: parsed.fullName,
    email: parsed.email,
    phoneNumber: parsed.phoneNumber,
  };
};

const contactInfoSchema = zodObject({
  fullName: zodString().nonempty(),
  email: zodString().nonempty().optional(),
  phoneNumber: zodString().nonempty().optional(),
});

type RentalItemDb = {
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
  RentalItems: { id: string; name: string; item_type: 'gear' | 'topo' };
};

const extractTopoItems = (items: RentalItemDb[]): RentalItem[] =>
  items
    .filter((item) => item.RentalItems.item_type === 'topo')
    .map(topoItemFromDb);

const extractGearItems = (items: RentalItemDb[]): RentalItem[] =>
  items
    .filter((item) => item.RentalItems.item_type === 'gear')
    .map(gearItemFromDb);

const topoItemFromDb = (topo: {
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
  RentalItems: { id: string; name: string };
}) =>
  new RentalItem({
    id: createRentalItemId(topo.RentalItems.id),
    name: topo.RentalItems.name,
    rentedAmount: topo.rented_amount,
    returnedAmount: topo.returned_amount,
    lostAmount: topo.lost_amount,
    type: 'topo',
  });

const gearItemFromDb = (gear: {
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
  RentalItems: { id: string; name: string };
}) =>
  new RentalItem({
    id: createGearItemId(gear.RentalItems.id),
    name: gear.RentalItems.name,
    rentedAmount: gear.rented_amount,
    returnedAmount: gear.returned_amount,
    lostAmount: gear.lost_amount,
    type: 'gear',
  });
