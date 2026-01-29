export function sum(array: number[]): number {
  return array.reduce((sum, current) => sum + current, 0);
}

export function sumOf<T extends Record<K, number>, K extends keyof T>(
  array: T[],
  key: K,
): number {
  return array.reduce((sum, current) => sum + current[key], 0);
}

export type DropNull<T> = T extends null ? never : T;

export function search(content: string, searchTerm: string): boolean {
  if (!content) return false;
  return content.toLowerCase().includes(searchTerm.toLowerCase());
}

export function fuzzySearch(content: string, searchTerm: string): number {
  if (!content) return 0;
  content = content.toLowerCase();
  const searchTerms = searchTerm.toLowerCase().split(' ');
  const matches = searchTerms
    .map((term) => content.match(term))
    .filter((v) => v !== null);

  return matches.length == searchTerms.length ? 1 : 0;
}

export function single<T>(array: T[]): T | undefined {
  if (array.length > 1)
    throw Error(
      'Cannot convert array containting multiple elements to a single element!',
    );
  else if (array.length === 0) return undefined;
  else return array[0];
}
