export function sum(array: number[]) {
  return array.reduce((sum, current) => sum + current, 0);
}

export type DropNull<T> = T extends null ? never : T;
