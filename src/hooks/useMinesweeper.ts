import { useEffect, useMemo, useState } from 'react';

import { Minesweeper } from '@/core/Minesweeper';
import { BoardState, GameResult } from '@/types';

export function useMinesweeper(...params: ConstructorParameters<typeof Minesweeper>) {
  const minesweeper = useMemo(() => new Minesweeper(...params), []);
  //use reducer maybe?
  const [board, setBoard] = useState<BoardState>(minesweeper.board);
  const [gameState, setGameState] = useState<GameResult>(minesweeper.state);

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
    handleClick<T>(
      event: React.MouseEvent<T>,
      clickedCoords: Parameters<typeof Minesweeper.prototype.handleAction>[1],
    ) {
      return minesweeper.handleAction(event.button, clickedCoords);
    },
    reset() {
      return minesweeper.reset();
    },
    board,
    setBoard,
    gameState,
    setGameState,
  };
}
