import { type infer as ZodInfer, uuid as zodUuid } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const entityIdSchema = <Entity extends PropertyKey>() =>
  zodUuid().brand<Entity>();

export type EntityId<Entity extends PropertyKey = PropertyKey> = ZodInfer<
  ReturnType<typeof entityIdSchema<Entity>>
>;
