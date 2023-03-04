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

  return (
    <div ref={boardRef} className="board">
      <center>
        <div
          //FIXME
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {board.flagsLeft} <Flag />
        </div>
        <Square boardRef={boardRef} className="reset unrevealed" onClick={resetBoard}>
          {gameState.result === 'win' ? '😎' : gameState.result === 'lose' ? '😵' : '🙂'}
        </Square>
      </center>
      <br />
      {board.squares.map((rows, row) => {
        const generatedRow = rows.map((_, col) => {
          const square: SquareType = board.squares[row][col];
          const props = {
            boardRef,
            className:
              square.state.revealed && square.value !== undefined
                ? `square-${square.value}`
                : 'unrevealed',
            'data-row': row,
            'data-col': col,
            surroundings: square.surroundings,
          };
          return (
            <Square {...handleSquareAction} key={`${row}-${col}`} {...props}>
              {getContent(square)}
            </Square>
          );
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
