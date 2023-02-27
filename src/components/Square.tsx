import { useLongPress } from '@/hooks';
import { MouseButton, SquarePosition } from '@/types';

type Props = {
  className: string;
  children: React.ReactNode;
  'data-row'?: number;
  'data-col'?: number;
  surroundings?: SquarePosition[];
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
} & Partial<ReturnType<typeof useLongPress<HTMLButtonElement>>>;

export function Square({ children, surroundings, onMouseLeave, ...props }: Props) {
  const pressButtons = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const action = e.type === 'mousedown' ? 'add' : 'remove';

    const revealSurroundings = (surroundings: SquarePosition[]) => {
      for (const el of window.document.querySelectorAll<HTMLButtonElement>(
        `:is(${surroundings
          .map(({ row, col }) => `[data-row="${row}"][data-col="${col}"]`)
          .join(', ')})`,
      )) {
        if ([...el.children].some(child => child.classList.contains('flag'))) {
          continue;
        }
        el.classList[action]('revealed');
      }
    };

    if (e.button === MouseButton['left']) {
      e.currentTarget.classList[action]('revealed');
    }

    if (e.button === MouseButton['middle']) {
      if (e.currentTarget.classList.contains('unrevealed')) {
        return;
      }
      surroundings && revealSurroundings(surroundings);
    }
  };

  return (
    <button
      onMouseDownCapture={pressButtons}
      onMouseUpCapture={pressButtons}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        window.document.querySelectorAll<HTMLButtonElement>('.revealed').forEach(el => {
          el.classList.remove('revealed');
        });
        return onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
