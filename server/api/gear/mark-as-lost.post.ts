import { object as zodObject, uuid as zodUuid, number as zodNumber } from 'zod';
import type { ZodType } from 'zod';
import { itemLostEvent } from '~/model/gear';
import luakEventHandler from '~/server/luakEventHandler';
import type { EntityId } from '~/types/ddd';
import type { GearItemId, GearInventoryId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

const zodEntityId = <T extends EntityId<unknown> = never>() =>
  zodUuid() as unknown as ZodType<T>;

const bodySchema = zodObject({
  rentalId: zodEntityId<RentalId>(),
  inventoryId: zodEntityId<GearInventoryId>(),
  gearItemId: zodEntityId<GearItemId>(),
  lostAmount: zodNumber().min(1),
});

export default luakEventHandler(async ({ gearRepo, rentalRepo }, event) => {
  const result = await readValidatedBody(event, (body) =>
    bodySchema.safeParse(body),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  const { rentalId, inventoryId, gearItemId, lostAmount } = result.data;

  await gearRepo().saveInventoryItemEvent({
    itemType: 'gear',
    itemId: inventoryId,
    event: itemLostEvent(rentalId, lostAmount),
  });

  await rentalRepo().incrementLostAmount({
    rentalId,
    itemId: gearItemId,
    itemType: 'gear',
    lostAmount,
  });
});
