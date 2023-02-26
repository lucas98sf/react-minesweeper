import { useEffect, useRef, useState } from 'react';

import { Minesweeper } from '@/core/Minesweeper';
import { BoardState, GameResult } from '@/types';

export function useMinesweeper(...params: ConstructorParameters<typeof Minesweeper>) {
  const minesweeper = useRef<Minesweeper>();
  const [gameState, setGameState] = useState<GameResult>({
    gameOver: false,
    result: null,
  });

  // TODO: find a better way to instantiate it
  if (!minesweeper.current) {
    minesweeper.current = new Minesweeper(...params);
  }

  const [board, setBoard] = useState<BoardState>(minesweeper.current.board);

  useEffect(() => {
    setTimeout(() => {
      //TODO: find a better way to do this
      if (gameState.gameOver) {
        alert(gameState.result === 'win' ? 'You win!' : 'You lost...');
      }
    }, 200);
  }, [gameState]);

  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'BODY') {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', preventContextMenu);
    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  return {
    board,
    setBoard,
    handleClick(
      event: React.MouseEvent<HTMLElement>,
      clickedCoords: Parameters<typeof Minesweeper.prototype.handleAction>[1],
    ) {
      event.preventDefault();
      if (!minesweeper.current) {
        return;
      }

      if (gameState.gameOver) {
        return minesweeper.current.board;
      }

      const newState = minesweeper.current?.handleAction(event.button, clickedCoords);
      setGameState(newState);

      return minesweeper.current.board;
    },
    reset() {
      if (!minesweeper.current) {
        return;
      }

      minesweeper.current.reset();
      setGameState({
        gameOver: false,
        result: null,
      });

      return minesweeper.current?.board as BoardState;
    },
  };
}
