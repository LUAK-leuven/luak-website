export const formatMembershipYear = (
  membershipYear: number,
  format: 'short' | 'long',
): string => {
  switch (format) {
    case 'short':
      return `${(membershipYear - 2000).toFixed()}-${(membershipYear - 2000 + 1).toFixed()}`;
    case 'long':
      return `${membershipYear.toFixed()}-${(membershipYear + 1).toFixed()}`;
  }
};
