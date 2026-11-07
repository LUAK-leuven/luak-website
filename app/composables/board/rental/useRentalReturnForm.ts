import {
  object as yupObject,
  string as yupString,
  bool as yupBool,
  mixed as yupMixed,
  type MixedSchema,
  type AnyObject,
} from 'yup';
import type { RentalDetails } from '~/model/Rental';
import type { GearItemId } from '#shared/api/rest/gear';
import type { TopoId } from '#shared/api/rest/topo';

type Id<T extends 'gear' | 'topo'> = T extends 'gear' ? GearItemId : TopoId;
type RentedItemSchema<T extends 'gear' | 'topo'> = MixedSchema<
  Partial<Record<Id<T>, number>>,
  AnyObject,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {},
  'd'
>;

function rentedItemSchema(
  rentedItems: {
    itemId: { id: GearItemId; type: 'gear' };
    rentedAmount: number;
  }[],
): RentedItemSchema<'gear'>;
function rentedItemSchema(
  rentedItems: {
    itemId: { id: TopoId; type: 'topo' };
    rentedAmount: number;
  }[],
): RentedItemSchema<'topo'>;
function rentedItemSchema(
  rentedItems: { itemId: RentalItemId; rentedAmount: number }[],
): RentedItemSchema<'gear' | 'topo'> {
  const schema = yupMixed<Partial<Record<RentalItemId['id'], number>>>().test(
    'validAmounts',
    'Invalid returned amounts',
    (value) => {
      if (!value) return false;
      for (const { itemId, rentedAmount } of rentedItems) {
        const returnedAmount = value[itemId.id];
        if (returnedAmount === undefined) return false;
        if (returnedAmount < 0 || returnedAmount > rentedAmount) return false;
      }
      return true;
    },
  );
  return schema.required().default({});
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
        rental.gear.map((gearItem) => [
          gearItem.itemId.id,
          gearItem.returnedAmount,
        ]),
      ),
      returnedTopos: Object.fromEntries(
        rental.topos.map((topo) => [topo.itemId.id, topo.returnedAmount]),
      ),
      depositReturned: rental.depositReturned,
      comments: rental.comments,
    },
  });

  const updateReturnedItem = (
    args: RentalItemId & {
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
