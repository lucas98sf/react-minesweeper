import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { SquareState, SquareProps, Value, content } from "../types";
import { generateSquares, getSquareNumber, squareIsAround } from "../utils";
import { Bomb } from "./Bomb";
import { Square } from "./Square";
import { Flag } from "./Flag";

function Board () {
	const [squares, setSquares] = useState(generateSquares());
	document.addEventListener("contextmenu", (e) => {
		const target = e.target as HTMLElement;
		if (target?.tagName !== "BODY") e.preventDefault();
	}); //dont show context menu

	useEffect(() => { });

	const revealSquare = (
		square: SquareState,
		clickedSquareR: number,
		clickedSquareC: number
	): SquareState["state"] => {
		if (!square.state.visible && !square.state.flagged) {
			square.state.value = square.hasBomb
				? 9
				: getSquareNumber(squares, clickedSquareR, clickedSquareC);
			square.state.visible = true;
		}
		return square.state;
	};

	const handleClick = (
		e: React.MouseEvent<HTMLElement>,
		clickedSquareR: number,
		clickedSquareC: number
	) => {
		if (e.button === 0) {
			//left click
			const newSquares: SquareState[][] = squares.slice();
			const square: SquareState = newSquares[clickedSquareR][clickedSquareC];
			square.state = revealSquare(square, clickedSquareR, clickedSquareC);
			setSquares(newSquares);
			if (square.state.value === Value.zero) {
				// if its an empty square, middle click it to reveal all surrounding squares
				handleClick({ ...e, button: 1 }, clickedSquareR, clickedSquareC);
			}
		}
		if (e.button === 1) {
			//middle click
			const clickedSquare: SquareState = squares[clickedSquareR][clickedSquareC];
			if (!clickedSquare.state.visible) return;
			squares.forEach((rows, r) => {
				rows.forEach((columns, c) => {
					const square: SquareState = squares[r][c];
					if (squareIsAround(r, c, clickedSquareR, clickedSquareC) &&
						!square.state.visible && !square.state.flagged) {
						handleClick({ ...e, button: 0 }, r, c);
						//left click the square
					}
				});
			});
		}
		if (e.button === 2) {
			//right click
			const newSquares: SquareState[][] = squares.slice();
			const square: SquareState = newSquares[clickedSquareR][clickedSquareC];
			if (!square.state.visible) {
				if (!square.state.flagged) {
					square.state.flagged = true;
				} else square.state.flagged = false;

				setSquares(newSquares);
			}
		}
	};

	const getContent = (square: SquareState): content => {
		if (square.state.visible) {
			if (square.state.value) return square.hasBomb ? <Bomb /> : square.state.value;
			else return null;
		} else return square.state.flagged ? <Flag /> : null;
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((column, c) => {
			const square: SquareState = squares[r][c];
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
