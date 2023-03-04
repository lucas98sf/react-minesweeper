import { useEffect, useMemo, useState } from 'react';

import { Minesweeper } from '@/core/Minesweeper';
import { BoardState, GameState, MouseButton, SquarePosition } from '@/types';

export function useMinesweeper(...params: ConstructorParameters<typeof Minesweeper>) {
  const minesweeper = useMemo(() => new Minesweeper(...params), []);

  const [board, setBoard] = useState<BoardState>(minesweeper.board);
  const [gameState, setGameState] = useState<GameState>(minesweeper.state);

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

  const touchToMouseClick = (
    gameState: GameState,
    boardState: BoardState,
    { row, col }: SquarePosition,
  ): MouseButton => {
    if (gameState.isFirstMove) {
      return MouseButton.left;
    } else if (boardState.squares[row][col].state.revealed) {
      return MouseButton.middle;
    } else {
      return MouseButton.right;
    }
  };

  return {
    touchToMouseClick,
    handleClick(
      button: MouseButton,
      clickedCoords: Parameters<typeof Minesweeper.prototype.handleAction>[1],
    ) {
      return minesweeper.handleAction(button, clickedCoords);
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
