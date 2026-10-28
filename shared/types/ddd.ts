import { uuid as zodUuid, type infer as ZodInfer } from 'zod';

export const entityIdSchema = <Entity extends PropertyKey>(entity: Entity) =>
  zodUuid().brand<Entity>(entity);

export type EntityId<Entity extends PropertyKey = PropertyKey> = ZodInfer<
  ReturnType<typeof entityIdSchema<Entity>>
>;
