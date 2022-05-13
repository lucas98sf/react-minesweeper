import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from "../config/constants";
import { SquaresBoard, SquareState, SquareCoords, Value } from "../types";

const squareIsAround = (
	{ row, col }: SquareCoords,
	{ row: clickedRow, col: clickedCol }: SquareCoords
): boolean => {
	if (
		([clickedRow - 1, clickedRow + 1].includes(row) &&
			[clickedCol - 1, clickedCol + 1].includes(col)) || //corners
		(clickedRow === row && [clickedCol - 1, clickedCol + 1].includes(col)) || //up or down
		(clickedCol === col && [clickedRow - 1, clickedRow + 1].includes(row)) //right or left
	)
		return true;

	return false;
};

const generateBombs = (firstClick: SquareCoords): SquareCoords[] => {
	const { row: clickedRow, col: clickedCol } = firstClick;

	const bombs: SquareCoords[] = [];
	const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;
	for (let i = 0; i < NUM_BOMBS; i++) {
		const newBomb: SquareCoords = {
			row: randomCoord(MAX_HEIGHT),
			col: randomCoord(MAX_WIDTH),
		};
		const validLocation =
			!bombs.some(
				(bomb) => bomb.row === newBomb.row && bomb.col === newBomb.col
			) &&
			!squareIsAround(newBomb, firstClick) &&
			!(newBomb.row === clickedRow && newBomb.col === clickedCol);
		validLocation ? bombs.push(newBomb) : --i;
	}

	return bombs;
};

const getSquareValue = (
	squares: SquaresBoard,
	squareCoords: SquareCoords
): Value => {
	let bombCount = 0;
	squares.forEach((rows, row) => {
		rows.forEach((columns, col) => {
			const square: SquareState = squares[row][col];
			if (squareIsAround({ row, col }, squareCoords) && square.hasBomb) {
				bombCount++;
			}
		});
	});
	return bombCount;
};

const flagsAroundSquare = (
	squares: SquaresBoard,
	clickCoords: SquareCoords
): number => {
	let flagsCount = 0;
	squares.forEach((rows, row) => {
		rows.forEach((columns, col) => {
			if (
				squareIsAround({ row, col }, clickCoords) &&
				squares[row][col].state.flagged
			)
				flagsCount++;
		});
	});
	return flagsCount;
};

export const generateEmptySquares = (): SquaresBoard => {
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
			const hasBomb = bombs.some((bomb) => bomb.row === r && bomb.col === c);
			const visible = firstClick.row === r && firstClick.col === c;
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
	clickCoords: SquareCoords
): SquaresBoard => {
	const { row, col } = clickCoords;
	const clickedSquare = squares[row][col];

	clickedSquare.state.value = clickedSquare.hasBomb
		? Value.bomb
		: getSquareValue(squares, clickCoords);
	clickedSquare.state.visible = true;

	const isEmptySquare = clickedSquare.state.value === Value.zero;
	if (isEmptySquare) {
		squares = revealSurroundingSquares(squares, clickCoords);
	}
	return [...squares];
};

export const revealSurroundingSquares = (
	squares: SquaresBoard,
	clickCoords: SquareCoords
): SquaresBoard => {
	const { row: clickedRow, col: clickedCol } = clickCoords;

	const clickedSquare = squares[clickedRow][clickedCol];
	const squareValue = clickedSquare.state.value as Number;
	if (
		squareValue === 0 ||
		squareValue === flagsAroundSquare(squares, clickCoords)
	) {
		squares.forEach((rows, row) => {
			rows.forEach((columns, col) => {
				const square: SquareState = squares[row][col];
				if (
					squareIsAround({ row, col }, clickCoords) &&
					!square.state.visible &&
					!square.state.flagged
				) {
					squares = revealSquare(squares, { row, col });
				}
			});
		});
	}
	return [...squares];
};

export const toggleSquareFlag = (
	squares: SquaresBoard,
	{ row, col }: SquareCoords
): SquaresBoard => {
	const square: SquareState = squares[row][col];
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
