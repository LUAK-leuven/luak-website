import type { TopoDetails } from '#shared/api/rest/topo';
import type { TopoLibraryItem } from '#shared/types/topos';

export type TopoListItem = {
  id: TopoId;
  title: string;
  totalAmount: number;
  availableAmount: number;
  yearPublished: number | null;
};

export interface TopoService {
  getDetails(topoId: TopoId): Promise<TopoDetails>;
  getTopoLibrary(): Promise<TopoLibraryItem[]>;
  getTopos(): Promise<TopoListItem[]>;
}
