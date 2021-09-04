import { ISquareProps } from "../interfaces";

export function Square(props: ISquareProps) {
	const { className, onClick, onAuxClick, content } = props;
	return (
		<button className={className} onClick={onClick} onAuxClick={onAuxClick}>
			{content}
		</button>
	);
}
