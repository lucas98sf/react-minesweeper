import { useLongPress } from '@/hooks';
import { MouseButton, SquarePosition } from '@/types';

type Props = {
  className: string;
  children: React.ReactNode;
  boardRef: React.RefObject<HTMLDivElement>;
  'data-row'?: number;
  'data-col'?: number;
  surroundings?: SquarePosition[];
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
} & Partial<ReturnType<typeof useLongPress<HTMLButtonElement>>>;

export function Square({
  children,
  surroundings,
  onMouseLeave,
  boardRef,
  className,
  ...props
}: Props) {
  const pressButtons = (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = e.type === 'mousedown' ? 'add' : 'remove';

    const revealSurroundings = (surroundings: SquarePosition[]) => {
      boardRef?.current
        ?.querySelectorAll<HTMLButtonElement>(
          `:is(${surroundings
            .map(({ row, col }) => `[data-row="${row}"][data-col="${col}"]`)
            .join(', ')})`,
        )
        .forEach(el => {
          if ([...el.children].some(child => child.classList.contains('flag'))) {
            return;
          }
          el.classList[action]('square-revealed');
        });
    };

    if (e.button === MouseButton.left) {
      e.currentTarget.classList[action]('square-revealed');
    }

    if (e.button === MouseButton.middle) {
      if (e.currentTarget.classList.contains('square-unrevealed')) {
        return;
      }
      surroundings && revealSurroundings(surroundings);
    }
  };

  return (
    <button
      className={`square ${className}`}
      onMouseDownCapture={pressButtons}
      onMouseUpCapture={pressButtons}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        boardRef?.current?.querySelectorAll<HTMLButtonElement>('.revealed').forEach(el => {
          el.classList.remove('square-revealed');
        });
        return onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
