import { uuid as zodUuid, type infer as ZodInfer } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const entityIdSchema = <Entity extends PropertyKey>() =>
  zodUuid().brand<Entity>();

export type EntityId<Entity extends PropertyKey = PropertyKey> = ZodInfer<
  ReturnType<typeof entityIdSchema<Entity>>
>;
