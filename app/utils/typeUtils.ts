export type Defined<T> = T extends undefined ? never : T;

export type Partial2<T> = { [P in keyof T]?: T[P] | undefined };
