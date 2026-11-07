import {
  createAuthor,
  createClimbingType,
  createCountry,
  createInitialAmount,
  createLanguage,
  createPlaceInLibrary,
  createTag,
  createTitle,
  createTopoId,
  createYearPublished,
  type TopoId,
} from '#shared/api/rest/topo';
import type { TopoLibraryRecord, TopoRecord } from '#server/domain/topo/topo';

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
