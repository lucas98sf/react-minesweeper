import { useEffect, useRef } from 'react';

import { isTouchEvent, useLongPress, useMinesweeper } from '@/hooks';
import { isSquarePosition, MouseButton, Square as SquareType, SquarePosition } from '@/types';

import { Flag } from './Flag';
import { Mine } from './Mine';
import { Square } from './Square';

export function Board() {
  const { board, setBoard, gameState, setGameState, touchToMouseClick, handleClick, reset } =
    useMinesweeper({
      guessFree: false,
    });
  const boardRef = useRef(null);

  const handleSquareAction = useLongPress<
    HTMLButtonElement & {
      dataset: DOMStringMap | SquarePosition;
    }
  >(
    {
      onLongPress: e => {
        if (!isTouchEvent(e)) {
          return;
        }
        if (isSquarePosition(e.currentTarget.dataset)) {
          // long press on mobile = normal click after the first move
          const newGame = handleClick(MouseButton.left, e.currentTarget.dataset);
          if (!newGame) {
            return;
          }
          setBoard(newGame.board);
          setGameState(newGame.state);
        }
      },
      onClick: e => {
        if (isSquarePosition(e.currentTarget.dataset)) {
          const mouseButton: MouseButton = isTouchEvent(e)
            ? touchToMouseClick(gameState, board, e.currentTarget.dataset)
            : e.button;

          const newGame = handleClick(mouseButton, e.currentTarget.dataset);
          if (!newGame) {
            return;
          }
          setBoard(newGame.board);
          setGameState(newGame.state);
        }
      },
    },
    {
      delay: 300,
      // shouldPreventDefault: true,
    },
  );

  const getContent = ({ state: { revealed, flagged }, value }: SquareType) => {
    if (flagged) {
      return <Flag />;
    }
    if (revealed && value) {
      return value === 'mine' ? <Mine /> : value;
    }
    return null;
  };

  useEffect(() => {
    if (gameState.gameOver) {
      //temporary
      setTimeout(() => {
        alert(gameState.result === 'win' ? 'You won!' : 'You lost...');
      }, 200);
    }
  }, [board, gameState]);

  const resetBoard = () => {
    const { board, state } = reset();
    setBoard(board);
    setGameState(state);
  };

  const squareNumberColors: Record<number | 'mine', string> = {
    0: 'bg-[darkgrey] ',
    1: 'bg-[darkgrey] text-indigo-700',
    2: 'bg-[darkgrey] text-green-900',
    3: 'bg-[darkgrey] text-red-700',
    4: 'bg-[darkgrey] text-blue-900',
    5: 'bg-[darkgrey] text-orange-900',
    6: 'bg-[darkgrey] text-teal-900',
    7: 'bg-[darkgrey] text-black',
    8: 'bg-[darkgrey] text-gray-900',
    mine: 'bg-red-400',
  };

  return (
    <div ref={boardRef} className="board m-[0.5vw] bg-[grey]">
      <div className="flex items-center justify-around p-2">
        <div className="flex flex-row">
          <div className="pt-1">{board.flagsLeft}</div>
          <Flag />
        </div>
        <Square boardRef={boardRef} className="square-unrevealed pb-2" onClick={resetBoard}>
          {gameState.result === 'win' ? '😎' : gameState.result === 'lose' ? '😵' : '🙂'}
        </Square>
        <div>000</div>
      </div>
      {board.squares.map((rows, row) => {
        const generatedRow = rows.map((_, col) => {
          const square: SquareType = board.squares[row][col];
          return (
            <Square
              boardRef={boardRef}
              surroundings={square.surroundings}
              data-col={col}
              data-row={row}
              className={
                square.state.revealed && square.value !== null && square.value !== undefined
                  ? squareNumberColors[square.value]
                  : 'square-unrevealed'
              }
              {...handleSquareAction}
              key={`${row}-${col}`}
            >
              {getContent(square)}
            </Square>
          );
        });
        return (
          <div key={row} className="flex-no-wrap flex flex-row">
            {generatedRow}
          </div>
        );
      })}
    </div>
  );
}
