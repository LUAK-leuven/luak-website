import {
  createAuthor,
  createClimbingType,
  createCountry,
  createLanguage,
  createPlaceInLibrary,
  createTag,
  createTitle,
  createTopoId,
  createYearPublished,
  type TopoId,
} from '#shared/api/rest/topo';
import type {
  TopoLibraryRecord,
  TopoRecord,
  TopoSummary,
} from '#server/domain/topo/topo';
import { createInitialAmount } from '#shared/api/rest/inventory';
import { createRentalItemId } from '#shared/api/rest/rental';

export const aRandomTopoId = (): TopoId => createTopoId(crypto.randomUUID());

export const aTopoRecord = (args: Partial<TopoRecord> = {}): TopoRecord => {
  const defaultTopoRecord: TopoRecord = {
    totalAmount: createInitialAmount(1),
    authors: [createAuthor('Marc Bott')],
    condition: undefined,
    countries: [createCountry('Belgium')],
    details: undefined,
    id: createTopoId(crypto.randomUUID()),
    languages: [createLanguage('French'), createLanguage('Dutch')],
    place_in_library: createPlaceInLibrary('France'),
    tags: [createTag('Epicenter of the universe')],
    title: createTitle('Freyr'),
    types_of_climbing: [
      createClimbingType('Sport climbing'),
      createClimbingType('Multipitch'),
    ],
    year_published: createYearPublished(2022),
  };
  return {
    ...defaultTopoRecord,
    ...args,
  };
};

export const aTopoLibraryRecord = (
  args: Partial<TopoLibraryRecord> = {},
): TopoLibraryRecord => {
  const defaultTopoRecord: TopoLibraryRecord = {
    initialAmount: createInitialAmount(1),
    authors: [createAuthor('Marc Bott')],
    condition: undefined,
    countries: [createCountry('Belgium')],
    id: createTopoId(crypto.randomUUID()),
    placeInLibrary: createPlaceInLibrary('France'),
    tags: [createTag('Epicenter of the universe')],
    title: createTitle('Freyr'),
    typesOfClimbing: [
      createClimbingType('Sport climbing'),
      createClimbingType('Multipitch'),
    ],
    yearPublished: createYearPublished(2022),
  };
  return {
    ...defaultTopoRecord,
    ...args,
  };
};

export const aTopoSummary = (args: Partial<TopoSummary>): TopoSummary => {
  const defaultTopoSummary: TopoSummary = {
    id: createTopoId(crypto.randomUUID()),
    rentalItemId: createRentalItemId(crypto.randomUUID()),
    title: createTitle('Freyr'),
    initialAmount: createInitialAmount(1),
    yearPublished: createYearPublished(2022),
  };
  return {
    ...defaultTopoSummary,
    ...args,
  };
};
