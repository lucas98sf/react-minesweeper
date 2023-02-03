import { SquareProps } from '../types';

export function Square(props: SquareProps) {
  const { className, onClick, onAuxClick, content } = props;
  return (
    <button className={className} onClick={onClick} onAuxClick={onAuxClick}>
      {content}
    </button>
  );
}
