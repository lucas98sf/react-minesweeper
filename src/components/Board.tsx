import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { SquareState, SquareProps, Value } from "../types";
import { generateSquares, getSquareNumber, squareIsAround } from "../utils";
import { Bomb } from "./Bomb";
import { Square } from "./Square";

function Board() {
	const [squares, setSquares] = useState(generateSquares());
	document.addEventListener("contextmenu", (e) => e.preventDefault()); //dont show context menu

	useEffect(() => {});

	const handleClick = (
		e: React.MouseEvent<HTMLElement>,
		clickedSquareR: number,
		clickedSquareC: number
	) => {
		if (e.button === 0) {
			//left click
			const newSquares: SquareState[][] = squares.slice();
			const square: SquareState = newSquares[clickedSquareR][clickedSquareC];

			if (!square.state.visible) {
				square.state.value = square.hasBomb
					? 9
					: getSquareNumber(squares, clickedSquareR, clickedSquareC);
				square.state.visible = true;
			}

			setSquares(newSquares);
		}
		if (e.button === 1) {
			squares.forEach((rows, r) => {
				rows.forEach((columns, c) => {
					const clickedSquare: SquareState = squares[clickedSquareR][clickedSquareC];
					if (squareIsAround(r, clickedSquareR, c, clickedSquareC) && clickedSquare.state.visible) {
						//TODO: verify if there's no non find bomb around
						const leftClick = { ...e, button: 0 };
						handleClick(leftClick, r, c);
					}
				});
			});
		}
		if (e.button === 2) {
			//right click
		}
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((columns, c) => {
			const square: SquareState = squares[r][c];
			const props: SquareProps = {
				className: square.state.visible ? `square ${Value[square.state.value]}` : "square",
				onClick: (e: React.MouseEvent<HTMLElement>) => handleClick(e, r, c),
				onAuxClick: (e: React.MouseEvent<HTMLElement>) => handleClick(e, r, c),
				content:
					square.state.visible && square.hasBomb ? (
						<Bomb />
					) : !square.hasBomb && square.state.value ? (
						square.state.value
					) : null,
			};
			return <Square {...props} />;
		});
		return <div className="row">{row}</div>;
	});

	return <div className="board">{board}</div>;
}

export default Board;
