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
import type {
  InitialAmount,
  InventoryItemEvent,
} from '#shared/api/rest/inventory';
import type { RentalItemId } from '#shared/api/rest/rental';

export type { TopoCondition } from '#shared/api/rest/topo';
export type { TopoId } from '#shared/api/rest/topo';

export type TopoDetails = TopoDetailsDto;
export type TopoLibraryItem = TopoLibraryItemDto;
export type TopoListItem = TopoListItemDto;

export type TopoRecord = {
  totalAmount: InitialAmount;
  authors: Author[];
  condition: TopoCondition;
  countries: Country[];
  details: Details | undefined;
  id: TopoId;
  languages: Language[];
  place_in_library: PlaceInLibrary;
  tags: Tag[];
  title: Title;
  types_of_climbing: ClimbingType[];
  year_published: YearPublished | undefined;
};

export type TopoLibraryRecord = {
  id: TopoId;
  authors: Author[];
  condition: TopoCondition;
  countries: Country[];
  placeInLibrary: PlaceInLibrary;
  tags: Tag[];
  title: Title;
  typesOfClimbing: ClimbingType[];
  yearPublished: YearPublished | undefined;
  initialAmount: InitialAmount;
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
