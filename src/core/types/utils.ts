type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

type Length<T extends unknown[]> = T extends { length: infer L } ? L : never;

type BuildTuple<L extends number, T extends unknown[] = []> = T extends { length: L }
  ? T
  : BuildTuple<L, [...T, unknown]>;

export type Add<A extends number, B extends number> = Length<[...BuildTuple<A>, ...BuildTuple<B>]>;

export type Subtract<A extends number, B extends number> = BuildTuple<A> extends [
  ...infer U,
  ...BuildTuple<B>,
]
  ? Length<U>
  : never;

export const enum MouseButton {
  left,
  middle,
  right,
}
