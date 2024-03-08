import {
	MAX_HEIGHT,
	MAX_WIDTH,
	MIN_HEIGHT,
	MIN_WIDTH,
} from "~/config/constants";

import { Add, IntRange } from "./utils";

export type SquarePosition<
	X extends number = typeof MAX_WIDTH,
	Y extends number = typeof MAX_HEIGHT,
> = {
	readonly row: IntRange<0, X>;
	readonly col: IntRange<0, Y>;
};

export type SquareValue = null | IntRange<0, 9> | "mine";

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
	result: "win" | "lose" | null;
	isFirstMove: boolean;
};

export type BoardState = {
	readonly config: BoardConfig;
	readonly squares: Squares;
	readonly flagsLeft: typeof maxMines;
};

export const isSquarePosition = (
	obj: Record<string, unknown>,
): obj is SquarePosition => {
	return "row" in obj && "col" in obj;
};
