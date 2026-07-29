import type { TopoId } from '~/types/gear';
import { groupBy } from '~/utils/utils';
import type { TopoDao } from '../repository/topos';
import type { GearDao } from '../repository/gear';
import { foldInventoryItemEvents } from '~/model/inventory/InventoryItem';

export class TopoService {
  constructor(
    private readonly topoRepository: TopoDao,
    private readonly gearRepository: GearDao,
  ) {}

  async getDetails(topoId: TopoId) {
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
  }

  async getTopoLibrary() {
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
  }
}
