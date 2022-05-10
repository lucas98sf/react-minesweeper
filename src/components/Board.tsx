import React, { useState, useEffect, useRef } from "react";
// import ReactDOM from "react-dom";
import {
	SquareState,
	SquareProps,
	Value,
	MouseButton,
	Coords,
	Content,
} from "../types";
import {
	renderSquares,
	generateSquaresValues,
	getSquareNumber,
	squareIsAround,
	flagsAroundSquare,
	isGameLost,
	isGameWon,
} from "../utils";
import { Bomb } from "./Bomb";
import { Square } from "./Square";
import { Flag } from "./Flag";
import { useCallback } from "react";

function Board() {
	type Click = {
		button: MouseButton;
		coords: Coords;
	} | null;
	const [click, setClick] = useState(null as Click);
	const [squares, setSquares] = useState(renderSquares());
	const isFirstClick = useRef(true);

	document.addEventListener("contextmenu", (e) => {
		const target = e.target as HTMLElement;
		if (target?.tagName !== "BODY") e.preventDefault();
	}); //dont show context menu on right click

	const handleClick = useCallback(
		(
			button: MouseButton,
			clickedSquareR: number,
			clickedSquareC: number
		): void => {
			const revealSquare = (
				square: SquareState,
				r: number,
				c: number
			): SquareState["state"] => {
				if (!square.state.visible && !square.state.flagged) {
					square.state.value = square.hasBomb
						? Value.bomb
						: getSquareNumber(squares, r, c);
					square.state.visible = true;
				}
				return square.state;
			};

			if (button === MouseButton.left) {
				const newSquares: SquareState[][] = squares.slice();
				const square: SquareState = newSquares[clickedSquareR][clickedSquareC];
				square.state = revealSquare(square, clickedSquareR, clickedSquareC);

				const isEmptySquare = square.state.value === Value.zero;
				setSquares(newSquares);
				if (isEmptySquare) {
					// if its an empty square, middle click it to reveal all surrounding squares
					handleClick(MouseButton.middle, clickedSquareR, clickedSquareC);
				}
			}

			if (button === MouseButton.middle) {
				const clickedSquare: SquareState =
					squares[clickedSquareR][clickedSquareC];
				if (!clickedSquare.state.visible) return;
				const flagsAround: number = flagsAroundSquare(
					clickedSquareR,
					clickedSquareC,
					squares
				);
				const squareValue = clickedSquare.state.value as Number;
				if (squareValue !== 0 && !(squareValue === flagsAround)) return;
				squares.forEach((rows, r) => {
					rows.forEach((columns, c) => {
						const square: SquareState = squares[r][c];
						if (
							squareIsAround(r, c, clickedSquareR, clickedSquareC) &&
							!square.state.visible &&
							!square.state.flagged
						) {
							handleClick(MouseButton.left, r, c);
						}
					});
				});
			}

			if (button === MouseButton.right) {
				const newSquares: SquareState[][] = squares.slice();
				const square: SquareState = newSquares[clickedSquareR][clickedSquareC];
				if (!square.state.visible) {
					if (!square.state.flagged) square.state.flagged = true;
					else square.state.flagged = false;

					setSquares(newSquares);
				}
			}
		},
		[squares]
	);

	useEffect(() => {
		if (!click) return;
		const {
			button,
			coords: { r, c },
		} = click;
		if (isFirstClick.current) setSquares(generateSquaresValues({ r, c }));
		else handleClick(button, r, c);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [click]);

	useEffect(() => {
		if (!click) return;
		const {
			button,
			coords: { r, c },
		} = click;
		if (isFirstClick.current) {
			isFirstClick.current = false;
			handleClick(button, r, c);
		}
		if (isGameLost(squares)) return alert("Game Over");
		if (isGameWon(squares)) return alert("You won!");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [squares]);

	const getContent = (square: SquareState): Content => {
		if (square.state.visible) {
			if (square.state.value)
				return square.hasBomb ? <Bomb /> : square.state.value;
			else return null;
		} else return square.state.flagged ? <Flag /> : null;
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((column, c) => {
			const square: SquareState = squares[r][c];
			const props: SquareProps = {
				className: square.state.visible
					? `square ${Value[square.state.value]}`
					: "square",
				onClick: (e: React.MouseEvent<HTMLElement>) =>
					setClick({
						button: e.button,
						coords: { r, c },
					}),
				onAuxClick: (e: React.MouseEvent<HTMLElement>) =>
					handleClick(e.button, r, c),
				content: getContent(square),
			};
			return <Square key={`${r}-${c}`} {...props} />;
		});
		return (
			<div key={r} className="row">
				{row}
			</div>
		);
	});

	return <div className="board">{board}</div>;
}

export default Board;
