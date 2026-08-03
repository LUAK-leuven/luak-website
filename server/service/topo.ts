import type { TopoDao } from '#server/repository/topos';
import type { GearDao } from '#server/repository/gear';
import { foldInventoryItemEvents } from '~~/server/domain/inventory/InventoryItem';
import type { RentalDao } from '#server/repository/rentals';

export class TopoService {
  constructor(
    private readonly topoRepository: TopoDao,
    private readonly gearRepository: GearDao,
    private readonly rentalRepository: RentalDao,
  ) {}

  readonly getDetails = async (topoId: TopoId) => {
    const topoDetails = await this.topoRepository.getDetails(topoId);
    const topoEvents = await this.gearRepository.getInventoryItemEvents({
      itemType: 'topo',
      itemId: topoId,
    });

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
      amount: foldInventoryItemEvents(topoDetails.totalAmount, topoEvents),
    };
  };

  readonly getTopoLibrary = async () => {
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
      .filter((topo) => topo.amount > 0);
  };

  readonly getTopos = async () => {
    const topos = await this.topoRepository.getTopos();
    const events = await this.topoRepository.getAllTopoInventoryItemEvents();
    const groupedTopoEvents = groupBy(events, (e) => e.topoId);
    const rentedTopoAmounts =
      await this.rentalRepository.getRentedTopoAmounts();
    const groupedRentedAmounts = groupBy(rentedTopoAmounts, (x) => x.topoId);

    return topos
      .map((topo) => {
        const totalAmount = foldInventoryItemEvents(
          topo.initialAmount,
          groupedTopoEvents[topo.id] ?? [],
        );
        const rentedAmount = sumOf(
          groupedRentedAmounts[topo.id] ?? [],
          'rentedAmount',
        );
        return {
          id: topo.id,
          title: topo.title,
          totalAmount,
          availableAmount: totalAmount - rentedAmount,
          yearPublished: topo.yearPublished,
        };
      })
      .filter((topo) => topo.totalAmount > 0);
  };
}
