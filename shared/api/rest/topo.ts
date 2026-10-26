import type { EntityId } from '#shared/types/ddd';
import type { RentalId } from '#shared/types/rental';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';
import { amount, year, type Amount, type Year } from '#shared/types/common';

export type TopoId = EntityId<'topo'>;

export type TopoCondition =
  'as_good_as_new' | 'good' | 'used' | 'damaged' | 'falling_appart' | undefined;

export type TopoEvent = InventoryItemEvent;

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

export type Title = string & { readonly __brand: unique symbol };
export type Author = string & { readonly __brand: unique symbol };
export type Country = string & { readonly __brand: unique symbol };
export type Language = string & { readonly __brand: unique symbol };
export type ClimbingType = string & { readonly __brand: unique symbol };
export type PlaceInLibrary = string & { readonly __brand: unique symbol };
export type Tag = string & { readonly __brand: unique symbol };
export type Details = string & { readonly __brand: unique symbol };

export type InitialAmount = Amount & { readonly __brand: unique symbol };
export const initialAmount = (n: number): InitialAmount =>
  amount(n) as InitialAmount;
export type TotalAmount = Amount & { readonly __brand: unique symbol };
export const totalAmount = (n: number): TotalAmount => amount(n) as TotalAmount;
export type AvailableAmount = Amount & { readonly __brand: unique symbol };
export const availableAmount = (n: number): AvailableAmount =>
  amount(n) as AvailableAmount;

export type YearPublished = Year & { readonly __brand: unique symbol };
export const yearPublished = (n: number): YearPublished =>
  year(n) as YearPublished;
