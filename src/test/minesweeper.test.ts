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
              hasBomb: false,
              state: { flagged: false, visible: false, value: null },
            }),
          ]),
        ]),
      );
    });
  });

  describe('generateSquaresValues', () => {
    it('generates squares with the correct values', () => {
      const firstClick = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);
      expect(squares).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              hasBomb: expect.any(Boolean),
              state: expect.objectContaining({
                flagged: false,
                visible: expect.any(Boolean),
                value: expect.any(Number),
              }),
            }),
          ]),
        ]),
      );
    });
  });

  describe('revealSquare', () => {
    it('reveals the correct square', () => {
      const firstClick = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);
      const clickCoords = { row: 0, col: 1 };
      const newSquares = revealSquare(squares, clickCoords);
      expect(newSquares[clickCoords.row][clickCoords.col].state.visible).toBe(true);
    });
  });

  describe('revealSurroundingSquares', () => {
    it('reveals the correct surrounding squares', () => {
      const firstClick = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);
      const newSquares = revealSurroundingSquares(squares, firstClick);
      expect(
        newSquares.every(row => row.every(square => !(square.state.visible && square.hasBomb))),
      ).toBe(true);
    });
  });

  describe('toggleSquareFlag', () => {
    it('toggles the flag on the correct square', () => {
      const firstClick = { row: 0, col: 0 };
      const squares = generateSquaresValues(firstClick);
      const clickCoords = { row: 0, col: 1 };
      const newSquares = toggleSquareFlag(squares, clickCoords);
      expect(newSquares[clickCoords.row][clickCoords.col].state.flagged).toBe(true);
    });
  });

  describe('isGameLost', () => {
    it('returns true when a bomb is revealed', () => {
      const squares = generateSquaresValues({ row: 0, col: 0 });
      const bombIndex = squares.flat().findIndex(square => square.hasBomb);
      const bombCoords = {
        row: Math.floor(bombIndex / squares[0].length),
        col: bombIndex % squares[0].length,
      };
      squares[bombCoords.row][bombCoords.col].state.visible = true;
      const isLost = isGameLost(squares);
      expect(isLost).toBe(true);
    });
  });

  describe('isGameWon', () => {
    it('returns true when all bombs are flagged or all squares are revealed', () => {
      const squares = generateSquaresValues({ row: 3, col: 3 });
      const bombSquares = squares.flat().filter(square => square.hasBomb);
      const safeSquares = squares.flat().filter(square => !square.hasBomb);
      // flag all bombs
      bombSquares.forEach(bombSquare => {
        // eslint-disable-next-line no-param-reassign
        bombSquare.state.flagged = true;
      });
      // reveal all safe squares
      safeSquares.forEach(safeSquare => {
        // eslint-disable-next-line no-param-reassign
        safeSquare.state.visible = true;
      });
      const isWon = isGameWon(squares);
      expect(isWon).toBe(true);
    });
  });

  describe('isBoardSolvable', () => {
    it('should return true when board is solvable', () => {
      expect(isBoardSolvable(mocks.solvableBoard)).toBe(true);
      expect(isBoardSolvable(mocks.solvableBoard2)).toBe(true);
    });

    it('should return false when board is not solvable', () => {
      expect(isBoardSolvable(mocks.needGuessBoard)).toBe(false);
      expect(isBoardSolvable(mocks.needGuessBoard2)).toBe(false);
    });
  });
});
