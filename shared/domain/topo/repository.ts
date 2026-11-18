import type { InventoryItemEvent } from '#shared/api/rest/inventory';
import type {
  TopoId,
  TopoLibraryRecord,
  TopoSummary,
} from '#shared/domain/topo/topo';

export interface TopoRepository {
  getDetails(topoId: TopoId): Promise<TopoLibraryRecord>;
  getTopoLibrary(): Promise<TopoLibraryRecord[]>;
  getTopos(): Promise<TopoSummary[]>;
  getAllTopoInventoryItemEvents(): Promise<
    Partial<Record<TopoId, InventoryItemEvent[]>>
  >;
}
