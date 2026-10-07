import luakEventHandler from '#server/luakEventHandler';
import { serverSupabaseUser } from '#supabase/server';
import type { TopoLibraryItem } from '#shared/api/rest/topo';

export default luakEventHandler(
  async ({ topoService, userRepo }, event): Promise<TopoLibraryItem[]> => {
    const user = await serverSupabaseUser(event);
    const isBoard =
      user === null ? false : await userRepo().isBoardMember(user.sub);
    return topoService().getTopoLibrary({ includeOutOfStock: isBoard });
  },
);
