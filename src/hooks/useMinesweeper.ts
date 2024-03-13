import { useEffect, useMemo, useState } from "react";

import { Minesweeper } from "~/core/Minesweeper";
import {
	BoardState,
	GameState,
	MouseButton,
	SquarePosition,
} from "~/core/types";
import { useTimer } from "~/hooks/useTimer";

let initialParams: ConstructorParameters<typeof Minesweeper> = [];

export function useMinesweeper(
	...params: ConstructorParameters<typeof Minesweeper>
) {
	if (initialParams.length === 0) {
		initialParams = params;
	}
	const minesweeper = useMemo(() => new Minesweeper(...initialParams), []);

	const [boardState, setBoardState] = useState<BoardState>(minesweeper.board);
	const [gameState, setGameState] = useState<GameState>(minesweeper.state);
	const { startTimer, stopTimer, resetTimer, timeElapsed } = useTimer();

	useEffect(() => {
		const preventContextMenu = (e: MouseEvent) => {
			if ((e.target as HTMLElement)?.tagName !== "BODY") {
				e.preventDefault();
			}
		};
		window.addEventListener("contextmenu", preventContextMenu);
		return () => {
			window.removeEventListener("contextmenu", preventContextMenu);
		};
	}, []);

	useEffect(() => {
		if (gameState.gameOver) {
			stopTimer();

			if (gameState.result === "lose") {
				for (const square of boardState.squares.flat()) {
					if (square.value === "mine") {
						square.state.revealed = true;
					}
				}
			}
		}
	}, [gameState, boardState.squares, stopTimer]);

	const touchToMouseClick = (
		gameState: GameState,
		boardState: BoardState,
		{ row, col }: SquarePosition,
	): MouseButton => {
		if (gameState.isFirstMove) {
			return MouseButton.left;
		}
		if (boardState.squares[row][col].state.revealed) {
			return MouseButton.middle;
		}
		return MouseButton.right;
	};

	return {
		touchToMouseClick,
		handleClick(
			button: MouseButton,
			clickedCoords: Parameters<typeof Minesweeper.prototype.handleAction>[1],
		) {
			if (gameState.isFirstMove) {
				startTimer();
			}
			minesweeper.handleAction(button, clickedCoords);
			setBoardState(minesweeper.board);
			setGameState(minesweeper.state);
		},
		reset() {
			resetTimer();
			minesweeper.reset();
			setBoardState(minesweeper.board);
			setGameState(minesweeper.state);
		},
		timeElapsed,
		boardState,
		gameState,
		setBoardState,
		setGameState,
	};
}
