export type Date = `${number}-${number}-${number}`;

export type Amount = number & { readonly __brand_amount: unique symbol };
export const amount = (n: number): Amount => {
  if (!Number.isSafeInteger(n))
    throw new Error(`Amount must be an integer, but got ${n.toPrecision()}`);
  if (n < 0)
    throw new Error(`Amount must be a positive number, but got ${n.toFixed()}`);
  return n as Amount;
};

export type Year = number & { readonly __brand_year: unique symbol };
export const year = (n: number): Year => {
  if (!Number.isSafeInteger(n))
    throw new Error(`Year must be an integer, but got ${n.toPrecision()}`);
  return n as Year;
};
