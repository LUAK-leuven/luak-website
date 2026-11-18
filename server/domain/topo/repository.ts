import type {
  TopoId,
  TopoLibraryRecord,
  TopoSummary,
} from '#server/domain/topo/topo';
import type { InventoryItemEvent } from '#shared/api/rest/inventory';

export interface TopoRepository {
  getDetails(topoId: TopoId): Promise<TopoLibraryRecord>;
  getTopoLibrary(): Promise<TopoLibraryRecord[]>;
  getTopos(): Promise<TopoSummary[]>;
  getAllTopoInventoryItemEvents(): Promise<
    Partial<Record<TopoId, InventoryItemEvent[]>>
  >;
}
