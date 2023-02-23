import {
  generateEmptySquares,
  generateSquaresValues,
  revealSquare,
  revealSurroundingSquares,
  toggleSquareFlag,
  isGameLost,
  isGameWon,
  isBoardSolvable,
} from '@/functions/minesweeper';
import { describe, it, expect } from 'vitest';
import { Board, SquarePosition } from '@/types';
import * as mocks from './mocks';

// almost everything written by chatgpt btw

describe('minesweeper logic', () => {
  describe('generateEmptySquares', () => {
    it('generates an empty board', () => {
      const squares = generateEmptySquares();
      expect(squares).toEqual(
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

  describe('generateSquaresValues', () => {
    it('generates squares with the correct values', () => {
      const firstClick: SquarePosition = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);

      expect(squares).toEqual(
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
    });
  });

  describe('revealSquare', () => {
    it('reveals the correct square', () => {
      const firstClick: SquarePosition = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);

      const clickCoords: SquarePosition = { row: 0, col: 1 };
      const newSquares = revealSquare(squares, clickCoords);

      expect(newSquares[clickCoords.row][clickCoords.col].state.revealed).toBe(true);
    });
  });

  describe('revealSurroundingSquares', () => {
    it('reveals the correct surrounding squares', () => {
      const firstClick: SquarePosition = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);

      const newSquares = revealSurroundingSquares(squares, firstClick);

      expect(
        newSquares.flat().every(square => !(square.state.revealed && square.value === 'mine')),
      ).toBe(true);
    });
  });

  describe('toggleSquareFlag', () => {
    it('toggles the flag on the correct square', () => {
      const firstClick: SquarePosition = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);

      const clickCoords: SquarePosition = { row: 0, col: 1 };
      const newSquares = toggleSquareFlag(squares, clickCoords);

      expect(newSquares[clickCoords.row][clickCoords.col].state.flagged).toBe(true);
    });
  });

  describe('isGameLost', () => {
    it('returns true when a mine is revealed', () => {
      const squares = generateSquaresValues({ row: 0, col: 0 });

      const mineIndex = squares.flat().findIndex(square => square.value === 'mine');
      const mineCoords = {
        row: Math.floor(mineIndex / squares[0].length),
        col: mineIndex % squares[0].length,
      };
      squares[mineCoords.row][mineCoords.col].state.revealed = true;

      const isLost = isGameLost(squares);
      expect(isLost).toBe(true);
    });
  });

  describe('isGameWon', () => {
    it('returns true when all mines are flagged or all squares are revealed', () => {
      const squares = generateSquaresValues({ row: 3, col: 3 });

      const mineSquares = squares.flat().filter(square => square.value === 'mine');
      const safeSquares = squares.flat().filter(square => square.value !== 'mine');

      for (const mineSquare of mineSquares) {
        mineSquare.state.flagged = true;
      }

      for (const safeSquare of safeSquares) {
        safeSquare.state.revealed = true;
      }

      const isWon = isGameWon(squares);
      expect(isWon).toBe(true);
    });
  });

  describe('isBoardSolvable', () => {
    it('should return true when board is solvable', () => {
      expect(isBoardSolvable(mocks.solvableBoard as Board)).toBe(true);
      expect(isBoardSolvable(mocks.solvableBoard2 as Board)).toBe(true);
    });

    it('should return false when board is not solvable', () => {
      expect(isBoardSolvable(mocks.needGuessBoard as Board)).toBe(false);
      expect(isBoardSolvable(mocks.needGuessBoard2 as Board)).toBe(false);
    });
  });
});
