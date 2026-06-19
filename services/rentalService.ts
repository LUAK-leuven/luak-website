import type { RentalId, RentalUpdate, UnsavedRental } from '~/types/rental';
import type { GearItemId, TopoId } from '~/types/gear';
import type { UserId } from '~/types/user';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import {
  ContactInfo,
  RentalSummary,
  RentalDetails,
  RentalTopoItem,
  RentalGearItem,
} from '~/model/Rental';
import { getFullName } from '~/services/userService';
import { object as zodObject, string as zodString } from 'zod';

export class RentalService {
  constructor(
    private readonly supabaseClient: SupabaseClient<Database> = useSupabaseClient(),
  ) {}

  readonly saveRental = async (
    rental: UnsavedRental,
  ): Promise<{ id: RentalId | undefined; error: string | undefined }> => {
    const { error, data } = await this.supabaseClient.rpc('create_rental', {
      p_board_member_id: rental.boardMemberId,
      p_member_id: rental.memberId ?? null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_gear: Object.entries(rental.gear)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          gear_item_id: id,
          rented_amount: amount,
        })),
      p_topos: Object.entries(rental.topos)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          topo_id: id,
          rented_amount: amount,
        })),
      p_payment_method: rental.paymentMethod,
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      p_comments: rental.comments ?? null,
    });

    return {
      id: (data as RentalId | null) ?? undefined,
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
          RentedGear(
            gear_item_id,
            rented_amount,
            returned_amount,
            lost_amount,
            GearItems(name)
          ),
          RentedTopos(
            topo_id,
            Topos(title),
            rented_amount,
            returned_amount,
            lost_amount
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
          RentedGear(
            gear_item_id,
            GearItems(name),
            rented_amount,
            returned_amount,
            lost_amount
          ),
          RentedTopos(
            topo_id,
            Topos(title),
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
      p_gear: rentalUpdate.gear,
      p_topos: rentalUpdate.topos,
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
      p_contact_info: rental.contactInfo
        ? JSON.stringify(rental.contactInfo)
        : null,
      p_date_borrow: rental.dateBorrow,
      p_date_return: rental.dateReturn,
      p_deposit: rental.depositFee,
      p_gear: Object.entries(rental.gear)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          gear_item_id: id,
          rented_amount: amount,
        })),
      p_topos: Object.entries(rental.topos)
        .filter(([_, amount]) => amount !== undefined)
        .map(([id, amount]) => ({
          topo_id: id,
          rented_amount: amount,
        })),
      p_payment_method: rental.paymentMethod,
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
          RentedGear(
            gear_item_id,
            GearItems(name),
            rented_amount,
            returned_amount,
            lost_amount
          ),
          RentedTopos(
            topo_id,
            Topos(title),
            rented_amount,
            returned_amount,
            lost_amount
          ),
          contact_info,
          comments
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
    id: args.id as RentalId,
    gear: args.RentedGear.map((gear) => gearItemFromDb(gear)),
    topos: args.RentedTopos.map((topo) => topoItemFromDb(topo)),
    memberName: contactInfo.fullName,
    dateReturn: args.date_return,
    dateBorrow: args.date_borrow,
    depositReturned: args.deposit_returned,
  });
};

type RentalDetailsVo = Awaited<ReturnType<RentalService['getRental']>>;

export const rentalDetailsFromDb = (args: RentalDetailsVo): RentalDetails => {
  const contactInfo: ContactInfo = contactInfoFromDb(args);

  return new RentalDetails({
    id: args.id as RentalId,
    gear: args.RentedGear.map((gear) => gearItemFromDb(gear)),
    topos: args.RentedTopos.map((topo) => topoItemFromDb(topo)),
    contactInfo,
    dateReturn: args.date_return,
    dateBorrow: args.date_borrow,
    depositReturned: args.deposit_returned,
    depositFee: args.deposit,
    // Due to RLS board_member is only available for board members.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    boardMember: args.board_member ? getFullName(args.board_member) : '',
    paymentMethod: args.payment_method,
    comments: args.comments ?? '',
    memberId: args.member?.id as UserId | undefined,
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
}) => {
  if (args.member) return contactInfoFromMember(args.member);
  if (args.contact_info) return contactInfoFromJsonString(args.contact_info);
  return new ContactInfo('Failed to get contact info', undefined, undefined);
};

const contactInfoFromMember = (member: {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string | null;
}): ContactInfo => {
  return new ContactInfo(
    getFullName(member),
    member.email,
    member.phone_number ?? undefined,
  );
};

const contactInfoFromJsonString = (jsonString: string): ContactInfo => {
  const parsed = contactInfoSchema.parse(JSON.parse(jsonString));
  return new ContactInfo(parsed.fullName, parsed.email, parsed.phoneNumber);
};

const contactInfoSchema = zodObject({
  fullName: zodString().nonempty(),
  email: zodString().nonempty().optional(),
  phoneNumber: zodString().nonempty().optional(),
});

const topoItemFromDb = (topo: {
  topo_id: string;
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
  Topos: { title: string };
}) =>
  new RentalTopoItem({
    id: topo.topo_id as TopoId,
    name: topo.Topos.title,
    rentedAmount: topo.rented_amount,
    returnedAmount: topo.returned_amount,
    lostAmount: topo.lost_amount,
  });

const gearItemFromDb = (gear: {
  gear_item_id: string;
  rented_amount: number;
  returned_amount: number;
  lost_amount: number;
  GearItems: { name: string };
}) =>
  new RentalGearItem({
    id: gear.gear_item_id as GearItemId,
    name: gear.GearItems.name,
    rentedAmount: gear.rented_amount,
    returnedAmount: gear.returned_amount,
    lostAmount: gear.lost_amount,
  });
