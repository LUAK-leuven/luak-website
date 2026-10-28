import { type infer as ZodInfer, string as zodString } from 'zod';

import { entityIdSchema } from '#shared/types/ddd';
import type { RentalId } from '#shared/api/rest/rental';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';
import { amountSchema, yearSchema } from '#shared/types/common';

declare const topoIdBrand: unique symbol;
const topoIdSchema = entityIdSchema(topoIdBrand);
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

declare const titleBrand: unique symbol;
const titleSchema = zodString().nonempty().brand(titleBrand);
export type Title = ZodInfer<typeof titleSchema>;
export const createTitle = (value: string): Title => titleSchema.parse(value);

declare const authorBrand: unique symbol;
const authorSchema = zodString().nonempty().brand(authorBrand);
export type Author = ZodInfer<typeof authorSchema>;
export const createAuthor = (value: string): Author =>
  authorSchema.parse(value);

declare const countryBrand: unique symbol;
const countrySchema = zodString().nonempty().brand(countryBrand);
export type Country = ZodInfer<typeof countrySchema>;
export const createCountry = (value: string): Country =>
  countrySchema.parse(value);

declare const languageBrand: unique symbol;
const languageSchema = zodString().nonempty().brand(languageBrand);
export type Language = ZodInfer<typeof languageSchema>;
export const createLanguage = (value: string): Language =>
  languageSchema.parse(value);

declare const climbingTypeBrand: unique symbol;
const climbingTypeSchema = zodString().nonempty().brand(climbingTypeBrand);
export type ClimbingType = ZodInfer<typeof climbingTypeSchema>;
export const createClimbingType = (value: string): ClimbingType =>
  climbingTypeSchema.parse(value);

declare const placeInLibraryBrand: unique symbol;
const placeInLibrarySchema = zodString().nonempty().brand(placeInLibraryBrand);
export type PlaceInLibrary = ZodInfer<typeof placeInLibrarySchema>;
export const createPlaceInLibrary = (value: string): PlaceInLibrary =>
  placeInLibrarySchema.parse(value);

declare const tagBrand: unique symbol;
const tagSchema = zodString().nonempty().brand(tagBrand);
export type Tag = ZodInfer<typeof tagSchema>;
export const createTag = (value: string): Tag => tagSchema.parse(value);

declare const detailsBrand: unique symbol;
const detailsSchema = zodString().nonempty().brand(detailsBrand);
export type Details = ZodInfer<typeof detailsSchema>;
export const createDetails = (value: string): Details =>
  detailsSchema.parse(value);

declare const initialAmountBrand: unique symbol;
const initialAmountSchema = amountSchema.brand(initialAmountBrand);
export type InitialAmount = ZodInfer<typeof initialAmountSchema>;
export const createInitialAmount = (n: number): InitialAmount =>
  initialAmountSchema.parse(n);

declare const totalAmountBrand: unique symbol;
const totalAmountSchema = amountSchema.brand(totalAmountBrand);
export type TotalAmount = ZodInfer<typeof totalAmountSchema>;
export const createTotalAmount = (n: number): TotalAmount =>
  totalAmountSchema.parse(n);

declare const availableAmountBrand: unique symbol;
const availableAmountSchema = amountSchema.brand(availableAmountBrand);
export type AvailableAmount = ZodInfer<typeof availableAmountSchema>;
export const createAvailableAmount = (n: number): AvailableAmount =>
  availableAmountSchema.parse(n);

declare const yearPublishedBrand: unique symbol;
const yearPublishedSchema = yearSchema.brand(yearPublishedBrand);
export type YearPublished = ZodInfer<typeof yearPublishedSchema>;
export const createYearPublished = (n: number): YearPublished =>
  yearPublishedSchema.parse(n);

export type TopoCondition =
  'as_good_as_new' | 'good' | 'used' | 'damaged' | 'falling_appart' | undefined;
