import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { Square, Value } from "../types";
import { Bomb } from "./Bomb";
import { generateSquares, getSquareNumber } from "../utils";

function Board() {
	const [squares, setSquares] = useState(generateSquares());
	document.addEventListener("contextmenu", (e) => e.preventDefault()); //dont show context menu

	useEffect(() => {});

	const handleClick = (e: React.MouseEvent<HTMLElement>, r: number, c: number) => {
		if (e.button === 0) {
			//left click
			const newSquares: Square[][] = squares.slice();
			const square: Square = newSquares[r][c];

			if (!square.state.visible) {
				square.state.value = square.hasBomb ? 9 : getSquareNumber(squares, r, c);
				square.state.visible = true;
			}

			setSquares(newSquares);
		}
		if (e.button === 1) {
			//middle click
		}
		if (e.button === 2) {
			//right click
		}
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((coloumns, c) => {
			const square: Square = squares[r][c];
			return (
				<button
					className={square.state.visible ? `square ${Value[square.state.value]}` : "square"}
					onClick={(e) => handleClick(e, r, c)}
					onAuxClick={(e) => handleClick(e, r, c)}
				>
					{square.state.visible && square.hasBomb ? (
						<Bomb />
					) : (
						!square.hasBomb && (square.state.value || null)
					)}
				</button>
			);
		});
		return <div className="row">{row}</div>;
	});

	return <div className="board">{board}</div>;
}

export default Board;
