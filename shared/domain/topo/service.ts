import type {
  TopoDetails,
  TopoId,
  TopoLibraryItem,
} from '#shared/api/rest/topo';

export interface TopoService {
  getDetails(topoId: TopoId): Promise<TopoDetails>;
  getTopoLibrary(options: {
    includeOutOfStock: boolean;
  }): Promise<TopoLibraryItem[]>;
}
