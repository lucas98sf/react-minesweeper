import { MouseEventHandler, ReactElement } from 'react';

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

export type Content = ReactElement | Value | null;

export type SquareProps = {
  className: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onAuxClick: MouseEventHandler<HTMLButtonElement>;
  content: Content;
};

export type SquareState = {
  hasBomb: boolean;
  state: {
    flagged: boolean;
    visible: boolean;
    value: Value | null;
  };
};

export type SquaresBoard = SquareState[][];

export enum MouseButton {
  left,
  middle,
  right,
}

export type SquareCoords = {
  row: number;
  col: number;
};
