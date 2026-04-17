import {
  MAX_HEIGHT,
  MAX_WIDTH,
  type MIN_HEIGHT,
  type MIN_WIDTH,
} from "~/config/constants";

import type { Add, IntRange } from "./utils";

export interface SquarePosition<
  X extends number = typeof MAX_WIDTH,
  Y extends number = typeof MAX_HEIGHT,
> {
  readonly col: IntRange<0, Y>;
  readonly row: IntRange<0, X>;
}

export type SquareValue = null | IntRange<0, 9> | "mine";

export interface Square {
  readonly position: SquarePosition;
  state: {
    revealed: boolean;
    flagged: boolean;
  };
  readonly surroundings: SquarePosition[];
  value?: SquareValue;
}

export type Squares = Square[][];

const maxMines = MAX_HEIGHT * MAX_WIDTH - 1;

export interface BoardConfig {
  guessFree: boolean;
  height: IntRange<typeof MIN_HEIGHT, Add<1, typeof MAX_HEIGHT>>;
  minesNumber: typeof maxMines;
  randomizer: () => number;
  width: IntRange<typeof MIN_WIDTH, Add<1, typeof MAX_WIDTH>>;
}

export interface GameState {
  gameOver: boolean;
  isFirstMove: boolean;
  result: "win" | "lose" | null;
}

export interface BoardState {
  readonly config: BoardConfig;
  readonly flagsLeft: typeof maxMines;
  readonly squares: Squares;
}

export const isSquarePosition = (obj: unknown): obj is SquarePosition =>
  typeof obj === "object" && obj !== null && "row" in obj && "col" in obj;
