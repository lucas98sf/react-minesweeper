import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from "../config/constants";
import { Square, Bomb } from "../types";

export const generateSquares = () => {
	const generateBombs = () => {
		const bombs: Bomb[] = [];
		const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;

		for (let i = 0; i < NUM_BOMBS; i++) {
			const newBomb = { r: randomCoord(MAX_HEIGHT), c: randomCoord(MAX_WIDTH) };
			const notInBombs = !bombs.some((bomb) => bomb === newBomb);
			notInBombs ? bombs.push(newBomb) : i--;
		}
		return bombs;
	};

	const bombs = generateBombs(),
		squares: Square[][] = [];

	for (let i = 0; i < MAX_HEIGHT; i++) {
		const row: Square[] = [];
		for (let j = 0; j < MAX_WIDTH; j++) {
			const bomb = bombs.some((bomb) => bomb.r === i && bomb.c === j);
			const square: Square = {
				hasBomb: bomb,
				state: {
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
	squares: Square[][],
	clickedSquareR: number,
	clickedSquareC: number
): number => {
	const isAround = (r: number, c: number): boolean => {
		if (
			([clickedSquareR - 1, clickedSquareR + 1].includes(r) &&
				[clickedSquareC - 1, clickedSquareC + 1].includes(c)) || //corners
			(clickedSquareR === r && [clickedSquareC - 1, clickedSquareC + 1].includes(c)) || //up or down
			(clickedSquareC === c && [clickedSquareR - 1, clickedSquareR + 1].includes(r)) //right or left
		)
			return true;
		else return false;
	};

	let bombCount = 0;
	squares.forEach((rows, r) => {
		rows.forEach((coloumns, c) => {
			const square: Square = squares[r][c];
			if (isAround(r, c) && square.hasBomb) {
				bombCount++;
			}
		});
	});

	return bombCount;
};
