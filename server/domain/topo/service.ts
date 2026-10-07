import type {
  TopoDetails,
  TopoLibraryItem,
  TopoListItem,
} from '#server/domain/topo/topo';

export interface TopoService {
  getDetails(topoId: TopoId): Promise<TopoDetails>;
  getTopoLibrary(): Promise<TopoLibraryItem[]>;
  getTopos(): Promise<TopoListItem[]>;
}
