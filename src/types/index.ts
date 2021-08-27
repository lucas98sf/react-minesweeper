export interface Square {
	hasBomb: boolean;
	state: {
		visible: boolean;
		value: number;
	};
}

export interface Bomb {
	x: number,
	y: number
}
