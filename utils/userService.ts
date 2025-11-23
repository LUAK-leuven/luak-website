import type { Database } from '~/types/database.types';

class UserService {
  private readonly user = useSupabaseUser();
  private readonly supabase = useSupabaseClient<Database>();

  public async getUserInfo(userId?: string) {
    if (userId === undefined) {
      userId = this.user.value?.id;
    }
    if (userId === undefined) return undefined;
    const { data } = await this.supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }

  public async getAllUsers() {
    const { data: users } = await this.supabase.from('Users').select(
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

    if (users === null) return [];
    return users.map((user) => ({
      id: user.id,
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
