export function sum(array: number[]): number {
  return array.reduce((sum, current) => sum + current, 0);
}

export function sumOf<T extends Record<K, number>, K extends keyof T>(
  array: T[],
  key: K,
): number {
  return array.reduce((sum, current) => sum + current[key], 0);
}

export function search(
  content: string,
  searchTerm: string | undefined,
): boolean {
  if (!searchTerm) return true;
  if (!content) return false;
  return content.toLowerCase().includes(searchTerm.toLowerCase());
}

export function fuzzySearch(
  content: string,
  searchTerm: string | undefined,
): number {
  if (!content) return 0;
  if (!searchTerm) return 1;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy<T, K extends keyof any>(
  arr: T[],
  getKey: (i: T) => K,
): Record<K, T[]> {
  return arr.reduce(
    (groups, item) => {
      const key = getKey(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

export function getBy<T extends Record<K, V>, K extends keyof T, V>(
  arr: T[],
  key: K,
  value: V,
): T {
  const res = arr.find((x) => x[key] === value);
  if (res === undefined) {
    console.error('getBy:', arr);
    throw Error(
      `Could not find by ${key} with value ${value} in [${arr.join()}]`,
    );
  }
  return res;
}

export function findBy<T extends Record<K, V>, K extends keyof T, V>(
  arr: T[] | undefined,
  key: K,
  value: V,
): T | undefined {
  return arr?.find((x) => x[key] === value);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function matchAny<T extends string>(tags: T[], selected: T[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((it) => tags.includes(it));
}

export function matchOnFirstLetters(name: string, input: string) {
  return (
    input.toLowerCase() ===
    name
      .split(' ')
      .map((x) => x.at(0))
      .join('')
      .toLowerCase()
  );
}
