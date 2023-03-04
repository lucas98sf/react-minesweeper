import { MAX_HEIGHT, MAX_WIDTH, MIN_HEIGHT, MIN_WIDTH } from '@/config/constants';

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export type SquarePosition<
  X extends number = typeof MAX_WIDTH,
  Y extends number = typeof MAX_HEIGHT,
> = {
  readonly row: IntRange<0, X>;
  readonly col: IntRange<0, Y>;
};

export type SquareValue = null | IntRange<0, 9> | 'mine';

export type Square = {
  readonly surroundings: SquarePosition[];
  readonly position: SquarePosition;
  value?: SquareValue;
  state: {
    revealed: boolean;
    flagged: boolean;
  };
};

export type Squares = Square[][];

const maxMines = MAX_HEIGHT * MAX_WIDTH - 1;

export type BoardConfig = {
  guessFree: boolean;
  minesNumber: typeof maxMines;
  width: IntRange<typeof MIN_WIDTH, Add<1, typeof MAX_WIDTH>>;
  height: IntRange<typeof MIN_HEIGHT, Add<1, typeof MAX_HEIGHT>>;
  randomizer: () => number;
};

export type GameState = {
  gameOver: boolean;
  result: 'win' | 'lose' | null;
  isFirstMove: boolean;
};

export type BoardState = {
  readonly config: BoardConfig;
  readonly squares: Squares;
  readonly flagsLeft: typeof maxMines;
};

export enum MouseButton {
  left,
  middle,
  right,
}

export const isSquarePosition = (obj: Record<string, unknown>): obj is SquarePosition => {
  return 'row' in obj && 'col' in obj;
};

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
