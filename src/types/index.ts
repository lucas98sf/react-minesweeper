import { MAX_WIDTH, MAX_HEIGHT } from '@/config/constants';

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

export type Board = Square[][];

export enum MouseButton {
  left,
  middle,
  right,
}
