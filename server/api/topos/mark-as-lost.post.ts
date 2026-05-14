import { z } from 'zod';
import { gearDao } from '~/server/repository/gear';
import { itemLostEvent, type TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

const lostTopo = z.object({
  rentalId: z.uuid(),
  topoId: z.uuid(),
  lostAmount: z.number().min(1),
});

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    lostTopo.safeParse(body),
  );

  if (!result.success)
    throw createError({
      status: 400,
      message: result.error.message,
      cause: result.error,
    });

  const gearRepository = await gearDao(event);

  await gearRepository.saveInventoryItemEvent({
    itemType: 'topo',
    itemId: result.data.topoId as TopoId,
    event: itemLostEvent(
      result.data.rentalId as RentalId,
      result.data.lostAmount,
    ),
  });
});
