export const formatLongDate = (
  date: Date | string,
  locale?: Intl.LocalesArgument,
): string =>
  new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
