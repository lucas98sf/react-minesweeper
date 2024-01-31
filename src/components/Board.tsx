import { useEffect, useRef } from "react";

import {
	MouseButton,
	Square as SquareType,
	SquarePosition,
	isSquarePosition,
} from "@/core/types";
import { isTouchEvent, useLongPress, useMinesweeper, useTimer } from "@/hooks";

import { Flag } from "./Flag";
import { Mine } from "./Mine";
import { Square } from "./Square";

export function Board() {
	const {
		board,
		setBoard,
		gameState,
		setGameState,
		touchToMouseClick,
		handleClick,
		reset,
	} = useMinesweeper({
		guessFree: true,
	});
	const { startTimer, stopTimer, resetTimer, timeElapsed } = useTimer();
	const boardRef = useRef(null);

	const handleSquareAction = useLongPress<
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
					const newGame = handleClick(
						MouseButton.left,
						e.currentTarget.dataset,
					);
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
			return value === "mine" ? <Mine /> : value;
		}
		return null;
	};

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

	const resetBoard = () => {
		const { board, state } = reset();
		setBoard(board);
		setGameState(state);
		resetTimer();
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
		<div ref={boardRef} className="board m-[0.5vw] bg-[grey] shadow-md">
			<div className="flex items-center justify-around p-2">
				<div className="flex w-20 flex-row">
					<div className="pt-2 pb-2">{board.flagsLeft}</div>
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
			{board.squares.map((rows, row) => {
				const generatedRow = rows.map((_, col) => {
					const square: SquareType = board.squares[row][col];
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
}
