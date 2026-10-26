import type { SupabaseClient } from '@supabase/supabase-js';
import { parseEvent } from '#server/domain/inventory/ItemEvent';
import type {
  TopoCondition,
  TopoInventoryItemEvent,
  TopoLibraryRecord,
  TopoRecord,
  TopoSummary,
  TopoId,
} from '#server/domain/topo/topo';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { Database } from '#shared/types/database.types';
import {
  createInitialAmount,
  createYearPublished,
  createAuthor,
  createCountry,
  createDetails,
  createTopoId,
  createLanguage,
  createPlaceInLibrary,
  createTag,
  createTitle,
  createClimbingType,
} from '#shared/api/rest/topo';
import type { Date } from '#shared/types/common';

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
      totalAmount: createInitialAmount(topo.amount),
      authors: topo.authors.map((it) => createAuthor(it)),
      condition: mapTopoCondition(topo.condition),
      countries: topo.countries.map((it) => createCountry(it)),
      details: topo.details === null ? undefined : createDetails(topo.details),
      id: createTopoId(topo.id),
      languages: topo.languages.map((it) => createLanguage(it)),
      place_in_library: createPlaceInLibrary(topo.place_in_library),
      tags: topo.tags.map((it) => createTag(it.trim())),
      title: createTitle(topo.title),
      types_of_climbing: topo.types_of_climbing.map((it) =>
        createClimbingType(it),
      ),
      year_published:
        topo.year_published === null
          ? undefined
          : createYearPublished(topo.year_published),
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
      id: createTopoId(topo.id),
      authors: topo.authors.map((it) => createAuthor(it)),
      condition: mapTopoCondition(topo.condition),
      countries: topo.countries.map((it) => createCountry(it)),
      placeInLibrary: createPlaceInLibrary(topo.place_in_library),
      tags: topo.tags.map((it) => createTag(it.trim())),
      title: createTitle(topo.title),
      typesOfClimbing: topo.types_of_climbing.map((it) =>
        createClimbingType(it),
      ),
      yearPublished:
        topo.year_published === null
          ? undefined
          : createYearPublished(topo.year_published),
      initialAmount: createInitialAmount(topo.amount),
    }));
  }

  async getTopos(): Promise<TopoSummary[]> {
    const { data } = await this.supabaseClient
      .from('Topos')
      .select('id, title, amount, year_published')
      .throwOnError();

    return data.map((topo) => ({
      id: createTopoId(topo.id),
      title: createTitle(topo.title),
      initialAmount: createInitialAmount(topo.amount),
      yearPublished:
        topo.year_published === null
          ? undefined
          : createYearPublished(topo.year_published),
    }));
  }

  async getAllTopoInventoryItemEvents(): Promise<TopoInventoryItemEvent[]> {
    const { data } = await this.supabaseClient
      .from('InventoryItemEvents')
      .select('*')
      .eq('item_type', 'topo')
      .throwOnError();

    return data.map((it) => ({
      topoId: createTopoId(it.item_id),
      occurredOn: it.occured_on as Date,
      ...parseEvent(it.event),
    }));
  }
}

export function mapTopoCondition(
  condition: Database['public']['Enums']['topo_condition'] | null,
): TopoCondition {
  switch (condition) {
    case null:
      return undefined;
    case 'as_good_as_new':
    case 'good':
    case 'used':
    case 'damaged':
    case 'falling_appart':
      return condition;
  }
}
