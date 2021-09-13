import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { SquaresState, SquareProps, Value, content } from "../types";
import { generateSquares, getSquareNumber, squareIsAround } from "../utils";
import { Bomb } from "./Bomb";
import { Square } from "./Square";
import { Flag } from "./Flag";

function Board() {
	const [squares, setSquares] = useState(generateSquares());
	document.addEventListener("contextmenu", (e) => {
		const target = e.target as HTMLElement;
		if (target?.tagName !== "BODY") e.preventDefault();
	}); //dont show context menu

	useEffect(() => {});

	const handleClick = (
		e: React.MouseEvent<HTMLElement>,
		clickedSquareR: number,
		clickedSquareC: number
	) => {
		if (e.button === 0) {
			//left click
			const newSquares: SquaresState[][] = squares.slice();
			const square: SquaresState = newSquares[clickedSquareR][clickedSquareC];

			if (!square.state.visible && !square.state.flagged) {
				square.state.value = square.hasBomb
					? 9
					: getSquareNumber(squares, clickedSquareR, clickedSquareC);
				square.state.visible = true;
			}

			setSquares(newSquares);
		}
		if (e.button === 1) {
			//middle click
			squares.forEach((rows, r) => {
				rows.forEach((columns, c) => {
					const clickedSquare: SquaresState = squares[clickedSquareR][clickedSquareC];
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
			const newSquares: SquaresState[][] = squares.slice();
			const square: SquaresState = newSquares[clickedSquareR][clickedSquareC];
			if (!square.state.visible) {
				if (!square.state.flagged) {
					square.state.flagged = true;
				} else square.state.flagged = false;

				setSquares(newSquares);
			}
		}
	};

	const getContent = (square: SquaresState): content => {
		if (square.state.visible) {
			if (square.state.value) return square.hasBomb ? <Bomb /> : square.state.value;
			else return null;
		} else return square.state.flagged ? <Flag /> : null;
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((column, c) => {
			const square: SquaresState = squares[r][c];
			const props: SquareProps = {
				className: square.state.visible ? `square ${Value[square.state.value]}` : "square",
				onClick: (e: React.MouseEvent<HTMLElement>) => handleClick(e, r, c),
				onAuxClick: (e: React.MouseEvent<HTMLElement>) => handleClick(e, r, c),
				content: getContent(square),
			};
			return <Square {...props} />;
		});
		return <div className="row">{row}</div>;
	});

	return <div className="board">{board}</div>;
}

export default Board;
