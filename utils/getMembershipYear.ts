export default function getMembershipYear(
  referenceDate: Date = new Date(),
): number {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;

  return currentMonth >= 6 ? currentYear : currentYear - 1;
}

export function getActiveMembershipValidFromDate(
  referenceDate: Date = new Date(),
): Date {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const validFromYear = currentMonth >= 8 ? currentYear : currentYear - 1;

  return new Date(validFromYear, 5, 1);
}

export function isActiveMembership(
  purchaseDate: Date | string,
  referenceDate: Date = new Date(),
): boolean {
  const parsedPurchaseDate =
    purchaseDate instanceof Date ? purchaseDate : new Date(purchaseDate);

  if (Number.isNaN(parsedPurchaseDate.getTime())) return false;

  return parsedPurchaseDate >= getActiveMembershipValidFromDate(referenceDate);
}
