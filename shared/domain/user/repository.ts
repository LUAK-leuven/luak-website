import type { UserId } from '#shared/api/rest/user';

export interface UserRepository {
  isBoardMember(userId: UserId): Promise<boolean>;
}
