export type Defined<T> = T extends null
  ? never
  : T extends undefined
    ? never
    : T;

export type Unwrap<T> = T extends Promise<infer U> ? U : never;

export type PickFunctionNames<T> = {
  [K in keyof T]: T[K] extends (...args: never) => unknown ? K : never;
}[keyof T];

export type ExtractFunctionArguments<T> = T extends (
  ...args: infer Args
) => unknown
  ? Args
  : never;

export type Partial2<T> = { [P in keyof T]?: T[P] | undefined };
