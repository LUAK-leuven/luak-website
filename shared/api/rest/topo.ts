import type { TopoId } from '#shared/types/gear';
import type { RentalId } from '#shared/types/rental';

export type TopoItemLostEvent = {
  eventName: 'ItemLostEvent';
  rentalId?: RentalId | undefined;
  lostAmount: number;
  occurredOn: string;
};

export type TopoItemArchivedEvent = {
  eventName: 'ItemArchivedEvent';
  amount: number;
  occurredOn: string;
};

export type TopoEvent = TopoItemLostEvent | TopoItemArchivedEvent;

export type TopoDetails = {
  id: TopoId;
  title: string;
  authors: string[];
  condition: Database['public']['Enums']['topo_condition'] | null;
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
