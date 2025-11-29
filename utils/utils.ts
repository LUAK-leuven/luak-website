export function sum(array: number[]): number {
  return array.reduce((sum, current) => sum + current, 0);
}

export function sumOf<T extends { [k: string]: number }>(
  array: T[],
  key: keyof T,
): number {
  return array.reduce((sum, current) => sum + current[key], 0);
}

export type DropNull<T> = T extends null ? never : T;

export function search(content: string, searchTerm: string): boolean {
  if (!content) return false;
  return content.toLowerCase().includes(searchTerm.toLowerCase());
}
