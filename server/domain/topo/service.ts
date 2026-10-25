import type {
  TopoDetails,
  TopoLibraryItem,
  TopoListItem,
  TopoId,
} from '#server/domain/topo/topo';

export interface TopoService {
  getDetails(topoId: TopoId): Promise<TopoDetails>;
  getTopoLibrary(options: {
    includeOutOfStock: boolean;
  }): Promise<TopoLibraryItem[]>;
  getTopos(): Promise<TopoListItem[]>;
}
