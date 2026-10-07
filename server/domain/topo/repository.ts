import type { ItemEvent } from '#server/domain/inventory/ItemEvent';

export type TopoRecord = {
  totalAmount: number;
  authors: string[];
  condition: Database['public']['Enums']['topo_condition'] | null;
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
  condition: Database['public']['Enums']['topo_condition'] | null;
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

export interface TopoRepository {
  getDetails(topoId: TopoId): Promise<TopoRecord>;
  getTopoLibrary(): Promise<TopoLibraryRecord[]>;
  getTopos(): Promise<TopoSummary[]>;
  getAllTopoInventoryItemEvents(): Promise<TopoInventoryItemEvent[]>;
}
