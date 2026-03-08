/* eslint-disable @typescript-eslint/no-explicit-any */

export type Defined<T> = T extends null
  ? never
  : T extends undefined
    ? never
    : T;

export type GetReturn<T> = T extends (...args: any) => infer R ? R : never;

export type Unwrap<T> = T extends Promise<infer U> ? U : never;
