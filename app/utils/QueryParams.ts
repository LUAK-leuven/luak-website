export type QueryParam = (string | null) | (string | null)[] | undefined;

export const asArray = (x: QueryParam): (string | null)[] => {
  if (x === undefined) return [];
  if (typeof x === 'string' || x === null) return [x];
  return x;
};
