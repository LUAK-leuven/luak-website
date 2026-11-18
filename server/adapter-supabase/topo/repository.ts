import type { SupabaseClient } from '@supabase/supabase-js';

import type { TopoRepository } from '#server/domain/topo/repository';
import type {
  TopoCondition,
  TopoId,
  TopoLibraryRecord,
  TopoSummary,
} from '#server/domain/topo/topo';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';
import {
  createInitialAmount,
  createOccurredOn,
  itemEventSchema,
} from '#shared/api/rest/inventory';
import { createRentalItemId } from '#shared/api/rest/rental/rentalItem';
import {
  createAuthor,
  createClimbingType,
  createCountry,
  createDetails,
  createLanguage,
  createPlaceInLibrary,
  createTag,
  createTitle,
  createTopoId,
  createYearPublished,
} from '#shared/api/rest/topo';
import type { Database } from '#shared/types/database.types';

type TopoRow = Database['public']['Tables']['Topos']['Row'];

export class SupabaseTopoRepository implements TopoRepository {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async getDetails(topoId: TopoId): Promise<TopoLibraryRecord> {
    const { data: topo } = await this.supabaseClient
      .from('Topos')
      .select('*')
      .eq('id', topoId)
      .single()
      .throwOnError();

    return mapTopoLibraryRecord(topo);
  }

  async getTopoLibrary(): Promise<TopoLibraryRecord[]> {
    const { data } = await this.supabaseClient
      .from('Topos')
      .select('*')
      .throwOnError();

    return data.map(mapTopoLibraryRecord);
  }

  async getTopos(): Promise<TopoSummary[]> {
    const { data } = await this.supabaseClient
      .from('Topos')
      .select('id, title, amount, year_published, Inventory(rental_item_id)')
      .throwOnError();

    return data.map((topo) => ({
      id: createTopoId(topo.id),
      rentalItemId: createRentalItemId(topo.Inventory.rental_item_id!),
      title: createTitle(topo.title),
      initialAmount: createInitialAmount(topo.amount),
      yearPublished: mapYearPublished(topo.year_published),
    }));
  }

  async getAllTopoInventoryItemEvents(): Promise<
    Partial<Record<TopoId, InventoryItemEvent[]>>
  > {
    const { data } = await this.supabaseClient
      .from('Topos')
      .select('id, Inventory(InventoryItemEvents(occured_on, event))')
      .throwOnError();

    const x: [TopoId, InventoryItemEvent[]][] = data.map((it) => [
      createTopoId(it.id),
      it.Inventory.InventoryItemEvents.map((event) => ({
        occurredOn: createOccurredOn(event.occured_on),
        ...itemEventSchema.parse(event.event),
      })),
    ]);

    return objectFrom(x);
  }
}

const mapTopoLibraryRecord = (topo: TopoRow): TopoLibraryRecord => ({
  id: createTopoId(topo.id),
  title: createTitle(topo.title),
  authors: mapAuthors(topo.authors),
  details: mapDetails(topo.details),
  condition: mapTopoCondition(topo.condition),
  countries: mapCountries(topo.countries),
  tags: mapTags(topo.tags),
  placeInLibrary: createPlaceInLibrary(topo.place_in_library),
  typesOfClimbing: mapClimbingTypes(topo.types_of_climbing),
  yearPublished: mapYearPublished(topo.year_published),
  amount: createInitialAmount(topo.amount),
  languages: mapLanguages(topo.languages),
});

const mapAuthors = (authors: TopoRow['authors']) =>
  authors.map((it) => createAuthor(it));

const mapCountries = (countries: TopoRow['countries']) =>
  countries.map((it) => createCountry(it));

const mapTags = (tags: TopoRow['tags']) =>
  tags.map((it) => createTag(it.trim()));

const mapClimbingTypes = (typesOfClimbing: TopoRow['types_of_climbing']) =>
  typesOfClimbing.map((it) => createClimbingType(it));

const mapYearPublished = (yearPublished: TopoRow['year_published']) =>
  yearPublished === null ? undefined : createYearPublished(yearPublished);

export const mapTopoCondition = (
  condition: Database['public']['Enums']['topo_condition'] | null,
): TopoCondition => {
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
};

const mapDetails = (details: TopoRow['details']) => {
  if (details === null) return undefined;
  const trimmedDetails = details.trim();
  if (trimmedDetails === '') return undefined;
  return createDetails(details.trim());
};

const mapLanguages = (languages: TopoRow['languages']) =>
  languages.map((it) => createLanguage(it));
