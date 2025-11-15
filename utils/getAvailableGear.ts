import type { Database } from '~/types/database.types';

export async function getAvailableGear() {
  const supabase = useSupabaseClient<Database>();
  const { data: gear, error } = await supabase.from('GearItems').select(
    `
    id,
    name,
    GearInventory (
      amount,
      status
    ),
    RentedGear (
      amount
    )
    `,
  );
  console.log('getGear', gear);
  console.log('error', error);
  if (gear === null) return [];
  return gear.map((gearItem) => ({
    id: gearItem.id,
    name: gearItem.name,
    amount:
      sum(
        gearItem.GearInventory.filter(
          (item) => item.status === 'available',
        ).map((item) => item.amount),
      ) - sum(gearItem.RentedGear.map((item) => item.amount)),
  }));
}
