import * as yup from 'yup';
import type { RentalItem } from '~/types/board/form/RentalItem';
import type { EntityId } from '~/types/common';
import type { Enums } from '~/types/database.types';
import type { GearItemId, TopoId } from '~/types/gear';
import type { UserId } from '~/types/user';

type RentalFormState = {
  memberId: UserId | 'non-user';
  contactInfo:
    | {
        fullName: string;
        email?: string;
        phone?: string;
      }
    | undefined;
  dateBorrow: string;
  dateReturn: string;
  gear: { id: GearItemId; amount: number }[];
  topos: { id: TopoId; amount: number }[];
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  markAsReserved: boolean;
  comments: string | undefined;
};

export default function (
  initialState: Partial<RentalFormState>,
  allGear: RentalItem<GearItemId>[],
  allTopos: RentalItem<TopoId>[],
) {
  const selectionFrom = <T extends EntityId<unknown>>(
    selection: { id: T; name: string; totalAmount: number }[],
  ) =>
    yup
      .array()
      .of(
        yup.object({
          id: yup.string<T>().required(),
          amount: yup
            .number()
            .required()
            .test(function (amount) {
              const { id } = this.parent as { id: string };
              const item = selection.find((x) => x.id === id);
              if (item === undefined) {
                console.warn(
                  `Could not find item ${id} in ${selection.map((x) => x.id).toString()}!`,
                );
                return this.createError({
                  path: `${this.path}`,
                  message: `Error: item with id ${id} cannot be found in the inventory.`,
                });
              }
              if (amount <= 0) {
                return this.createError({
                  path: `${this.path}`,
                  message: `Value for ${item.name} must be a positive number.`,
                });
              }
              if (amount > item.totalAmount) {
                return this.createError({
                  path: `${this.path}`,
                  message: `Value for ${item.name} cannot exceed ${item.totalAmount}`,
                });
              }
              return true;
            }),
        }),
      )
      .default([])
      .required();

  const formSchema: yup.ObjectSchema<RentalFormState> = yup.object({
    memberId: yup
      .string<UserId | 'non-user'>()
      .when('contactInfo', {
        is: (x: unknown) => {
          return x === undefined;
        },
        then: (s) => s.required(),
      })
      .required(),
    dateBorrow: yup.string().required().label('date borrow'),
    dateReturn: yup
      .string()
      .required()
      .test(
        'isAfter',
        'Return date must be after borrow date',
        (date, context) => {
          return context.parent.dateBorrow < date;
        },
      )
      .label('return date'),
    gear: selectionFrom(allGear),
    topos: selectionFrom(allTopos),
    depositFee: yup.number().required().min(0),
    paymentMethod: yup.string<'transfer' | 'cash'>().required(),
    contactInfo: yup
      .object({
        fullName: yup.string().required(),
        email: yup.string().email(),
        phone: yup_phone,
      })
      .optional()
      .default(undefined)
      .test('email and phone', function (contact) {
        if (contact && !contact.email && !contact.phone) {
          return this.createError({
            path: `${this.path}`,
            message: `One of email or phone number is required`,
          });
        }
        return true;
      }),
    markAsReserved: yup.bool().default(false),
    comments: yup.string(),
  });

  const { meta, handleSubmit, errors, validateField, values, defineField } =
    useForm({
      validationSchema: toTypedSchema(formSchema),
      initialValues: initialState,
      validateOnMount: false,
    });

  const errorAttr = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: (state: any) => ({ error: state.errors[0] }),
  };

  const [selectedUser] = defineField('memberId');
  const [selectedGear] = defineField('gear');
  const [selectedTopos] = defineField('topos');
  const [dateBorrow, dateBorrowAttr] = defineField('dateBorrow', errorAttr);
  const [dateReturn, dateReturnAttr] = defineField('dateReturn', errorAttr);
  const [depositFee, depositFeeAttr] = defineField('depositFee', errorAttr);

  return {
    selectedUser,
    selectedGear,
    selectedTopos,
    dateBorrow,
    dateBorrowAttr,
    dateReturn,
    dateReturnAttr,
    depositFee,
    depositFeeAttr,
    meta,
    handleSubmit,
    errors,
    validateField,
    values,
  };
}
