import { foldInventoryItemEvents } from '#server/domain/inventory/InventoryItem';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { RentalRepository } from '#server/domain/rental/repository';
import type { TopoRepository } from '#server/domain/topo/repository';
import type { TopoService } from '#server/domain/topo/service';
import type {
  TopoDetails,
  TopoId,
  TopoLibraryItem,
  TopoListItem,
} from '#server/domain/topo/topo';
import type { TotalAmount as InventoryItemTotalAmount } from '#shared/api/rest/inventory';
import { createAvailableAmount } from '#shared/api/rest/rental/availability';
import type { TotalAmount as RentalItemTotalAmount } from '#shared/api/rest/rental/rentalItem';
import { groupBy, sumOf } from '#shared/utils/utils';

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

  readonly getTopos = async (): Promise<TopoListItem[]> => {
    const topos = await this.topoRepository.getTopos();
    const events = await this.topoRepository.getAllTopoInventoryItemEvents();
    const groupedTopoEvents = groupBy(events, (e) => e.topoId);
    const rentedTopoAmounts =
      await this.rentalRepository.getRentedTopoAmounts();
    const groupedOutstandingAmounts = groupBy(
      rentedTopoAmounts,
      (x) => x.topoId,
    );

    return topos
      .map((topo) => {
        const totalAmount_ = foldInventoryItemEvents(
          topo.initialAmount,
          groupedTopoEvents[topo.id] ?? [],
        );
        const rentedAmount = sumOf(
          groupedOutstandingAmounts[topo.id] ?? [],
          'rentedAmount',
        );
        return {
          id: topo.rentalItemId,
          title: topo.title,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          totalAmount: totalAmount_ as InventoryItemTotalAmount &
            RentalItemTotalAmount,
          availableAmount: createAvailableAmount(totalAmount_ - rentedAmount),
          yearPublished: topo.yearPublished,
        };
      })
      .filter((topo) => topo.totalAmount > 0);
  };
}
