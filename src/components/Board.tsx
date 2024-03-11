import { useEffect, useRef } from "react";

import {
	MouseButton,
	Square as SquareType,
	SquarePosition,
	isSquarePosition,
} from "~/core/types";
import { isTouchEvent, useLongPress, useMinesweeper, useTimer } from "~/hooks";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Flag } from "./Flag";
import { Mine } from "./Mine";
import { Square } from "./Square";

interface BoardProps {
	userEmail: string;
}

export const Board = ({ userEmail }: BoardProps) => {
	const {
		boardState,
		gameState,
		setBoardState,
		setGameState,
		touchToMouseClick,
		handleClick,
		reset,
	} = useMinesweeper({
		guessFree: true,
	});

	const client = useSupabaseClient();
	const session = useSession();

	useEffect(() => {
		const channel = client.channel(`boards:${userEmail}`);

		channel.on("broadcast", { event: "sync" }, ({ payload }) => {
			if (payload.userEmail !== session?.user.email) {
				setBoardState(payload.board);
				setGameState(payload.gameState);
			}
		});

		channel.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [
		client.channel,
		userEmail,
		setBoardState,
		setGameState,
		session?.user.email,
	]);

	const { startTimer, stopTimer, resetTimer, timeElapsed } = useTimer();
	const boardRef = useRef(null);

	const handleSquareAction = useLongPress<
		HTMLButtonElement & {
			dataset: DOMStringMap | SquarePosition;
		}
	>(
		{
			onLongPress: async (e) => {
				if (session?.user?.email !== userEmail) {
					return;
				}
				if (!isTouchEvent(e)) {
					return;
				}
				if (isSquarePosition(e.currentTarget.dataset)) {
					// long press on mobile = normal click after the first move
					const newGame = handleClick(
						MouseButton.left,
						e.currentTarget.dataset,
					);
					if (!newGame) {
						return;
					}
					setBoardState(newGame.board);
					setGameState(newGame.state);
					await client.channel(`boards:${userEmail}`).send({
						type: "broadcast",
						event: "sync",
						payload: {
							board: newGame.board,
							gameState: newGame.state,
							userEmail,
						},
					});
				}
			},
			onClick: async (e) => {
				if (session?.user?.email !== userEmail) {
					return;
				}
				if (isSquarePosition(e.currentTarget.dataset)) {
					startTimer();
					const mouseButton: MouseButton = isTouchEvent(e)
						? touchToMouseClick(gameState, boardState, e.currentTarget.dataset)
						: e.button;

					const newGame = handleClick(mouseButton, e.currentTarget.dataset);
					if (!newGame) {
						return;
					}
					setBoardState(newGame.board);
					setGameState(newGame.state);
					await client.channel(`boards:${userEmail}`).send({
						type: "broadcast",
						event: "sync",
						payload: {
							board: newGame.board,
							gameState: newGame.state,
							userEmail,
						},
					});
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
			return value === "mine" ? <Mine /> : value;
		}
		return null;
	};

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

			setTimeout(() => {
				//temporary
				alert(gameState.result === "win" ? "You won!" : "You lost...");
			}, 200);
		}
	}, [gameState, boardState.squares, stopTimer]);

	const resetBoard = async () => {
		const { board, state } = reset();
		setBoardState(board);
		setGameState(state);
		//@todo: move timer to state
		resetTimer();
		await client.channel(`boards:${userEmail}`).send({
			type: "broadcast",
			event: "sync",
			payload: {
				board: board,
				gameState: state,
				userEmail,
			},
		});
	};

	const squareNumberColors: Record<number, string> = {
		0: "",
		1: "text-indigo-700",
		2: "text-green-900",
		3: "text-red-700",
		4: "text-blue-900",
		5: "text-orange-900",
		6: "text-teal-900",
		7: "text-black",
		8: "text-gray-900",
	};

	return (
		<div ref={boardRef} className="board m-[0.4vh] bg-[grey] shadow-md">
			<div className="flex items-center justify-around p-2">
				<div className="flex w-20 flex-row">
					<div className="pt-2 pb-2">{boardState.flagsLeft}</div>
					<Flag />
				</div>
				<Square
					boardRef={boardRef}
					className="square-unrevealed pb-2 pl-0"
					onClick={resetBoard}
				>
					{gameState.result === "win"
						? "😎"
						: gameState.result === "lose"
						  ? "😵"
						  : "🙂"}
				</Square>
				<div className="w-20 pt-2 pb-2">{timeElapsed}</div>
			</div>
			{boardState.squares.map((rows, row) => {
				const generatedRow = rows.map((_, col) => {
					const square: SquareType = boardState.squares[row][col];
					return (
						<Square
							boardRef={boardRef}
							surroundings={square.surroundings}
							data-col={col}
							data-row={row}
							className={
								square.state.revealed &&
								square.value !== null &&
								square.value !== undefined
									? squareNumberColors[square.value as number] ?? "mine"
									: "square-unrevealed"
							}
							{...handleSquareAction}
						>
							{getContent(square)}
						</Square>
					);
				});
				return <div className="flex-no-wrap flex flex-row">{generatedRow}</div>;
			})}
		</div>
	);
};
