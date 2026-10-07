import type { SupabaseClient } from '@supabase/supabase-js';
import { parseEvent } from '#server/domain/inventory/ItemEvent';
import type {
  TopoInventoryItemEvent,
  TopoLibraryRecord,
  TopoRecord,
  TopoRepository,
  TopoSummary,
} from '#server/domain/topo/repository';

export class SupabaseTopoRepository implements TopoRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getDetails(topoId: TopoId): Promise<TopoRecord> {
    const { data: topo } = await this.supabaseClient
      .from('Topos')
      .select('*')
      .eq('id', topoId)
      .single()
      .throwOnError();

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

  async getTopoLibrary(): Promise<TopoLibraryRecord[]> {
    const { data } = await this.supabaseClient
      .from('Topos')
      .select(
        'id, authors, condition, countries, place_in_library, tags, title, types_of_climbing, year_published, amount',
      )
      .throwOnError();

    return data.map((topo) => ({
      id: topo.id as TopoId,
      authors: topo.authors,
      condition: topo.condition,
      countries: topo.countries,
      placeInLibrary: topo.place_in_library,
      tags: topo.tags,
      title: topo.title,
      typesOfClimbing: topo.types_of_climbing,
      yearPublished: topo.year_published,
      initialAmount: topo.amount,
    }));
  }

  async getTopos(): Promise<TopoSummary[]> {
    const { data } = await this.supabaseClient
      .from('Topos')
      .select('id, title, amount, year_published')
      .throwOnError();

    return data.map((topo) => ({
      id: topo.id as TopoId,
      title: topo.title,
      initialAmount: topo.amount,
      yearPublished: topo.year_published,
    }));
  }

  async getAllTopoInventoryItemEvents(): Promise<TopoInventoryItemEvent[]> {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', 'topo')
      .throwOnError();

    return data.map((it) => ({
      topoId: it.item_id as TopoId,
      occurredOn: it.occured_on,
      ...parseEvent(it.event),
    }));
  }
}
