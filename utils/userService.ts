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
}

let userServiceInstance: UserService | undefined = undefined;
export function userService(): UserService {
  if (userServiceInstance === undefined)
    userServiceInstance = new UserService();
  return userServiceInstance;
}
