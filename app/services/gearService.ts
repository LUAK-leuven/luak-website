import type { SupabaseClient } from '@supabase/supabase-js';

export class GearService {
  constructor(
    private readonly supabase: SupabaseClient<Database> = useSupabaseClient(),
  ) {}

  readonly getCompositeGearItems = async () => {
    const { data } = await this.supabase
      .from('CompositeGearItems')
      .select(
        `
          name,
          CompositeGearItems_GearItems (
            gear_item_id,
            amount
          )
        `,
      )
      .throwOnError();

    return data.map((it) => ({
      name: it.name,
      gearItemIds: it.CompositeGearItems_GearItems.map((it) => ({
        id: it.gear_item_id as GearItemId,
        amount: it.amount,
      })),
    }));
  };
}
