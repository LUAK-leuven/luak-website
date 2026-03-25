type UUID = string & { readonly __uuid: unique symbol };

export type EntityId<E> = UUID & { readonly __entity: E };
