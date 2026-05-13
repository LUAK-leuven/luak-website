import { syncRef } from '@vueuse/core';
import {
  number as yupNumber,
  object as yupObject,
  string as yupString,
} from 'yup';
import type { GearInventoryId, GearItemId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

function useUrlState<T extends string>(name: string) {
  const router = useRouter();
  const route = useRoute();

  const data = computed({
    // TODO: add runtime validation
    get: () => (route.query[name] ?? undefined) as T | undefined,
    set: (value) => {
      void router.replace({
        name: 'board-lost-gear',
        query: { ...route.query, [name]: value },
      });
    },
  });

  return data;
}

export function useLostGearForm(
  rentalIds: ComputedRef<RentalId[]>,
  gearItemIds: ComputedRef<GearItemId[]>,
  gearInventoryIds: ComputedRef<GearInventoryId[]>,
) {
  const rentalId = useUrlState<RentalId>('rentalId');
  const gearItemId = useUrlState<GearItemId>('gearItemId');
  const inventoryId = useUrlState<GearInventoryId>('inventoryId');

  const formSchema = yupObject({
    rentalId: yupString<RentalId>()
      .uuid()
      .oneOf(
        rentalIds.value,
        `Invalid rental id. Make sure it belongs to an actual rental. [${rentalIds.value.join()}]`,
      )
      .required()
      .label('rental id'),
    gearItemId: yupString<GearItemId>()
      .uuid()
      .oneOf(
        gearItemIds.value,
        'Invalid gear item id. Make sure it belongs to an actual gear item.',
      )
      .required(),
    inventoryId: yupString<GearInventoryId>()
      .uuid()
      .oneOf(
        gearInventoryIds.value,
        'Invalid gear inventory id. Make sure it belongs to an inventory item.',
      )
      .required(),
    dateLost: yupString().required(),
    lostAmount: yupNumber().positive().required(),
  });

  const { handleSubmit, defineField } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: {
      rentalId: rentalId.value,
      gearItemId: gearItemId.value,
      inventoryId: inventoryId.value,
    },
  });

  const [rentalIdField] = defineField('rentalId');
  const [gearItemIdField] = defineField('gearItemId');
  const [inventoryIdField] = defineField('inventoryId');

  syncRef(rentalIdField, rentalId);
  syncRef(gearItemIdField, gearItemId);
  syncRef(inventoryIdField, inventoryId);

  return { handleSubmit };
}
