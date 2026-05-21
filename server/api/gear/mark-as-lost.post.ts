import { object as zodObject, uuid as zodUuid, number as zodNumber } from 'zod';
import type { ZodType } from 'zod';
import { itemLostEvent } from '~/model/gear';
import luakEventHandler from '~/server/luakEventHandler';
import type { EntityId } from '~/types/ddd';
import type { GearInventoryId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

const zodEntityId = <T extends EntityId<unknown> = never>() =>
  zodUuid() as unknown as ZodType<T>;

const bodySchema = zodObject({
  rentalId: zodEntityId<RentalId>(),
  inventoryId: zodEntityId<GearInventoryId>(),
  lostAmount: zodNumber().min(1),
});

export default luakEventHandler(async ({ gearRepo }, event) => {
  const result = await readValidatedBody(event, (body) =>
    bodySchema.safeParse(body),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  await gearRepo().saveInventoryItemEvent({
    itemType: 'gear',
    itemId: result.data.inventoryId,
    rentalId: result.data.rentalId,
    event: itemLostEvent(result.data.lostAmount),
  });
});
