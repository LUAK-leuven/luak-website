import { z } from 'zod';
import { itemLostEvent } from '~/model/gear';
import luakEventHandler from '~/server/luakEventHandler';
import type { TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

const lostTopo = z.object({
  rentalId: z.uuid(),
  topoId: z.uuid(),
  lostAmount: z.number().min(1),
});

export default luakEventHandler(async ({ gearRepo }, event) => {
  const result = await readValidatedBody(event, (body) =>
    lostTopo.safeParse(body),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  await gearRepo().saveInventoryItemEvent({
    itemType: 'topo',
    itemId: result.data.topoId as TopoId,
    rentalId: result.data.rentalId as RentalId,
    event: itemLostEvent(result.data.lostAmount),
  });
});
