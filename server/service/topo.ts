import { foldInventoryItemEvents } from '#server/domain/inventory/InventoryItem';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { RentalRepository } from '#server/domain/rental/repository';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoService } from '#server/domain/topo/service';
import type {
  TopoDetails,
  TopoId,
  TopoLibraryItem,
} from '#server/domain/topo/topo';
import { groupBy } from '#shared/utils/utils';

export class TopoServiceImpl implements TopoService {
  constructor(
    private readonly topoRepository: TopoRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly rentalRepository: RentalRepository,
  ) {}

  readonly getDetails = async (topoId: TopoId): Promise<TopoDetails> => {
    const topoDetails = await this.topoRepository.getDetails(topoId);

    const topoEvents =
      await this.inventoryRepository.getInventoryItemEvents(topoId);

    const rentals = await this.rentalRepository.getRentalsForTopo(topoId);

    return {
      id: topoDetails.id,
      title: topoDetails.title,
      authors: topoDetails.authors,
      condition: topoDetails.condition,
      countries: topoDetails.countries,
      typesOfClimbing: topoDetails.types_of_climbing,
      details: topoDetails.details,
      languages: topoDetails.languages,
      placeInLibrary: topoDetails.place_in_library,
      tags: topoDetails.tags,
      yearPublished: topoDetails.year_published,
      initialAmount: topoDetails.totalAmount,
      amount: foldInventoryItemEvents(topoDetails.totalAmount, topoEvents),
      events: topoEvents,
      rentals: rentals,
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

    const groupedTopoEvents = groupBy(topoEvents, (e) => e.topoId);

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
        amount: foldInventoryItemEvents(
          topo.initialAmount,
          groupedTopoEvents[topo.id] ?? [],
        ),
      }))
      .filter((topo) => includeOutOfStock || topo.amount > 0);
  };
}
