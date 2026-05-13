import type { RentalDetails } from '~/types/rental';
import {
  object as yupObject,
  string as yupString,
  number as yupNumber,
  bool as yupBool,
} from 'yup';
import type { EntityId } from '~/types/ddd';
import type { GearItemId, TopoId } from '~/types/gear';

type ItemId = { id: GearItemId; type: 'gear' } | { id: TopoId; type: 'topo' };

function rentedItemSchema<T extends EntityId<unknown>>(
  rentedItems: { id: T; rentedAmount: number }[],
) {
  const x = Object.fromEntries(
    rentedItems.map(({ id, rentedAmount }) => [
      id,
      yupNumber().required().min(0).max(rentedAmount),
    ]),
  );
  return yupObject(x as Record<T, (typeof x)[string]>)
    .required()
    .default({});
}

export function useRentalReturnForm(rental: RentalDetails) {
  const formSchema = yupObject({
    dateReturn: yupString()
      .required()
      .test('isAfter', 'Return date must be after borrow date', (date) => {
        return rental.dateBorrow < date;
      })
      .label('return date'),
    returnedGear: rentedItemSchema(rental.gear),
    returnedTopos: rentedItemSchema(rental.topos),
    depositReturned: yupBool().required().default(false),
    comments: yupString(),
  });

  const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: {
      dateReturn: rental.dateReturn,
      returnedGear: Object.fromEntries(
        rental.gear.map((gearItem) => [gearItem.id, gearItem.returnedAmount]),
      ),
      returnedTopos: Object.fromEntries(
        rental.topos.map((topo) => [topo.id, topo.returnedAmount]),
      ),
      depositReturned: rental.depositReturned,
      comments: rental.comments,
    },
  });

  const updateReturnedItem = (
    args: ItemId & {
      amount: number | undefined;
    },
  ) => {
    switch (args.type) {
      case 'gear':
        setFieldValue('returnedGear', {
          ...values.returnedGear,
          [args.id]: args.amount,
        });
        break;
      case 'topo':
        setFieldValue('returnedTopos', {
          ...values.returnedTopos,
          [args.id]: args.amount,
        });
    }
  };

  return {
    values,
    handleSubmit,
    updateReturnedItem,
  };
}
