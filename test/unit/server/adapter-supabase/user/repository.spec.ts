import { describe, expect, test } from 'vitest';
import { SupabaseUserRepository } from '#server/adapter-supabase/user/repository';

describe('SupabaseUserRepository', () => {
  test('reports whether a user is a board member', async () => {
    const userId = crypto.randomUUID();
    const supabase = {
      from: (table: string) => {
        expect(table).toBe('BoardMembers');
        return {
          select: (columns: string) => {
            expect(columns).toBe('user_id');
            return {
              eq: (column: string, value: string) => {
                expect(column).toBe('user_id');
                expect(value).toBe(userId);
                return {
                  throwOnError: () =>
                    Promise.resolve({ data: [{ user_id: value }] }),
                };
              },
            };
          },
        };
      },
    };

    const repository = new SupabaseUserRepository(supabase as never);

    await expect(repository.isBoardMember(userId)).resolves.toBe(true);
  });

  test('reports false when the user is not a board member', async () => {
    const userId = crypto.randomUUID();
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            throwOnError: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
    };

    const repository = new SupabaseUserRepository(supabase as never);

    await expect(repository.isBoardMember(userId)).resolves.toBe(false);
  });
});
