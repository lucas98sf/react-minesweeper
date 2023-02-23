import React, { useState, useEffect, useRef } from 'react';
import { Square as SquareType, MouseButton, SquarePosition, Board as BoardType } from '@/types';
import {
  generateEmptySquares,
  generateSquaresValues,
  revealSquare,
  revealSurroundingSquares,
  toggleSquareFlag,
  isGameLost,
  isGameWon,
} from '@/functions/minesweeper';
import { Mine } from './Mine';
import { Square } from './Square';
import { Flag } from './Flag';

export function Board() {
  const [squares, setSquares] = useState<BoardType>(generateEmptySquares());
  const isFirstClick = useRef<boolean>(true);

  document.addEventListener('contextmenu', e => {
    const target = e.target as HTMLElement;
    if (target?.tagName !== 'BODY') {
      e.preventDefault();
    }
  }); //dont show context menu on right click

  const handleClick = (button: MouseButton, clickedCoords: SquarePosition): void => {
    const { row, col } = clickedCoords;
    const clickedSquare = squares[row][col];
    const { revealed: visible, flagged } = clickedSquare.state;

    //TODO: move this logic to inside minesweeper.ts
    if (isFirstClick.current) {
      isFirstClick.current = false;
      return setSquares(generateSquaresValues(clickedCoords));
    }

    if (button === MouseButton.left && !(visible || flagged)) {
      setSquares(revealSquare(squares, clickedCoords));
    }

    if (button === MouseButton.middle && visible) {
      setSquares(revealSurroundingSquares(squares, clickedCoords));
    }

    if (button === MouseButton.right && !visible) {
      setSquares(toggleSquareFlag(squares, clickedCoords));
    }
    //--------------------
  };

  useEffect(() => {
    if (isGameLost(squares)) {
      return alert('Game Over');
    }
    if (isGameWon(squares)) {
      return alert('You won!');
    }
  });

  const getContent = ({ state: { revealed, flagged }, value }: SquareType) => {
    if (flagged) {
      return <Flag />;
    }
    if (revealed && value) {
      return value === 'mine' ? <Mine /> : value;
    }
    return null;
  };

  const board = squares.map((rows, row) => {
    const generatedRow = rows.map((_, col) => {
      const square: SquareType = squares[row][col];
      const props = {
        className:
          square.state.revealed && square.value !== undefined ? `square-${square.value}` : 'square',
        onClick: (e: React.MouseEvent<HTMLElement>) =>
          handleClick(e.button, { row, col } as SquarePosition),
        onAuxClick: (e: React.MouseEvent<HTMLElement>) =>
          handleClick(e.button, { row, col } as SquarePosition),
        content: getContent(square),
      };
      return <Square key={`${row}-${col}`} {...props} />;
    });
    return (
      <div key={row} className="row">
        {generatedRow}
      </div>
    );
  });

  return <div className="board">{board}</div>;
}
