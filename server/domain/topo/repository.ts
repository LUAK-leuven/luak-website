import type {
  TopoInventoryItemEvent,
  TopoLibraryRecord,
  TopoRecord,
  TopoSummary,
  TopoId,
} from '#server/domain/topo/topo';

export interface TopoRepository {
  getDetails(topoId: TopoId): Promise<TopoRecord>;
  getTopoLibrary(): Promise<TopoLibraryRecord[]>;
  getTopos(): Promise<TopoSummary[]>;
  getAllTopoInventoryItemEvents(): Promise<TopoInventoryItemEvent[]>;
}
