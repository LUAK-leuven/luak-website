import type { EntityId } from '#shared/types/ddd';
import type { RentalId } from '#shared/types/rental';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';

export type TopoId = EntityId<'topo'>;

export type TopoCondition =
  'as_good_as_new' | 'good' | 'used' | 'damaged' | 'falling_appart' | null;

export type TopoEvent = InventoryItemEvent;

export type TopoDetails = {
  id: TopoId;
  title: string;
  authors: string[];
  condition: TopoCondition;
  countries: string[];
  typesOfClimbing: string[];
  details: string | undefined;
  languages: string[];
  placeInLibrary: string;
  tags: string[];
  yearPublished: number | null;
  initialAmount: number;
  amount: number;
  events: TopoEvent[];
  rentals: {
    id: RentalId;
    rentedAmount: number;
    memberName: string;
  }[];
};

export type TopoLibraryItem = {
  id: TopoId;
  authors: string[];
  condition: TopoCondition;
  countries: string[];
  placeInLibrary: string;
  tags: string[];
  title: string;
  typesOfClimbing: string[];
  yearPublished: number | null;
  amount: number;
};

export type TopoListItem = {
  id: TopoId;
  title: string;
  totalAmount: number;
  availableAmount: number;
  yearPublished: number | null;
};
