import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from "../config/constants";
import { Square, Bomb } from "../types";

export const generateSquares = () => {
	const generateBombs = () => {
		const bombs: Bomb[] = [];
		const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;

		for (let i = 0; i < NUM_BOMBS; i++) {
			const newBomb = { x: randomCoord(MAX_HEIGHT), y: randomCoord(MAX_WIDTH) };
			const notInBombs = !bombs.some((bomb) => bomb === newBomb);
			notInBombs ? bombs.push(newBomb) : i--;
		}
		return bombs;
	};

	const bombs = generateBombs(),
		squares: Square[][] = [];

	for (let x = 0; x < MAX_HEIGHT; x++) {
		const row: Square[] = [];
		for (let y = 0; y < MAX_WIDTH; y++) {
			const bomb = bombs.some((bomb) => bomb.x === x && bomb.y === y);
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
	clickedSquareX: number,
	clickedSquareY: number
): number => {
	const isAround = (x: number, y: number): boolean => {
		if (
			([clickedSquareX - 1, clickedSquareX + 1].includes(x) &&
				[clickedSquareY - 1, clickedSquareY + 1].includes(y)) || //corners
			(clickedSquareX === x && [clickedSquareY - 1, clickedSquareY + 1].includes(y)) || //up or down
			(clickedSquareY === y && [clickedSquareX - 1, clickedSquareX + 1].includes(x)) //right or left
		)
			return true;
		else return false;
	};

	let bombCount = 0;
	squares.forEach((rows, x) => {
		rows.forEach((_, y) => {
			const square: Square = squares[x][y];
			if (isAround(x, y) && square.hasBomb) {
				bombCount++;
			}
		});
	});

	return bombCount;
};
