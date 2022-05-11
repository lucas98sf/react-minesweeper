import React, { useState, useEffect, useRef } from "react";
import {
	SquareState,
	SquareProps,
	Value,
	MouseButton,
	Content,
	SquareCoords,
	SquaresBoard,
} from "../types";
import {
	generateEmptySquares,
	generateSquaresValues,
	revealSquare,
	revealSurroundingSquares,
	toggleSquareFlag,
	isGameLost,
	isGameWon,
} from "../functions/minesweeper";
import { Bomb } from "./Bomb";
import { Square } from "./Square";
import { Flag } from "./Flag";

function Board() {
	const [squares, setSquares] = useState<SquaresBoard>(generateEmptySquares());
	const isFirstClick = useRef<boolean>(true);

	document.addEventListener("contextmenu", (e) => {
		const target = e.target as HTMLElement;
		if (target?.tagName !== "BODY") e.preventDefault();
	}); //dont show context menu on right click

	const handleClick = (
		button: MouseButton,
		clickedSquareCoords: SquareCoords
	): void => {
		const { r, c } = clickedSquareCoords;
		const clickedSquare = squares[r][c];
		const { visible, flagged } = clickedSquare.state;

		if (isFirstClick.current) {
			isFirstClick.current = false;
			return setSquares(generateSquaresValues(clickedSquareCoords));
		}

		if (button === MouseButton.left && !(visible || flagged)) {
			setSquares(revealSquare(squares, clickedSquareCoords));
		}

		if (button === MouseButton.middle && visible) {
			setSquares(revealSurroundingSquares(squares, clickedSquareCoords));
		}

		if (button === MouseButton.right && !visible) {
			setSquares(toggleSquareFlag(squares, clickedSquareCoords));
		}
	};

	useEffect(() => {
		if (isGameLost(squares)) return alert("Game Over");
		if (isGameWon(squares)) return alert("You won!");
	});

	const getContent = (square: SquareState): Content => {
		const { visible, flagged, value } = square.state;
		if (flagged) return <Flag />;
		if (visible) {
			if (value) return square.hasBomb ? <Bomb /> : value;
		}
		return null;
	};

	const board = squares.map((rows, r) => {
		const row = rows.map((column, c) => {
			const square: SquareState = squares[r][c];
			const props: SquareProps = {
				className: square.state.visible
					? `square ${Value[square.state.value]}`
					: "square",
				onClick: (e: React.MouseEvent<HTMLElement>) =>
					handleClick(e.button, { r, c }),
				onAuxClick: (e: React.MouseEvent<HTMLElement>) =>
					handleClick(e.button, { r, c }),
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
