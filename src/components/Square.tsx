import { MouseButton, SquarePosition } from "~/core/types";
import { useLongPress } from "~/hooks";

type Props = {
	className: string;
	children: React.ReactNode;
	boardRef: React.RefObject<HTMLDivElement>;
	"data-row"?: number;
	"data-col"?: number;
	surroundings?: SquarePosition[];
	onClick?: (
		e:
			| React.MouseEvent<HTMLButtonElement>
			| React.TouchEvent<HTMLButtonElement>,
	) => void;
} & Partial<ReturnType<typeof useLongPress<HTMLButtonElement>>>;

export function Square({
	children,
	surroundings,
	boardRef,
	className,
	onMouseLeave,
	...props
}: Props) {
	const pressButtons = (e: React.MouseEvent<HTMLButtonElement>) => {
		const action = e.type === "mousedown" ? "add" : "remove";

		const revealSurroundings = (surroundings: SquarePosition[]) => {
			const surroundingButtons =
				boardRef?.current?.querySelectorAll<HTMLButtonElement>(
					`:is(${surroundings
						.map(({ row, col }) => `[data-row="${row}"][data-col="${col}"]`)
						.join(", ")})`,
				) ?? [];

			for (const el of surroundingButtons) {
				if (
					[...el.children].some((child) => child.classList.contains("flag"))
				) {
					continue;
				}
				el.classList[action]("square-revealed");
			}
		};

		if (e.button === MouseButton.left) {
			e.currentTarget.classList[action]("square-revealed");
		}

		if (e.button === MouseButton.middle) {
			if (e.currentTarget.classList.contains("square-unrevealed")) {
				return;
			}
			surroundings && revealSurroundings(surroundings);
		}
	};

	return (
		<button
			type="button"
			className={`square ${className}`}
			onMouseDownCapture={pressButtons}
			onMouseUpCapture={pressButtons}
			onMouseLeave={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
				const revealedSquares =
					boardRef?.current?.querySelectorAll<HTMLButtonElement>(
						".square-revealed",
					) ?? [];
				for (const el of revealedSquares) {
					el.classList.remove("square-revealed");
				}
				return onMouseLeave?.(e);
			}}
			{...props}
		>
			{children}
		</button>
	);
}
