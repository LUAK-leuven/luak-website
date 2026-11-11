import * as yup from 'yup';

import type { GearItemId } from '#shared/api/rest/gear';
import type { RentalItemId } from '#shared/api/rest/rental';
import type { TopoId } from '#shared/api/rest/topo';
import type { UserId } from '#shared/api/rest/user';
import type { RentalItem } from '#shared/types/board/form/RentalItem';
import { depositFeeSchema } from '~/composables/board/rental/depositFeeSchema';
import { createRentalSelectionSchema } from '~/composables/board/rental/selectionSchema';

type RentalFormState = {
  memberId: UserId | 'non-user';
  contactInfo:
    | {
        fullName: string;
        email: string | undefined;
        phone: string | undefined;
      }
    | undefined;
  dateBorrow: string;
  dateReturn: string;
  gear: Record<GearItemId, number>;
  topos: Record<TopoId, number>;
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  comments: string | undefined;
};

export function useRentalForm(
  initialState: Partial2<RentalFormState>,
  allGear: RentalItem<RentalItemId>[],
  allTopos: RentalItem<RentalItemId>[],
) {
  const formSchema = yup.object({
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return context.parent.dateBorrow < date;
        },
      )
      .label('return date'),
    gear: createRentalSelectionSchema(allGear),
    topos: createRentalSelectionSchema(allTopos),
    depositFee: depositFeeSchema,
    paymentMethod: yup.string<'transfer' | 'cash'>().when('depositFee', {
      is: (depositFee: number) => depositFee > 0,
      then: (schema) => schema.required('You must select a payment method.'),
      otherwise: (schema) => schema.notRequired().default('cash'),
    }),
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
            path: this.path,
            message: `One of email or phone number is required`,
          });
        }
        return true;
      }),
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
    // @ts-expect-error again exact optionals being annoying
    initialValues: {
      memberId: initialState.memberId,
      contactInfo: initialState.contactInfo,
      dateBorrow: initialState.dateBorrow,
      dateReturn: initialState.dateReturn,
      gear: initialState.gear ?? {},
      topos: initialState.topos ?? {},
      depositFee: initialState.depositFee,
      paymentMethod: initialState.paymentMethod,
      comments: initialState.comments,
    },
    validateOnMount: false,
  });

  const errorAttr = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    props: (state: any) => ({ error: state.errors[0] }),
  };

  const [selectedUser, userAttr] = defineField('memberId', errorAttr);

  const [fullName] = defineField('contactInfo.fullName');
  const [email] = defineField('contactInfo.email');
  const [phone] = defineField('contactInfo.phone');

  const [dateBorrow, dateBorrowAttr] = defineField('dateBorrow', errorAttr);
  const [dateReturn, dateReturnAttr] = defineField('dateReturn', errorAttr);
  const [depositFee, depositFeeAttr] = defineField('depositFee', errorAttr);

  const updateGear = (id: RentalItemId, amount: number | undefined) => {
    setFieldValue('gear', { ...values.gear, [id]: amount });
  };
  const updateTopos = (id: RentalItemId, amount: number | undefined) => {
    setFieldValue('topos', { ...values.topos, [id]: amount });
  };

  const paymentMethod = computed({
    get: () => values.paymentMethod,
    set: (value: Enums<'payment_method'>) => {
      setFieldValue('paymentMethod', value);
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
    comments,
    meta,
    handleSubmit,
    errors,
    validateField,
    values,
    isSubmitting,
  };
}
