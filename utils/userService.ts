import type { UserId } from '~/types/user';

class UserService {
  public async getAllUsers() {
    return useAsyncData(
      'allUsers',
      async () => {
        const { data: users, error } = await useSupabaseClient()
          .from('Users')
          .select(
            `
        id,
        email,
        first_name,
        last_name,
        phone_number,
        Memberships (
          created_at,
          Payments (
            approved
          )
        )
        `,
          );
        if (error) {
          console.error('allUsers:', error);
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
                isActiveMembership(membership.created_at) &&
                membership.Payments.some((payment) => payment.approved),
            ).length > 0,
        }));
      },
      { lazy: true },
    );
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
