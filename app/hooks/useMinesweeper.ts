import { useEffect, useMemo, useState } from "react";

import { Minesweeper } from "@/core/Minesweeper";
import {
	Action,
	BoardState,
	GameState,
	MouseButton,
	SquarePosition,
	isSquarePosition,
} from "@/core/types";
import { isTouchEvent, useLongPress } from "@/hooks/useLongPress";
import { useTimer } from "@/hooks/useTimer";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

let initialParams: ConstructorParameters<typeof Minesweeper> = [];
let channel: RealtimeChannel | null = null;

export function useMinesweeper(
	party: {
		roomId: string;
		playerId: string;
		client: SupabaseClient;
	} | null = null,
	...params: ConstructorParameters<typeof Minesweeper>
) {
	if (initialParams.length === 0) {
		initialParams = params;
	}
	const minesweeper = useMemo(() => new Minesweeper(...initialParams), []);

	if (party) {
		channel = party.client.channel(party.roomId);
		channel
			.on("broadcast", { event: "sync" }, (payload) => {
				const message = JSON.parse(payload.event) as Action;
				console.log("client received event", payload.event);
				const newGame = minesweeper.handleAction(message);
				if (!newGame) {
					return;
				}
				setBoard(newGame.board);
				setGameState(newGame.state);
			})
			.subscribe();
	}

	const [board, setBoard] = useState<BoardState>(minesweeper.board);
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

	const { startTimer, stopTimer, resetTimer, timeElapsed } = useTimer();

	useEffect(() => {
		if (gameState.gameOver) {
			stopTimer();

			if (gameState.result === "lose") {
				for (const square of board.squares.flat()) {
					if (square.value === "mine") {
						square.state.revealed = true;
					}
				}
			}

			setTimeout(() => {
				//temporary
				alert(gameState.result === "win" ? "You won!" : "You lost...");
			}, 200);
		}
	}, [gameState, board.squares, stopTimer]);

	return {
		board,
		gameState,
		timeElapsed,
		resetBoard: () => {
			const { board, state } = minesweeper.reset();
			setBoard(board);
			setGameState(state);
			resetTimer();
		},
		handleSquareAction: useLongPress<
			HTMLButtonElement & {
				dataset: DOMStringMap | SquarePosition;
			}
		>(
			{
				onLongPress: (e) => {
					if (!isTouchEvent(e)) {
						return;
					}
					if (isSquarePosition(e.currentTarget.dataset)) {
						// long press on mobile = normal click after the first move
						const action = {
							button: MouseButton.left,
							clickedCoords: e.currentTarget.dataset,
						};
						const newGame = minesweeper.handleAction(action);
						if (channel) {
							channel.send({
								event: "sync",
								payload: JSON.stringify(action),
								type: "broadcast",
							});
						}
						if (!newGame) {
							return;
						}
						setBoard(newGame.board);
						setGameState(newGame.state);
					}
				},
				onClick: (e) => {
					if (isSquarePosition(e.currentTarget.dataset)) {
						startTimer();
						const mouseButton: MouseButton = isTouchEvent(e)
							? touchToMouseClick(gameState, board, e.currentTarget.dataset)
							: e.button;
						const action = {
							button: mouseButton,
							clickedCoords: e.currentTarget.dataset,
						};
						const newGame = minesweeper.handleAction(action);
						if (channel) {
							channel.send({
								event: "sync",
								payload: JSON.stringify(action),
								type: "broadcast",
							});
						}
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
		),
	};
}
