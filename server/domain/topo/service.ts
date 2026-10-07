import type {
  TopoDetails,
  TopoLibraryItem,
  TopoListItem,
  TopoId,
} from '#server/domain/topo/topo';

export interface TopoService {
  getDetails(topoId: TopoId): Promise<TopoDetails>;
  getTopoLibrary(): Promise<TopoLibraryItem[]>;
  getTopos(): Promise<TopoListItem[]>;
}
