import { z } from 'zod';
import { itemLostEvent } from '~/model/gear';
import luakEventHandler from '~/server/luakEventHandler';
import type { TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

const lostTopo = z.object({
  rentalId: z.uuid() as unknown as z.ZodType<RentalId>,
  topoId: z.uuid() as unknown as z.ZodType<TopoId>,
  lostAmount: z.number().min(1),
});

export default luakEventHandler(async ({ gearRepo, rentalRepo }, event) => {
  const result = await readValidatedBody(event, (body) =>
    lostTopo.safeParse(body),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  const { rentalId, topoId, lostAmount } = result.data;

  await gearRepo().saveInventoryItemEvent({
    itemType: 'topo',
    itemId: topoId,
    event: itemLostEvent(rentalId, lostAmount),
  });

  await rentalRepo().incrementLostAmount({
    rentalId,
    itemId: topoId,
    itemType: 'topo',
    lostAmount,
  });
});
