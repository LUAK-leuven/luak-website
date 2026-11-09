import { type infer as ZodInfer, string as zodString } from 'zod';

import { entityIdSchema } from '#shared/types/ddd';
import type {
  RentalId,
  OutstandingAmount,
  RentalMemberName,
  TotalAmount as RentalItemTotalAmount,
  RentalItemId,
} from '#shared/api/rest/rental';
import type {
  AvailableAmount,
  InitialAmount,
  InventoryItemEvent,
  TotalAmount as InventoryItemTotalAmount,
} from '#shared/api/rest/inventory';
import { yearSchema } from '#shared/types/common';

declare const _topoIdBrand: unique symbol;
export const topoIdSchema = entityIdSchema<typeof _topoIdBrand>();
export type TopoId = ZodInfer<typeof topoIdSchema>;
export const createTopoId = (value: string): TopoId =>
  topoIdSchema.parse(value);

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
  amount: InventoryItemTotalAmount;
  events: TopoEvent[];
  rentals: {
    id: RentalId;
    rentedAmount: OutstandingAmount;
    memberName: RentalMemberName;
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
  amount: InventoryItemTotalAmount;
};

export type TopoListItem = {
  id: RentalItemId;
  title: Title;
  totalAmount: InventoryItemTotalAmount & RentalItemTotalAmount;
  availableAmount: AvailableAmount;
  yearPublished: YearPublished | undefined;
};

export type TopoEvent = InventoryItemEvent;

declare const _titleBrand: unique symbol;
const titleSchema = zodString().nonempty().brand<typeof _titleBrand>();
export type Title = ZodInfer<typeof titleSchema>;
export const createTitle = (value: string): Title => titleSchema.parse(value);

declare const _authorBrand: unique symbol;
const authorSchema = zodString().nonempty().brand<typeof _authorBrand>();
export type Author = ZodInfer<typeof authorSchema>;
export const createAuthor = (value: string): Author =>
  authorSchema.parse(value);

declare const _countryBrand: unique symbol;
const countrySchema = zodString().nonempty().brand<typeof _countryBrand>();
export type Country = ZodInfer<typeof countrySchema>;
export const createCountry = (value: string): Country =>
  countrySchema.parse(value);

declare const _languageBrand: unique symbol;
const languageSchema = zodString().nonempty().brand<typeof _languageBrand>();
export type Language = ZodInfer<typeof languageSchema>;
export const createLanguage = (value: string): Language =>
  languageSchema.parse(value);

declare const _climbingTypeBrand: unique symbol;
const climbingTypeSchema = zodString()
  .nonempty()
  .brand<typeof _climbingTypeBrand>();
export type ClimbingType = ZodInfer<typeof climbingTypeSchema>;
export const createClimbingType = (value: string): ClimbingType =>
  climbingTypeSchema.parse(value);

declare const _placeInLibraryBrand: unique symbol;
const placeInLibrarySchema = zodString()
  .nonempty()
  .brand<typeof _placeInLibraryBrand>();
export type PlaceInLibrary = ZodInfer<typeof placeInLibrarySchema>;
export const createPlaceInLibrary = (value: string): PlaceInLibrary =>
  placeInLibrarySchema.parse(value);

declare const _tagBrand: unique symbol;
const tagSchema = zodString().nonempty().brand<typeof _tagBrand>();
export type Tag = ZodInfer<typeof tagSchema>;
export const createTag = (value: string): Tag => tagSchema.parse(value);

declare const _detailsBrand: unique symbol;
const detailsSchema = zodString().nonempty().brand<typeof _detailsBrand>();
export type Details = ZodInfer<typeof detailsSchema>;
export const createDetails = (value: string): Details =>
  detailsSchema.parse(value);

declare const _yearPublishedBrand: unique symbol;
const yearPublishedSchema = yearSchema.brand<typeof _yearPublishedBrand>();
export type YearPublished = ZodInfer<typeof yearPublishedSchema>;
export const createYearPublished = (n: number): YearPublished =>
  yearPublishedSchema.parse(n);

export type TopoCondition =
  'as_good_as_new' | 'good' | 'used' | 'damaged' | 'falling_appart' | undefined;
