export function sum(array: number[]): number {
  return array.reduce((sum, current) => sum + current, 0);
}

export const sumOf = <T extends Record<K, number>, K extends keyof T>(
  array: T[],
  key: K,
): number => {
  return array.reduce((sum, current) => sum + current[key], 0);
};

export const sumBy = <T>(array: T[], getValue: (i: T) => number): number => {
  return array.reduce((sum, current) => sum + getValue(current), 0);
};

export const single = <T>(array: T[]): T | undefined => {
  if (array.length > 1)
    throw Error(
      'Cannot convert array containing multiple elements to a single element!',
    );
  else if (array.length === 0) return undefined;
  else return array[0];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupBy = <T, K extends keyof any>(
  arr: T[],
  getKey: (i: T) => K,
): Record<K, T[] | undefined> => {
  return arr.reduce(
    (groups, item) => {
      const key = getKey(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[] | undefined>,
  );
};

export const getBy = <T extends Record<K, V>, K extends keyof T, V>(
  arr: T[],
  key: K,
  value: V,
): T => {
  const res = arr.find((x) => x[key] === value);
  if (res === undefined) {
    console.error('getBy:', arr);
    throw Error(
      `Could not find by ${key.toString()} with value ${value} in [${arr.join()}]`,
    );
  }
  return res;
};

export const findBy = <T extends Record<K, V>, K extends keyof T, V>(
  arr: T[] | undefined,
  key: K,
  value: V,
): T | undefined => {
  return arr?.find((x) => x[key] === value);
};

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sortBy = <T extends Record<K, string>, K extends keyof T>(
  arr: T[],
  key: K,
) => {
  return arr.toSorted((a, b) =>
    a[key].toLowerCase() < b[key].toLowerCase()
      ? -1
      : a[key] === b[key]
        ? 0
        : 1,
  );
};

export const min = <T>(
  arr: T[],
  predicate: (a: T, b: T) => boolean = (a, b) => a < b,
): T | null => {
  return arr.reduce<T | null>((minVal, it) => {
    if (minVal === null) return it;
    return predicate(minVal, it) ? minVal : it;
  }, null);
};

export const uuidRegex = `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`;

export const randomOf = <T>(arr: T[]): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  arr[Math.floor(Math.random() * arr.length)]!;
