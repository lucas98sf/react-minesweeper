import { beforeEach, describe, expect, it } from "vitest";

import { NUM_MINES } from "~/config/constants";
import { Minesweeper } from "~/core/Minesweeper";
import {
	BoardConfig,
	MouseButton,
	SquarePosition,
	Squares,
} from "~/core/types";

import * as mocks from "./mocks";

// almost everything written by chatgpt btw

describe("minesweeper logic", () => {
	let minesweeper: Minesweeper;
	let firstClick: SquarePosition;
	beforeEach(() => {
		minesweeper = new Minesweeper({
			guessFree: true,
		});
		firstClick = { row: 2, col: 2 };
	});

	describe("generateEmptySquares", () => {
		it("generates an empty board", () => {
			expect(minesweeper.board.squares).toEqual(
				expect.arrayContaining([
					expect.arrayContaining([
						expect.objectContaining({
							surroundings: expect.any(Array),
							state: { flagged: false, revealed: false },
						}),
					]),
				]),
			);
		});
	});

	describe("generateMines", () => {
		it("generates the correct amount of mines", () => {
			minesweeper.handleAction(MouseButton.left, firstClick);

			const mines = minesweeper.board.squares
				.flat()
				.filter((square) => square.value === "mine");
			expect(mines).toHaveLength(NUM_MINES);
		});
	});

	describe("generateSquaresValues", () => {
		it("generates squares with the correct values", () => {
			minesweeper.handleAction(MouseButton.left, firstClick);

			expect(minesweeper.board.squares).toEqual(
				expect.arrayContaining([
					expect.arrayContaining([
						expect.objectContaining({
							surroundings: expect.any(Array),
							value: expect.any(Number),
							state: expect.objectContaining({
								flagged: false,
								revealed: expect.any(Boolean),
							}),
						}),
					]),
				]),
			);

			expect(
				minesweeper.board.squares
					.flat()
					.filter((square) => square.value === "mine"),
			).toHaveLength(NUM_MINES);
		});
	});

	describe("revealSquare", () => {
		it("reveals the correct square", () => {
			const clickCoords: SquarePosition = { row: 1, col: 1 };
			minesweeper.handleAction(MouseButton.left, firstClick);
			minesweeper.handleAction(MouseButton.left, clickCoords);

			expect(
				minesweeper.board.squares[clickCoords.row][clickCoords.col].state
					.revealed,
			).toBe(true);
		});
	});

	describe("revealSurroundingSquares", () => {
		it("reveals the correct surrounding squares of first click, without mines nearby", () => {
			minesweeper.handleAction(MouseButton.left, firstClick);

			expect(
				minesweeper.board.squares[firstClick.row][firstClick.col].surroundings
					.flat()
					.every(
						({ row, col }) =>
							minesweeper.board.squares[row][col].state.revealed &&
							minesweeper.board.squares[row][col].value !== "mine",
					),
			).toBe(true);
		});
	});

	describe("toggleSquareFlag", () => {
		it("toggles the flag on the correct square", () => {
			minesweeper.handleAction(MouseButton.left, firstClick);
			expect(minesweeper.board.flagsLeft).toBe(NUM_MINES);

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const clickCoords: SquarePosition = minesweeper.board.squares
				.flat()
				.find((square) => square.value === "mine")?.position as SquarePosition;

			minesweeper.handleAction(MouseButton.right, clickCoords);
			expect(
				minesweeper.board.squares[clickCoords.row][clickCoords.col].state
					.flagged,
			).toBe(true);
			expect(minesweeper.board.flagsLeft).toBe(NUM_MINES - 1);

			minesweeper.handleAction(MouseButton.right, clickCoords);
			expect(
				minesweeper.board.squares[clickCoords.row][clickCoords.col].state
					.flagged,
			).toBe(false);
			expect(minesweeper.board.flagsLeft).toBe(NUM_MINES);
		});
	});

	describe("isGameLost", () => {
		it("returns true when a mine is revealed", () => {
			minesweeper.handleAction(MouseButton.left, firstClick);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const minePosition = minesweeper.board.squares
				.flat()
				.find((square) => square.value === "mine")?.position;
			minesweeper.handleAction(
				MouseButton.left,
				minePosition as SquarePosition,
			);

			expect(minesweeper.state).toMatchObject({
				result: "lose",
				gameOver: true,
			});
		});
	});

	describe("isGameWon", () => {
		it("returns true when or all safe squares are revealed", () => {
			minesweeper.handleAction(MouseButton.left, firstClick);

			const safeSquares = minesweeper.board.squares
				.flat()
				.filter((square) => square.value !== "mine");

			for (const { position } of safeSquares) {
				minesweeper.handleAction(MouseButton.left, position);
			}

			expect(minesweeper.state).toMatchObject({
				result: "win",
				gameOver: true,
			});
		});
	});

	describe("isBoardSolvable", () => {
		it("should return true when board is solvable", () => {
			expect(minesweeper.isBoardSolvable(mocks.solvableBoard as Squares)).toBe(
				true,
			);
			expect(minesweeper.isBoardSolvable(mocks.solvableBoard2 as Squares)).toBe(
				true,
			);
		});

		it("should return false when board is not solvable", () => {
			expect(minesweeper.isBoardSolvable(mocks.needGuessBoard as Squares)).toBe(
				false,
			);
			expect(
				minesweeper.isBoardSolvable(mocks.needGuessBoard2 as Squares),
			).toBe(false);
		});

		it("should solve an 11211 pattern case", () => {
			expect(minesweeper.isBoardSolvable(mocks.pattern11211 as Squares)).toBe(
				true,
			);
		});

		it("should solve an 112211 pattern case", () => {
			Minesweeper.prettyPrintBoard(mocks.pattern112211 as Squares);
			expect(minesweeper.isBoardSolvable(mocks.pattern112211 as Squares)).toBe(
				true,
			);
		});

		it.skip("idk yet", () => {
			Minesweeper.prettyPrintBoard(mocks.randomPattern as Squares);
			expect(minesweeper.isBoardSolvable(mocks.randomPattern as Squares)).toBe(
				true,
			);
		});

		it.skip("mock pattern util", () => {
			const mockPattern = (
				pattern: string,
				width = 11,
				height = 3,
				minesNumber = 9,
				firstClick: SquarePosition = { row: 2, col: 3 },
			) => {
				const patternRegex = new RegExp(
					pattern
						.replaceAll(/\s/g, "")
						.replaceAll("x", "mine")
						.replaceAll("?", "(.|.{4})"),
				);
				do {
					minesweeper = new Minesweeper({
						height,
						width,
						minesNumber,
					} as BoardConfig);
					minesweeper.handleAction(MouseButton.left, firstClick);
				} while (
					!minesweeper.board.squares
						.flat()
						.map((s) => s.value)
						.join("")
						.match(patternRegex)
				);
				expect(minesweeper.board.squares).toMatchInlineSnapshot();
			};

			const pattern = `
      ? ? ? ? ? ? ? ? ? ? ?
      ?	3	2 2 1 ? ? ?	4	3	2
      ?	x	1	0	0	?	?	?	?	x	?
      `;

			mockPattern(pattern);
		});
	});
});
