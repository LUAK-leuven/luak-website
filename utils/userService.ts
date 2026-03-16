import type { Database } from '~/types/database.types';
import type { UserId } from '~/types/user';

class UserService {
  // private readonly getMembershipInfo = async () => {
  //   const { data, error } = await useAsyncData(
  //     'membershipInfo',
  //     async () => {
  //       const user = useSupabaseUser();
  //       if (user.value === null) return undefined;
  //       const { data, error } = await useSupabaseClient<Database>()
  //         .from('Users')
  //         .select(
  //           'first_name, last_name, Memberships(year, Payments(approved))',
  //         )
  //         .eq('id', user.value.id)
  //         .eq('Memberships.Payments.approved', true)
  //         .single();
  //       if (error) {
  //         console.warn('error', error);
  //         throw error;
  //       }
  //       return data.Memberships.filter(({ Payments }) =>
  //         Payments.some(({ approved }) => approved),
  //       ).map(({ year }) => year);
  //     },
  //     { lazy: false },
  //   );
  //   if (error) console.warn('membershipInfo', error);
  //   return data.value ?? undefined;
  // };

  // public async wasMemberLastYear() {
  //   const paidMemberships = await this.getMembershipInfo();
  //   if (paidMemberships === undefined) return false;
  //   const currentYear = getLuakYear();
  //   return (
  //     !paidMemberships.includes(currentYear) &&
  //     paidMemberships.includes(currentYear - 1)
  //   );
  // }

  // public async isFirstTimeMember() {
  //   const paidMemberships = await this.getMembershipInfo();
  //   if (paidMemberships === undefined) return false;
  //   return paidMemberships.length === 0;
  // }

  public async getAllUsers() {
    return useAsyncData('allUsers', async () => {
      const { data: users, error } = await useSupabaseClient<Database>()
        .from('Users')
        .select(
          `
        id,
        email,
        first_name,
        last_name,
        phone_number,
        Memberships (
          year,
          Payments (
            approved
          )
        )
        `,
        );
      if (error || users === null) {
        if (error) console.error('allUsers:', error);
        return [];
      }

      return users.map((user) => ({
        id: user.id as UserId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number ?? undefined,
        paid_membership:
          user.Memberships.filter(
            (membership) =>
              membership.year === getLuakYear() &&
              membership.Payments.filter((payment) => payment.approved).length >
                0,
          ).length > 0,
      }));
    });
  }
}

let userServiceInstance: UserService | undefined = undefined;
export function userService(): UserService {
  if (userServiceInstance === undefined)
    userServiceInstance = new UserService();
  return userServiceInstance;
}

export function getFullName(user: { first_name: string; last_name: string }) {
  return user.first_name + ' ' + user.last_name;
}
