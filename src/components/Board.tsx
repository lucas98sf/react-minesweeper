import { useEffect } from 'react';

import { isTouchEvent, useLongPress, useMinesweeper } from '@/hooks';
import { Square as SquareType, SquarePosition } from '@/types';

import { Flag } from './Flag';
import { Mine } from './Mine';
import { Square } from './Square';

export function Board() {
  const { board, setBoard, gameState, setGameState, handleClick, reset } = useMinesweeper({
    guessFree: false,
  });

  //WIP
  const isSquarePosition = (obj: Record<string, unknown>): obj is SquarePosition => {
    return 'row' in obj && 'col' in obj;
  };
  const handleSquareAction = useLongPress<
    HTMLButtonElement & {
      dataset: DOMStringMap | SquarePosition;
    }
  >(
    {
      // onLongPress: e => {
      //   console.log('long press', e.currentTarget.dataset);
      // },
      onClick: e => {
        // if ('touches' in e) {
        //   return console.log('touch event');
        // }
        if (isTouchEvent(e)) {
          return console.log('touch event');
        }
        if (isSquarePosition(e.currentTarget.dataset)) {
          const newGame = handleClick(e, e.currentTarget.dataset);
          // console.log(e.button, e.currentTarget.dataset);
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
    <div className="board">
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
        <Square className="reset unrevealed" onClick={resetBoard}>
          {gameState.result === 'win' ? '😎' : gameState.result === 'lose' ? '😵' : '🙂'}
        </Square>
      </center>
      <br />
      {board.squares.map((rows, row) => {
        const generatedRow = rows.map((_, col) => {
          const square: SquareType = board.squares[row][col];
          const props = {
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
