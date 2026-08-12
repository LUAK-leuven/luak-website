import type { TestUserKey } from '#test/TestUser';
import { $fetch } from '@nuxt/test-utils/e2e';
import type { TestUserService } from '#test/TestUserService';

export class ServerTestService {
  private cookies: Partial<Record<TestUserKey, string>> = {};

  constructor(private readonly testUserService: TestUserService) {}

  readonly fetch = async (url: string, testUser: TestUserKey) => {
    if (this.cookies[testUser] === undefined) {
      this.cookies[testUser] = await this.getTestUserAuthHeaders(testUser);
    }

    return await $fetch(url, {
      headers: {
        Cookie: `sb-127-auth-token=base64-${this.cookies[testUser]}`,
      },
    });
  };

  private readonly getTestUserAuthHeaders = async (testUser: TestUserKey) => {
    const session = await this.testUserService.getTestUserSession(testUser);

    return btoa(JSON.stringify(session));
  };
}
