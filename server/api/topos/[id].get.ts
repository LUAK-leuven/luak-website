import { object as zodObject } from 'zod';

import luakEventHandler from '#server/luakEventHandler';
import { topoIdSchema } from '#shared/api/rest/topo';

const lostTopoSchema = zodObject({
  id: topoIdSchema,
});

export default luakEventHandler(
  async ({ services: { topoService }, getRouterParams }) => {
    const { id: topoId } = await getRouterParams(lostTopoSchema);

    const topoDetails = await topoService().getDetails(topoId);

    return topoDetails;
  },
);
