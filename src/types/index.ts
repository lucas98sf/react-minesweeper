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

export interface Square {
	hasBomb: boolean;
	state: {
		visible: boolean;
		value: Value;
	};
}

export interface Bomb {
	r: number;
	c: number;
}
