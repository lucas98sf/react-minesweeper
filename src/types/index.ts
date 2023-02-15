import { MouseEventHandler, ReactElement } from 'react';

export enum SquareValue {
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

export type Content = ReactElement | SquareValue | null;

export type SquareProps = {
  className: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onAuxClick: MouseEventHandler<HTMLButtonElement>;
  content: Content;
};

export type Square = {
  hasBomb: boolean;
  position: SquareCoords;
  state: {
    flagged: boolean;
    visible: boolean;
    value: SquareValue | null;
  };
};

export type SquaresBoard = Square[][];

export enum MouseButton {
  left,
  middle,
  right,
}

export type SquareCoords = {
  row: number;
  col: number;
};
