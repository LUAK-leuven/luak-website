import type { RentalId } from '#shared/types/rental';

export type ItemLostEvent = {
  eventName: 'ItemLostEvent';
  rentalId?: RentalId | undefined;
  lostAmount: number;
};

export type ItemArchivedEvent = {
  eventName: 'ItemArchivedEvent';
  amount: number;
};

export type ItemEvent = ItemLostEvent | ItemArchivedEvent;

export type InventoryItemEvent = ItemEvent & { occurredOn: string };
