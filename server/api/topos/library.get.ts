import luakEventHandler from '#server/luakEventHandler';
import type { TopoLibraryItem } from '#shared/api/rest/topo';

export default luakEventHandler(
  async ({
    services: { topoService, userRepo },
    userId,
  }): Promise<TopoLibraryItem[]> => {
    const isBoard =
      userId === undefined ? false : await userRepo().isBoardMember(userId);
    return topoService().getTopoLibrary({ includeOutOfStock: isBoard });
  },
);
