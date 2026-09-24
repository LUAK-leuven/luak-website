import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { object as zodObject, string as zodString } from 'zod';

import type { RentalRepository } from '#server/domain/rental/RentalRepository';
import { Rental } from '#server/domain/rental/Rental';
import type { RentalId } from '~~/shared/api/rest/rental';

export class RentalDao implements RentalRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getRentals(): Promise<Rental[]> {
    const { data } = await this.supabaseClient
      .from('Rentals')
      .select('*')
      .throwOnError();

    return data.map(
      (rental) =>
        new Rental({
          id: rental.id as RentalId,
          boardMemberId: rental.board_member_id as UserId,
          memberId: (rental.member_id ?? undefined) as UserId | undefined,
          dateBorrowed: dayjs(rental.date_borrow),
          expectedReturnDate: dayjs(rental.date_return),
          deposit: rental.deposit,
          depositReturned: rental.deposit_returned,
          paymentMethod: rental.payment_method,
          contactInfo: this.contactInfoFromDb(rental.contact_info),
          comments: rental.comments ?? '',
        }),
    );
  }

  private contactInfoFromDb(contactInfo: string | null): Rental['contactInfo'] {
    if (contactInfo === null) return undefined;
    const parsedContactInfo = this.contactInfoSchema.parse(
      JSON.parse(contactInfo),
    );
    return {
      fullName: parsedContactInfo.fullName,
      email: parsedContactInfo.email,
      phoneNumber: parsedContactInfo.phoneNumber,
    };
  }

  private readonly contactInfoSchema = zodObject({
    fullName: zodString().nonempty(),
    email: zodString().nonempty().optional(),
    phoneNumber: zodString().nonempty().optional(),
  });
}
