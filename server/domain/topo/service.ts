import type {
  TopoDetails,
  TopoId,
  TopoLibraryItem,
} from '#server/domain/topo/topo';

export interface TopoService {
  getDetails(topoId: TopoId): Promise<TopoDetails>;
  getTopoLibrary(options: {
    includeOutOfStock: boolean;
  }): Promise<TopoLibraryItem[]>;
}
