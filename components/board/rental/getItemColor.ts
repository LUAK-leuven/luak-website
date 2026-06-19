import type { RentalItem } from '~/model/rental';

export default function getItemColor(item: RentalItem): string {
  switch (item.getStatus()) {
    case 'fullyReturned':
      return 'bg-green-100';
    case 'partiallyReturned':
      return 'bg-yellow-100';
    case 'notReturned':
      return 'bg-red-100';
    case 'invalid':
      return '';
  }
}
