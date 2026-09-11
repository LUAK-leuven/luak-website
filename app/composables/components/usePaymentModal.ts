export const usePaymentModal = () => {
  const isOpen = useState<boolean>('PaymentModal.isOpen', () => false);

  return {
    isOpen,
    openPaymentModal: () => {
      isOpen.value = true;
    },
    closePaymentModal: () => {
      isOpen.value = false;
    },
  };
};
