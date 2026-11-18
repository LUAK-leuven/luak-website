import { foldInventoryItemEvents } from '#server/domain/inventory/InventoryItem';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoService } from '#server/domain/topo/service';
import type {
  TopoDetails,
  TopoId,
  TopoLibraryItem,
} from '#server/domain/topo/topo';

export class TopoServiceImpl implements TopoService {
  constructor(
    private readonly topoRepository: TopoRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  readonly getDetails = async (topoId: TopoId): Promise<TopoDetails> => {
    const topoDetails = await this.topoRepository.getDetails(topoId);

    const topoEvents =
      await this.inventoryRepository.getInventoryItemEvents(topoId);

    return {
      id: topoDetails.id,
      title: topoDetails.title,
      authors: topoDetails.authors,
      condition: topoDetails.condition,
      countries: topoDetails.countries,
      typesOfClimbing: topoDetails.typesOfClimbing,
      details: topoDetails.details,
      languages: topoDetails.languages,
      placeInLibrary: topoDetails.placeInLibrary,
      tags: topoDetails.tags,
      yearPublished: topoDetails.yearPublished,
      amount: foldInventoryItemEvents(topoDetails.amount, topoEvents),
    };
  };

  readonly getTopoLibrary = async ({
    includeOutOfStock,
  }: {
    includeOutOfStock: boolean;
  }): Promise<TopoLibraryItem[]> => {
    const topos = await this.topoRepository.getTopoLibrary();
    const topoEvents =
      await this.topoRepository.getAllTopoInventoryItemEvents();

    return topos
      .map((topo) => ({
        id: topo.id,
        authors: topo.authors,
        condition: topo.condition,
        countries: topo.countries,
        placeInLibrary: topo.placeInLibrary,
        tags: topo.tags,
        title: topo.title,
        typesOfClimbing: topo.typesOfClimbing,
        yearPublished: topo.yearPublished,
        amount: foldInventoryItemEvents(topo.amount, topoEvents[topo.id] ?? []),
      }))
      .filter((topo) => includeOutOfStock || topo.amount > 0);
  };
}
