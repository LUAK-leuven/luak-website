import type { TopoCondition, TopoId } from '#shared/api/rest/topo';

export type TopoLibraryItem = {
  id: TopoId;
  authors: string[];
  condition: TopoCondition;
  countries: string[];
  placeInLibrary: string;
  tags: string[];
  title: string;
  typesOfClimbing: string[];
  yearPublished: number | null;
  amount: number;
};
