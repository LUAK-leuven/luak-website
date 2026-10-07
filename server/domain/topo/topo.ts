import type { ItemEvent } from '#server/domain/inventory/ItemEvent';
import type {
  TopoCondition,
  TopoDetails as TopoDetailsDto,
  TopoId,
  TopoLibraryItem as TopoLibraryItemDto,
  TopoListItem as TopoListItemDto,
} from '#shared/api/rest/topo';

export type { TopoCondition } from '#shared/api/rest/topo';
export type { TopoId } from '#shared/api/rest/topo';

export type TopoDetails = TopoDetailsDto;
export type TopoLibraryItem = TopoLibraryItemDto;
export type TopoListItem = TopoListItemDto;

export type TopoRecord = {
  totalAmount: number;
  authors: string[];
  condition: TopoCondition;
  countries: string[];
  details: string | undefined;
  id: TopoId;
  languages: string[];
  place_in_library: string;
  tags: string[];
  title: string;
  types_of_climbing: string[];
  year_published: number | null;
};

export type TopoLibraryRecord = {
  id: TopoId;
  authors: string[];
  condition: TopoCondition;
  countries: string[];
  placeInLibrary: string;
  tags: string[];
  title: string;
  typesOfClimbing: string[];
  yearPublished: number | null;
  initialAmount: number;
};

export type TopoSummary = {
  id: TopoId;
  title: string;
  initialAmount: number;
  yearPublished: number | null;
};

export type TopoInventoryItemEvent = ItemEvent & {
  topoId: TopoId;
  occurredOn: string;
};
