import dayjs from 'dayjs';

export function formatToDMY(dateString: string): string {
  if (!dateString) return '';
  
  const parsedDate = dayjs(dateString);
  if (!parsedDate.isValid()) {
    console.warn(`formatToDMY received an invalid date string: "${dateString}"`);
    return '';
  }

  return parsedDate.format('DD-MM-YYYY');
}