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

export type content = React.ReactElement | Value | null
export interface ISquareProps {
	className: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	onAuxClick: React.MouseEventHandler<HTMLButtonElement>;
	content: content;
}
export interface ISquare {
	hasBomb: boolean;
	state: {
		visible: boolean;
		value: Value;
	};
}

export interface IBomb {
	r: number;
	c: number;
}
