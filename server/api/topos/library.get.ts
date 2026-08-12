import luakEventHandler from '#server/luakEventHandler';
import { serverSupabaseUser } from '#supabase/server';
import type { H3Event } from '#build/types/nitro-imports';
import type { SupabaseClient } from '@supabase/supabase-js';

export default luakEventHandler(
  async ({ topoService, supabase }, event): Promise<TopoLibraryItem[]> => {
    const isBoard = await _isBoard({ event, supabase });
    const topos = await topoService().getTopoLibrary();
    if (isBoard) return topos;
    else return topos.filter((topo) => topo.amount > 0);
  },
);

const _isBoard = async (args: {
  event: H3Event;
  supabase: SupabaseClient<Database>;
}): Promise<boolean> => {
  const user = await serverSupabaseUser(args.event);
  if (user === null) return false;
  const { data } = await args.supabase
    .from('BoardMembers')
    .select('user_id')
    .eq('user_id', user.sub)
    .throwOnError();
  return data.length > 0;
};
