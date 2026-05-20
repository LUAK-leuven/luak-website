import type { Database } from '~/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TopoId } from '~/types/gear';

export class TopoDao {
  private readonly supabaseClient;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabaseClient = supabaseClient;
  }

  async getDetails(topoId: TopoId) {
    const { data: topo, error } = await this.supabaseClient
      .from('Topos')
      .select('*')
      .eq('id', topoId)
      .single();

    if (error) {
      throw new Error(`failed to get topo ${topoId}`, { cause: error });
    }

    return {
      totalAmount: topo.amount,
      authors: topo.authors,
      condition: topo.condition,
      countries: topo.countries,
      details: topo.details ?? undefined,
      id: topo.id as TopoId,
      languages: topo.languages,
      place_in_library: topo.place_in_library,
      tags: topo.tags.map((it) => it.trimStart()),
      title: topo.title,
      types_of_climbing: topo.types_of_climbing,
      year_published: topo.year_published,
    };
  }
}
