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
	bomb,
}

export enum MouseButton {
	left,
	middle,
	right,
}

export type MouseClick = {
	button: MouseButton;
	coords: Coords;
};

export type Content = React.ReactElement | Value | null;

export type SquareProps = {
	className: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	onAuxClick: React.MouseEventHandler<HTMLButtonElement>;
	content: Content;
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
