import React, { useState } from "react"; //useState
// import ReactDOM from "react-dom";
import { Square, Value } from "../types";
import { Bomb } from "./Bomb";
import { generateSquares, getSquareNumber } from "../utils";

function Board() {
	const [squares, setSquares] = useState(generateSquares());

	const handleClick = (r: number, c: number) => {
		const newSquares: Square[][] = squares.slice();
		const square: Square = newSquares[r][c];

		if (!square.state.visible) {
			square.state.value = square.hasBomb ? 9 : getSquareNumber(squares, r, c);
			square.state.visible = true;
		}

		setSquares(newSquares);
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((coloumns, c) => {
			const square: Square = squares[r][c];
			return (
				<button
					className={square.state.visible ? Value[square.state.value] : "square"}
					onClick={() => handleClick(r, c)}
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
