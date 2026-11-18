import { createInitialAmount } from '#shared/api/rest/inventory';
import { createRentalItemId } from '#shared/api/rest/rental/rentalItem';
import {
  createAuthor,
  createClimbingType,
  createCountry,
  createDetails,
  createLanguage,
  createPlaceInLibrary,
  createTag,
  createTitle,
  createTopoId,
  createYearPublished,
  type TopoId,
} from '#shared/api/rest/topo';
import type { TopoLibraryRecord, TopoSummary } from '#shared/domain/topo/topo';

export const aRandomTopoId = (): TopoId => createTopoId(crypto.randomUUID());

export const aTopoLibraryRecord = (
  args: Partial<TopoLibraryRecord> = {},
): TopoLibraryRecord => {
  const defaultTopoRecord: TopoLibraryRecord = {
    amount: createInitialAmount(1),
    authors: [createAuthor('Marc Bott')],
    condition: undefined,
    countries: [createCountry('Belgium')],
    id: createTopoId(crypto.randomUUID()),
    placeInLibrary: createPlaceInLibrary('France'),
    tags: [createTag('Freyr')],
    title: createTitle('Freyr'),
    typesOfClimbing: [
      createClimbingType('Sport climbing'),
      createClimbingType('Multipitch'),
    ],
    yearPublished: createYearPublished(2022),
    details: createDetails('The epicenter of the universe'),
    languages: [createLanguage('French'), createLanguage('Dutch')],
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
