export type TopoLibraryItem = {
  id: globalThis.TopoId;
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

type TopoCondition =
  'as_good_as_new' | 'good' | 'used' | 'damaged' | 'falling_appart' | null;
