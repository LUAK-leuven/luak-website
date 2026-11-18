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
  TopoId,
  YearPublished,
} from '#shared/api/rest/topo';

export type TopoLibraryRecord = {
  id: TopoId;
  authors: Author[];
  details: Details | undefined;
  condition: TopoCondition;
  countries: Country[];
  placeInLibrary: PlaceInLibrary | undefined; // TODO: fix data and make this required
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
