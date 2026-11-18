import type {
  InitialAmount,
  InventoryItemEvent,
} from '#shared/api/rest/inventory';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import type {
  Author,
  ClimbingType,
  Country,
  Details,
  Language,
  PlaceInLibrary,
  Tag,
  Title,
  TopoCondition,
  TopoDetails as TopoDetailsDto,
  TopoId,
  TopoLibraryItem as TopoLibraryItemDto,
  TopoListItem as TopoListItemDto,
  YearPublished,
} from '#shared/api/rest/topo';

export type { TopoCondition } from '#shared/api/rest/topo';
export type { TopoId } from '#shared/api/rest/topo';

export type TopoDetails = TopoDetailsDto;
export type TopoLibraryItem = TopoLibraryItemDto;
export type TopoListItem = TopoListItemDto;

export type TopoLibraryRecord = {
  id: TopoId;
  authors: Author[];
  details: Details | undefined;
  condition: TopoCondition;
  countries: Country[];
  placeInLibrary: PlaceInLibrary;
  tags: Tag[];
  title: Title;
  typesOfClimbing: ClimbingType[];
  yearPublished: YearPublished | undefined;
  amount: InitialAmount;
  languages: Language[];
};

export type TopoSummary = {
  id: TopoId;
  rentalItemId: RentalItemId;
  title: Title;
  initialAmount: InitialAmount;
  yearPublished: YearPublished | undefined;
};

export type TopoInventoryItemEvent = InventoryItemEvent & {
  topoId: TopoId;
};
