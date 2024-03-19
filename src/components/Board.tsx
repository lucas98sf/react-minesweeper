import { useEffect, useRef } from "react";

import {
	MouseButton,
	Square as SquareType,
	SquarePosition,
	isSquarePosition,
} from "~/core/types";
import { isTouchEvent, useLongPress, useMinesweeper } from "~/hooks";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Flag } from "./Flag";
import { Mine } from "./Mine";
import { Square } from "./Square";

interface BoardProps {
	userEmail?: string;
	locked?: boolean;
}

export const Board = ({ userEmail, locked }: BoardProps) => {
	const {
		boardState,
		gameState,
		timeElapsed,
		setBoardState,
		setGameState,
		touchToMouseClick,
		handleClick,
		reset,
	} = useMinesweeper({
		guessFree: true,
	});

	const isMultiplayer = !!userEmail;

	const client = useSupabaseClient();
	const session = useSession();

	useEffect(() => {
		if (isMultiplayer) {
			const channel = client.channel(`boards:${userEmail}`);

			channel.on("broadcast", { event: "sync" }, ({ payload }) => {
				if (payload.userEmail !== session?.user.email) {
					setBoardState(payload.boardState);
					setGameState(payload.gameState);
				}
			});

			channel.subscribe();

			return () => {
				channel.unsubscribe();
			};
		}
	}, [
		isMultiplayer,
		client.channel,
		userEmail,
		setBoardState,
		setGameState,
		session?.user.email,
	]);

	useEffect(() => {
		if (isMultiplayer && gameState.result) {
			client.channel("boards").send({
				type: "broadcast",
				event: "over",
				payload: {
					boardState,
					gameState,
					userEmail,
				},
			});
		}
	}, [
		gameState.result,
		userEmail,
		isMultiplayer,
		client.channel,
		boardState,
		gameState,
	]);

	useEffect(() => {
		if (isMultiplayer) {
			const boardsChannel = client.channel("boards");
			boardsChannel.on("broadcast", { event: "reset" }, reset);

			// boardsChannel.subscribe();

			// return () => {
			// 	boardsChannel.unsubscribe();
			// };
		}
	}, [isMultiplayer, reset, client.channel]);

	const boardRef = useRef(null);

	const handleSquareAction = useLongPress<
		HTMLButtonElement & {
			dataset: DOMStringMap | SquarePosition;
		}
	>(
		{
			onLongPress: async (e) => {
				if (locked || (isMultiplayer && session?.user?.email !== userEmail)) {
					return;
				}
				if (!isTouchEvent(e)) {
					return;
				}
				if (isSquarePosition(e.currentTarget.dataset)) {
					// long press on mobile = normal click after the first move
					handleClick(MouseButton.left, e.currentTarget.dataset);

					if (isMultiplayer) {
						await client.channel(`boards:${userEmail}`).send({
							type: "broadcast",
							event: "sync",
							payload: {
								boardState,
								gameState,
								userEmail,
							},
						});
					}
				}
			},
			onClick: async (e) => {
				if (locked || (isMultiplayer && session?.user?.email !== userEmail)) {
					return;
				}
				if (isSquarePosition(e.currentTarget.dataset)) {
					const mouseButton: MouseButton = isTouchEvent(e)
						? touchToMouseClick(gameState, boardState, e.currentTarget.dataset)
						: e.button;

					handleClick(mouseButton, e.currentTarget.dataset);

					if (isMultiplayer) {
						await client.channel(`boards:${userEmail}`).send({
							type: "broadcast",
							event: "sync",
							payload: {
								boardState,
								gameState,
								userEmail,
							},
						});
					}
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

	const resetBoard = async () => {
		reset();
		if (isMultiplayer) {
			await client.channel(`boards:${userEmail}`).send({
				type: "broadcast",
				event: "sync",
				payload: {
					boardState,
					gameState,
					userEmail,
				},
			});
		}
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
		<div ref={boardRef} className="board bg-[grey] shadow-md w-fit p-2 mx-auto">
			<div className="flex justify-around p-2">
				<div className="flex flex-row">
					<div className="pt-2 pb-2">{boardState.flagsLeft}</div>
					<Flag />
				</div>
				{!isMultiplayer && (
					<>
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
						<div className="pt-2 pb-2">{timeElapsed}</div>
					</>
				)}
			</div>
			<div className="flex items-center flex-col">
				{boardState.squares.map((rows, row) => {
					const generatedRow = rows.map((_, col) => {
						const square: SquareType = boardState.squares[row][col];
						return (
							<Square
								key={`${row}-${
									// biome-ignore lint/suspicious/noArrayIndexKey: yolo
									col
								}`}
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
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: yolo
						<div key={row} className="flex-no-wrap flex flex-row">
							{generatedRow}
						</div>
					);
				})}
			</div>
		</div>
	);
};
