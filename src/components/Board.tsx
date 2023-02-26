import React from 'react';

import { useMinesweeper } from '@/hooks/useMinesweeper';
import { Square as SquareType, SquarePosition } from '@/types';

import { Flag } from './Flag';
import { Mine } from './Mine';
import { Square } from './Square';

export function Board() {
  const { board, setBoard, handleClick, reset } = useMinesweeper({ guessFree: true });

  const getContent = ({ state: { revealed, flagged }, value }: SquareType) => {
    if (flagged) {
      return <Flag />;
    }
    if (revealed && value) {
      return value === 'mine' ? <Mine /> : value;
    }
    return null;
  };

  const resetBoard = () => {
    setBoard(reset() ?? board);
  };

  return (
    <div className="board">
      <center>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {board.flagsLeft} <Flag />
        </div>
        <button className="reset" onClick={resetBoard}>
          🔁
        </button>
      </center>
      <br />
      {board.squares.map((rows, row) => {
        const generatedRow = rows.map((_, col) => {
          const square: SquareType = board.squares[row][col];
          const props = {
            className:
              square.state.revealed && square.value !== undefined
                ? `square-${square.value}`
                : 'square',
            onClick: (e: React.MouseEvent<HTMLElement>) =>
              setBoard(handleClick(e, { row, col } as SquarePosition) ?? board),
            onAuxClick: (e: React.MouseEvent<HTMLElement>) =>
              setBoard(handleClick(e, { row, col } as SquarePosition) ?? board),
            content: getContent(square),
          };
          return <Square key={`${row}-${col}`} {...props} />;
        });
        return (
          <div key={row} className="row">
            {generatedRow}
          </div>
        );
      })}
    </div>
  );
}
