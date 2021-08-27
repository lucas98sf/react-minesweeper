import React, { useState } from "react"; //useState
// import ReactDOM from "react-dom";
import { Square } from "../types";
import { generateSquares, getSquareNumber } from "../utils";

function Board() {
	const [squares, setSquares] = useState(generateSquares());

	const handleClick = (x: number, y: number) => {
		const newSquares: Square[][] = squares.slice();
		const square: Square = newSquares[x][y];

		if (!square.state.visible) {
			square.state.value = square.hasBomb ? 9 : getSquareNumber(squares, x, y); //for now
			square.state.visible = true;
		}

		setSquares(newSquares);
	};

	const board = squares.map((rows, x) => {
		const row = rows.map((_, y) => {
			const square: Square = squares[x][y];
			return (
				<button onClick={() => handleClick(x, y)}>
					{square.state.visible && square.state.value ? square.state.value : null}
				</button>
			);
		});
		return <div className="row">{row}</div>;
	});

	return <div className="board">{board}</div>;
}

export default Board;
