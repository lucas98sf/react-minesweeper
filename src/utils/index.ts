import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from "../config/constants";
import { SquaresState, BombCoords } from "../types";

export const generateSquares = () => {
	const generateBombs = () => {
		const bombs: BombCoords[] = [];
		const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;

		for (let i = 0; i < NUM_BOMBS; i++) {
			const newBomb = { r: randomCoord(MAX_HEIGHT), c: randomCoord(MAX_WIDTH) };
			const notInBombs = !bombs.some((bomb) => bomb === newBomb);
			notInBombs ? bombs.push(newBomb) : i--;
		}
		return bombs;
	};

	const bombs = generateBombs(),
		squares: SquaresState[][] = [];

	for (let i = 0; i < MAX_HEIGHT; i++) {
		const row: SquaresState[] = [];
		for (let j = 0; j < MAX_WIDTH; j++) {
			const bomb = bombs.some((bomb) => bomb.r === i && bomb.c === j);
			const square: SquaresState = {
				hasBomb: bomb,
				state: {
					flagged: false,
					visible: false,
					value: bomb ? 9 : 0,
				},
			};
			row.push(square);
		}
		squares.push(row);
	}
	return squares;
};

export const getSquareNumber = (
	squares: SquaresState[][],
	clickedSquareR: number,
	clickedSquareC: number
): number => {
	let bombCount = 0;
	squares.forEach((rows, r) => {
		rows.forEach((columns, c) => {
			const square: SquaresState = squares[r][c];
			if (squareIsAround(r, clickedSquareR, c, clickedSquareC) && square.hasBomb) {
				bombCount++;
			}
		});
	});

	return bombCount;
};

export const squareIsAround = (
	r: number,
	clickedSquareR: number,
	c: number,
	clickedSquareC: number
): boolean => {
	if (
		([clickedSquareR - 1, clickedSquareR + 1].includes(r) &&
			[clickedSquareC - 1, clickedSquareC + 1].includes(c)) || //corners
		(clickedSquareR === r && [clickedSquareC - 1, clickedSquareC + 1].includes(c)) || //up or down
		(clickedSquareC === c && [clickedSquareR - 1, clickedSquareR + 1].includes(r)) //right or left
	)
		return true;
	else return false;
};
