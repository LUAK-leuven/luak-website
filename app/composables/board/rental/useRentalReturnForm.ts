import {
  bool as yupBool,
  mixed as yupMixed,
  object as yupObject,
  string as yupString,
} from 'yup';

import {
  type RentalItemId,
  RentalItemType,
} from '#shared/api/rest/rental/rentalItem';
import type { RentalDetails } from '~/model/Rental';

function rentedItemSchema(
  rentedItems: { id: RentalItemId; rentedAmount: number }[],
) {
  return yupMixed<Partial<Record<RentalItemId, number>>>()
    .test('validAmounts', 'Invalid returned amounts', (value) => {
      if (!value) return false;
      for (const { id, rentedAmount } of rentedItems) {
        const returnedAmount = value[id];
        if (returnedAmount === undefined) return false;
        if (returnedAmount < 0 || returnedAmount > rentedAmount) return false;
      }
      return true;
    })
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

  const updateReturnedItem = (args: {
    id: RentalItemId;
    type: RentalItemType;
    amount: number | undefined;
  }) => {
    switch (args.type) {
      case RentalItemType.gear:
        setFieldValue('returnedGear', {
          ...values.returnedGear,
          [args.id]: args.amount,
        });
        break;
      case RentalItemType.topo:
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
