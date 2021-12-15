import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { SquareState, SquareProps, Value, mouseClick, Coords, content } from "../types";
import { generateSquares, getSquareNumber, squareIsAround, flagsAroundSquare } from "../utils";
import { Bomb } from "./Bomb";
import { Square } from "./Square";
import { Flag } from "./Flag";

function Board () {
	const [squares, setSquares] = useState(generateSquares());
	type FirstClick = { coords: Coords, event: React.MouseEvent<HTMLElement> } | null;
	const [firstClick, setFirstClick] = useState(null as FirstClick);

	document.addEventListener("contextmenu", (e) => {
		const target = e.target as HTMLElement;
		if (target?.tagName !== "BODY") e.preventDefault();
	}); //dont show context menu

	useEffect(() => {
		if (firstClick) {
			setSquares(generateSquares(firstClick.coords));
			// handleClick({ ...firstClick.event, button: mouseClick.left },
			// 	firstClick.coords.r,
			// 	firstClick.coords.c);
			//TODO: fix handleclick resetting board render
		}
	}, [firstClick]);

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
	): void => {
		const clickSquare =
			(button: mouseClick, r: number, c: number) =>
				handleClick({ ...e, button }, r, c);

		if (e.button === mouseClick.left) {
			if (!firstClick) setFirstClick({ coords: { r: clickedSquareR, c: clickedSquareC }, event: e });
			const newSquares: SquareState[][] = squares.slice();
			const square: SquareState = newSquares[clickedSquareR][clickedSquareC];
			square.state = revealSquare(square, clickedSquareR, clickedSquareC);

			const isEmptySquare = square.state.value === Value.zero;
			setSquares(newSquares);
			if (isEmptySquare) {
				// if its an empty square, middle click it to reveal all surrounding squares
				clickSquare(mouseClick.middle, clickedSquareR, clickedSquareC);
			}
		}
		if (e.button === mouseClick.middle) {
			const clickedSquare: SquareState = squares[clickedSquareR][clickedSquareC];
			if (!clickedSquare.state.visible) return;
			const flagsAround: number = flagsAroundSquare(clickedSquareR, clickedSquareC, squares);
			const squareValue = clickedSquare.state.value as Number
			if (squareValue !== 0 && !(squareValue === flagsAround)) return;
			squares.forEach((rows, r) => {
				rows.forEach((columns, c) => {
					const square: SquareState = squares[r][c];
					if (squareIsAround(r, c, clickedSquareR, clickedSquareC) &&
						!square.state.visible && !square.state.flagged) {
						clickSquare(mouseClick.left, r, c);
					}
				});
			});
		}
		if (e.button === mouseClick.right) {
			const newSquares: SquareState[][] = squares.slice();
			const square: SquareState = newSquares[clickedSquareR][clickedSquareC];
			if (!square.state.visible) {
				if (!square.state.flagged) square.state.flagged = true;
				else square.state.flagged = false;

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
				onClick: (e: React.MouseEvent<HTMLElement>) =>
					handleClick(e, r, c),
				onAuxClick: (e: React.MouseEvent<HTMLElement>) =>
					handleClick(e, r, c),
				content: getContent(square),
			};
			return <Square key={`${r}-${c}`} {...props} />;
		});
		return <div key={r} className="row">{row}</div>;
	});

	return <div className="board">{board}</div>;
}

export default Board;
