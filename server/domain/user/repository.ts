export interface UserRepository {
  isBoardMember(userId: string): Promise<boolean>;
}
