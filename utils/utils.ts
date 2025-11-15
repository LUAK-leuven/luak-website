export function sum(array: number[]) {
  return array.reduce((sum, current) => sum + current, 0);
}
