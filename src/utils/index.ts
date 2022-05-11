import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from "../config/constants";
import { SquaresBoard, SquareState, SquareCoords, Value } from "../types";

const squareIsAround = (
	{ r, c }: SquareCoords,
	{ r: clickedSquareR, c: clickedSquareC }: SquareCoords
): boolean => {
	if (
		([clickedSquareR - 1, clickedSquareR + 1].includes(r) &&
			[clickedSquareC - 1, clickedSquareC + 1].includes(c)) || //corners
		(clickedSquareR === r &&
			[clickedSquareC - 1, clickedSquareC + 1].includes(c)) || //up or down
		(clickedSquareC === c &&
			[clickedSquareR - 1, clickedSquareR + 1].includes(r)) //right or left
	)
		return true;
	else return false;
};

const generateBombs = (firstClick: SquareCoords): SquareCoords[] => {
	const { r: clickedSquareR, c: clickedSquareC } = firstClick;

	const bombs: SquareCoords[] = [];
	const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;
	for (let i = 0; i < NUM_BOMBS; i++) {
		const newBomb: SquareCoords = {
			r: randomCoord(MAX_HEIGHT),
			c: randomCoord(MAX_WIDTH),
		};
		const validLocation =
			!bombs.some((bomb) => bomb.r === newBomb.r && bomb.c === newBomb.c) &&
			!squareIsAround(newBomb, firstClick) &&
			!(newBomb.r === clickedSquareR && newBomb.c === clickedSquareC);
		validLocation ? bombs.push(newBomb) : --i;
	}
	console.log(bombs);
	return bombs;
};

const getSquareValue = (
	squares: SquaresBoard,
	squareCoords: SquareCoords
): Value => {
	let bombCount = 0;
	squares.forEach((rows, r) => {
		rows.forEach((columns, c) => {
			const square: SquareState = squares[r][c];
			if (squareIsAround({ r, c }, squareCoords) && square.hasBomb) {
				bombCount++;
			}
		});
	});
	return bombCount;
};

const flagsAroundSquare = (
	squares: SquaresBoard,
	clickedSquareCoords: SquareCoords
): number => {
	let flagsCount = 0;
	squares.forEach((rows, r) => {
		rows.forEach((columns, c) => {
			if (
				squareIsAround({ r, c }, clickedSquareCoords) &&
				squares[r][c].state.flagged
			)
				flagsCount++;
		});
	});
	return flagsCount;
};

export const renderEmptySquares = (): SquaresBoard => {
	const squares: SquaresBoard = [];
	for (let i = 0; i < MAX_HEIGHT; i++) {
		const row: SquareState[] = [];
		for (let j = 0; j < MAX_WIDTH; j++) {
			const square: SquareState = {
				hasBomb: false,
				state: {
					flagged: false,
					visible: false,
					value: Value.zero,
				},
			};
			row.push(square);
		}
		squares.push(row);
	}
	return squares;
};

export const generateSquaresValues = (
	firstClick: SquareCoords
): SquaresBoard => {
	const bombs = generateBombs(firstClick);
	const squares: SquaresBoard = [];

	for (let r = 0; r < MAX_HEIGHT; r++) {
		const row: SquareState[] = [];
		for (let c = 0; c < MAX_WIDTH; c++) {
			const hasBomb = bombs.some((bomb) => bomb.r === r && bomb.c === c);
			const visible = r === firstClick.r && c === firstClick.c;
			const square: SquareState = {
				hasBomb,
				state: {
					flagged: false,
					visible,
					value: hasBomb ? Value.bomb : Value.zero,
				},
			};
			row.push(square);
		}
		squares.push(row);
	}
	const squaresAfterFirstClick = revealSurroundingSquares(squares, firstClick);
	return squaresAfterFirstClick;
};

export const revealSquare = (
	squares: SquaresBoard,
	clickedSquareCoords: SquareCoords
): SquaresBoard => {
	const { r, c } = clickedSquareCoords;
	const clickedSquare = squares[r][c];

	clickedSquare.state.value = clickedSquare.hasBomb
		? Value.bomb
		: getSquareValue(squares, clickedSquareCoords);
	clickedSquare.state.visible = true;

	const isEmptySquare = clickedSquare.state.value === Value.zero;
	if (isEmptySquare) {
		squares = revealSurroundingSquares(squares, clickedSquareCoords);
	}
	return [...squares];
};

export const revealSurroundingSquares = (
	squares: SquaresBoard,
	clickedSquareCoords: SquareCoords
): SquaresBoard => {
	const { r: clickedSquareR, c: clickedSquareC } = clickedSquareCoords;

	const clickedSquare = squares[clickedSquareR][clickedSquareC];
	const squareValue = clickedSquare.state.value as Number;
	if (
		squareValue === 0 ||
		squareValue === flagsAroundSquare(squares, clickedSquareCoords)
	) {
		squares.forEach((rows, r) => {
			rows.forEach((columns, c) => {
				const square: SquareState = squares[r][c];
				if (
					squareIsAround({ r, c }, clickedSquareCoords) &&
					!square.state.visible &&
					!square.state.flagged
				) {
					squares = revealSquare(squares, { r, c });
				}
			});
		});
	}
	return [...squares];
};

export const toggleSquareFlag = (
	squares: SquaresBoard,
	{ r, c }: SquareCoords
): SquaresBoard => {
	const square: SquareState = squares[r][c];
	square.state.flagged = !square.state.flagged;
	return [...squares];
};

export const isGameLost = (squares: SquaresBoard): boolean => {
	const clickedSquares = squares
		.flat()
		.filter((square) => square.state.visible);
	return clickedSquares.some((square) => square.hasBomb);
};

export const isGameWon = (squares: SquaresBoard): boolean => {
	const allSquaresRevealedOrFlagged = squares
		.flat()
		.every(
			(square) =>
				(square.state.visible && !square.hasBomb) ||
				(square.state.flagged && square.hasBomb)
		);
	return allSquaresRevealedOrFlagged;
};
