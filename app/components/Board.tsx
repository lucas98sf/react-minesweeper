import { FC, useRef } from "react";

import { Square as SquareType } from "@/core/types";
import { useMinesweeper } from "@/hooks";

import { Flag } from "./Flag";
import { Mine } from "./Mine";
import { Square } from "./Square";

export const Board: FC<{
	party: Parameters<typeof useMinesweeper>[0];
}> = ({ party }) => {
	const { board, gameState, handleSquareAction, resetBoard, timeElapsed } =
		useMinesweeper(party, {
			guessFree: true,
		});

	const boardRef = useRef(null);

	const getContent = ({ state: { revealed, flagged }, value }: SquareType) => {
		if (flagged) {
			return <Flag />;
		}
		if (revealed && value) {
			return value === "mine" ? <Mine /> : value;
		}
		return null;
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
		<div
			ref={boardRef}
			className="board m-[0.5vh] bg-[grey] shadow-md max-h-[99vh]"
		>
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
};
