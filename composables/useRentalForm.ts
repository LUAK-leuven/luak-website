import * as yup from 'yup';
import type { RentalItem } from '~/types/board/form/RentalItem';
import type { EntityId } from '~/types/ddd';
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
  gear: Record<GearItemId, number>;
  topos: Record<TopoId, number>;
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  markAsReserved: boolean;
  comments: string | undefined;
};

function selectionFrom<T extends EntityId<unknown>>(
  selection: { id: T; name: string; totalAmount: number }[],
) {
  return yup
    .object<Record<T, number>>()
    .default(() => ({}) as Record<T, number>)
    .required()
    .test(function (items: Record<T, number>) {
      for (const [id, amount] of Object.entries(items) as [T, number][]) {
        const item = selection.find((x) => x.id === id);
        if (item === undefined) {
          console.warn(
            `Could not find item ${id} in ${selection.map((x) => x.id).toString()}!`,
          );
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Error: item with id ${id} cannot be found in the inventory.`,
          });
        }
        if (amount <= 0) {
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Value for ${item.name} must be a positive number.`,
          });
        }
        if (amount > item.totalAmount) {
          return this.createError({
            path: `${this.path}.${id}`,
            message: `Value for ${item.name} cannot exceed ${item.totalAmount}`,
          });
        }
      }
      return true;
    });
}

export function useRentalForm(
  initialState: Partial<RentalFormState>,
  allGear: RentalItem<GearItemId>[],
  allTopos: RentalItem<TopoId>[],
) {
  const formSchema: yup.ObjectSchema<RentalFormState> = yup.object({
    memberId: yup
      .string<UserId | 'non-user'>()
      .required('You must select a member.'),
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
    depositFee: yup.number().label('deposit fee').required().min(0),
    paymentMethod: yup
      .string<'transfer' | 'cash'>()
      .required('You must select a payment method.'),
    contactInfo: yup
      .object({
        fullName: yup.string().required().label('full name'),
        email: yup.string().email().label('email'),
        phone: yup_phone.label('phone number'),
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

  const {
    meta,
    handleSubmit,
    errors,
    validateField,
    values,
    defineField,
    setFieldValue,
    isSubmitting,
  } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: {
      memberId: initialState.memberId,
      contactInfo: initialState.contactInfo,
      dateBorrow: initialState.dateBorrow,
      dateReturn: initialState.dateReturn,
      gear: initialState.gear ?? {},
      topos: initialState.topos ?? {},
      depositFee: initialState.depositFee,
      paymentMethod: initialState.paymentMethod,
      markAsReserved: initialState.markAsReserved ?? false,
      comments: initialState.comments,
    },
    validateOnMount: false,
  });

  const errorAttr = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: (state: any) => ({ error: state.errors[0] }),
  };

  const [selectedUser, userAttr] = defineField('memberId', errorAttr);

  const fullName = computed({
    get: () => values.contactInfo?.fullName,
    set: (value: string) => {
      setFieldValue('contactInfo.fullName', value);
    },
  });
  const email = computed({
    get: () => values.contactInfo?.email,
    set: (value: string) => {
      setFieldValue('contactInfo.email', value);
    },
  });
  const phone = computed({
    get: () => values.contactInfo?.phone,
    set: (value: string) => {
      setFieldValue('contactInfo.phone', value);
    },
  });
  const [dateBorrow, dateBorrowAttr] = defineField('dateBorrow', errorAttr);
  const [dateReturn, dateReturnAttr] = defineField('dateReturn', errorAttr);
  const [depositFee, depositFeeAttr] = defineField('depositFee', errorAttr);

  const updateGear = (id: GearItemId, amount: number | undefined) => {
    setFieldValue('gear', { ...values.gear, [id]: amount });
  };
  const updateTopos = (id: TopoId, amount: number | undefined) => {
    setFieldValue('topos', { ...values.topos, [id]: amount });
  };

  const paymentMethod = computed({
    get: () => values.paymentMethod,
    set: (value: Enums<'payment_method'>) => {
      setFieldValue('paymentMethod', value);
    },
  });

  const markAsReserved = computed({
    get: () => values.markAsReserved ?? false,
    set: (value: boolean) => {
      setFieldValue('markAsReserved', value);
    },
  });

  const comments = computed({
    get: () => values.comments,
    set: (value: string) => {
      setFieldValue('comments', value);
    },
  });

  return {
    selectedUser,
    userAttr,
    contactInfo: {
      fullName,
      email,
      phone,
    },
    selectedGear: computed(() => values.gear ?? {}),
    updateGear,
    selectedTopos: computed(() => values.topos ?? {}),
    updateTopos,
    dateBorrow,
    dateBorrowAttr,
    dateReturn,
    dateReturnAttr,
    depositFee,
    depositFeeAttr,
    paymentMethod,
    markAsReserved,
    comments,
    meta,
    handleSubmit,
    errors,
    validateField,
    values,
    isSubmitting,
  };
}
