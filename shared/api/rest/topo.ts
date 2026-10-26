import type { EntityId } from '#shared/types/ddd';
import type { RentalId } from '#shared/types/rental';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';
import { amount, year, type Amount, type Year } from '#shared/types/common';

export type TopoId = EntityId<'topo'>;
export const createTopoId = (value: string): TopoId => value as TopoId;

export type TopoDetails = {
  id: TopoId;
  title: Title;
  authors: Author[];
  condition: TopoCondition;
  countries: Country[];
  typesOfClimbing: ClimbingType[];
  details: Details | undefined;
  languages: Language[];
  placeInLibrary: PlaceInLibrary;
  tags: Tag[];
  yearPublished: YearPublished | undefined;
  initialAmount: InitialAmount;
  amount: TotalAmount;
  events: TopoEvent[];
  rentals: {
    id: RentalId;
    rentedAmount: number;
    memberName: string;
  }[];
};

export type TopoLibraryItem = {
  id: TopoId;
  authors: Author[];
  condition: TopoCondition;
  countries: Country[];
  placeInLibrary: PlaceInLibrary;
  tags: Tag[];
  title: Title;
  typesOfClimbing: ClimbingType[];
  yearPublished: YearPublished | undefined;
  amount: TotalAmount;
};

export type TopoListItem = {
  id: TopoId;
  title: Title;
  totalAmount: TotalAmount;
  availableAmount: AvailableAmount;
  yearPublished: YearPublished | undefined;
};

export type TopoEvent = InventoryItemEvent;

export type Title = string & { readonly __brand_title: unique symbol };
export const createTitle = (value: string): Title => value as Title;

export type Author = string & { readonly __brand_author: unique symbol };
export const createAuthor = (value: string): Author => value as Author;

export type Country = string & { readonly __brand_country: unique symbol };
export const createCountry = (value: string): Country => value as Country;

export type Language = string & { readonly __brand_language: unique symbol };
export const createLanguage = (value: string): Language => value as Language;

export type ClimbingType = string & {
  readonly __brand_climbing_type: unique symbol;
};
export const createClimbingType = (value: string): ClimbingType =>
  value as ClimbingType;

export type PlaceInLibrary = string & {
  readonly __brand_place_in_library: unique symbol;
};
export const createPlaceInLibrary = (value: string): PlaceInLibrary =>
  value as PlaceInLibrary;

export type Tag = string & { readonly __brand_tag: unique symbol };
export const createTag = (value: string): Tag => value as Tag;

export type Details = string & { readonly __brand_details: unique symbol };
export const createDetails = (value: string): Details => value as Details;

export type InitialAmount = Amount & {
  readonly __brand_initial_amount: unique symbol;
};
export const createInitialAmount = (n: number): InitialAmount =>
  amount(n) as InitialAmount;

export type TotalAmount = Amount & {
  readonly __brand_total_amount: unique symbol;
};
export const createTotalAmount = (n: number): TotalAmount =>
  amount(n) as TotalAmount;

export type AvailableAmount = Amount & {
  readonly __brand_available_amount: unique symbol;
};
export const createAvailableAmount = (n: number): AvailableAmount =>
  amount(n) as AvailableAmount;

export type YearPublished = Year & {
  readonly __brand_year_published: unique symbol;
};
export const createYearPublished = (n: number): YearPublished =>
  year(n) as YearPublished;

export type TopoCondition =
  'as_good_as_new' | 'good' | 'used' | 'damaged' | 'falling_appart' | undefined;
