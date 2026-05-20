import type { TopoId } from '~/types/gear';
import { sumOf } from '~/utils/utils';
import type { TopoDao } from '../repository/topos';
import type { GearDao } from '../repository/gear';

export class TopoService {
  private readonly topoRepo: TopoDao;
  private readonly gearRepo: GearDao;

  constructor(topoRepository: TopoDao, gearRepository: GearDao) {
    this.topoRepo = topoRepository;
    this.gearRepo = gearRepository;
  }

  async getDetails(topoId: TopoId) {
    const topoDetails = await this.topoRepo.getDetails(topoId);
    const topoEvents = await this.gearRepo.getInventoryItemEvents({
      itemType: 'topo',
      itemId: topoId,
    });

    const totalAmount =
      topoDetails.totalAmount - sumOf(topoEvents, 'lostAmount');

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
      amount: totalAmount,
    };
  }
}
