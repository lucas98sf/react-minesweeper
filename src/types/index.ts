import React from "react";

export enum Value {
	zero,
	one,
	two,
	three,
	four,
	five,
	six,
	seven,
	eight,
	bomb
}

export enum mouseClick {
	left,
	middle,
	right
}

export type content = React.ReactElement | Value | null;

export type SquareProps = {
	className: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	onAuxClick: React.MouseEventHandler<HTMLButtonElement>;
	content: content;
};

export type SquareState = {
	hasBomb: boolean;
	state: {
		flagged: boolean;
		visible: boolean;
		value: Value;
	};
};

export type Coords = {
	r: number;
	c: number;
};
