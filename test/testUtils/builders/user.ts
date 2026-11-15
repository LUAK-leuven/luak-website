import { TestUser } from '#test/TestUser';

const userSequence = 0;

export const aRandomTestUser = () =>
  new TestUser({
    firstName: `Generated_${userSequence.toFixed()}`,
    lastName: `Test User ${userSequence.toFixed()}`,
    email: `generated_${crypto.randomUUID()}@test.com`,
  });
