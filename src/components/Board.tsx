import React, { useState, useEffect, useRef } from 'react';
import {
  SquareState,
  SquareProps,
  Value,
  MouseButton,
  Content,
  SquareCoords,
  SquaresBoard,
} from '../types';
import {
  generateEmptySquares,
  generateSquaresValues,
  revealSquare,
  revealSurroundingSquares,
  toggleSquareFlag,
  isGameLost,
  isGameWon,
} from '../functions/minesweeper';
import { Bomb } from './Bomb';
import { Square } from './Square';
import { Flag } from './Flag';

export function Board() {
  const [squares, setSquares] = useState<SquaresBoard>(generateEmptySquares());
  const isFirstClick = useRef<boolean>(true);

  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target?.tagName !== 'BODY') e.preventDefault();
  }); //dont show context menu on right click

  const handleClick = (button: MouseButton, clickedCoords: SquareCoords): void => {
    const { row, col } = clickedCoords;
    const clickedSquare = squares[row][col];
    const { visible, flagged } = clickedSquare.state;

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
  };

  useEffect(() => {
    if (isGameLost(squares)) return alert('Game Over');
    if (isGameWon(squares)) return alert('You won!');
  });

  const getContent = (square: SquareState): Content => {
    const { visible, flagged, value } = square.state;
    if (flagged) return <Flag />;
    if (visible) {
      if (value) return square.hasBomb ? <Bomb /> : value;
    }
    return null;
  };

  const board = squares.map((rows, row) => {
    const generatedRow = rows.map((column, col) => {
      const square: SquareState = squares[row][col];
      const props: SquareProps = {
        className: square.state.visible ? `square ${Value[square.state.value]}` : 'square',
        onClick: (e: React.MouseEvent<HTMLElement>) => handleClick(e.button, { row, col }),
        onAuxClick: (e: React.MouseEvent<HTMLElement>) => handleClick(e.button, { row, col }),
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
