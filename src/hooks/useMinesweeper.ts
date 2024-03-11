import { useEffect, useMemo, useState } from "react";

import { Minesweeper } from "~/core/Minesweeper";
import {
	BoardState,
	GameState,
	MouseButton,
	SquarePosition,
} from "~/core/types";

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
			return minesweeper.handleAction(button, clickedCoords);
		},
		reset() {
			return minesweeper.reset();
		},
		boardState,
		setBoardState,
		gameState,
		setGameState,
	};
}
