import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from '@/config/constants';
import { SquaresBoard, SquareState, SquareCoords, Value } from '@/types';

export const generateEmptySquares = (): SquaresBoard => {
  const squares: SquaresBoard = [];

  for (let i = 0; i < MAX_HEIGHT; i++) {
    const row: SquareState[] = [];
    for (let j = 0; j < MAX_WIDTH; j++) {
      const square: SquareState = {
        hasBomb: false,
        state: {
          flagged: false,
          visible: false,
          value: null,
        },
      };
      row.push(square);
    }
    squares.push(row);
  }

  return squares;
};

export const generateSquaresValues = (firstClick: SquareCoords): SquaresBoard => {
  const bombs = generateBombs(firstClick);
  const squares: SquaresBoard = [];

  for (let r = 0; r < MAX_HEIGHT; r++) {
    const row: SquareState[] = [];
    for (let c = 0; c < MAX_WIDTH; c++) {
      const hasBomb = bombs.some(bomb => bomb.row === r && bomb.col === c);
      const visible = firstClick.row === r && firstClick.col === c;
      const square: SquareState = {
        hasBomb,
        state: {
          flagged: false,
          visible,
          value: hasBomb ? Value.bomb : null,
        },
      };
      row.push(square);
    }
    squares.push(row);
  }

  const squaresAfterFirstClick = revealSquare(squares, firstClick);

  return squaresAfterFirstClick;
};

export const revealSquare = (squares: SquaresBoard, clickCoords: SquareCoords): SquaresBoard => {
  const { row: clickedRow, col: clickedCol } = clickCoords;
  const newSquares: SquaresBoard = structuredClone(squares);

  const clickedSquare = newSquares[clickedRow][clickedCol];

  clickedSquare.state.value = clickedSquare.hasBomb
    ? Value.bomb
    : getSquareValue(newSquares, clickCoords);
  clickedSquare.state.visible = true;

  const isEmptySquare = clickedSquare.state.value === Value.zero;

  return isEmptySquare ? revealSurroundingSquares(newSquares, clickCoords) : newSquares;
};

export const revealSurroundingSquares = (
  squares: SquaresBoard,
  clickCoords: SquareCoords,
): SquaresBoard => {
  const { row: clickedRow, col: clickedCol } = clickCoords;
  let newSquares: SquaresBoard = structuredClone(squares);
  const clickedSquare = newSquares[clickedRow][clickedCol];
  const squareValue = clickedSquare.state.value;

  if (squareValue === null || squareValue === flagsAroundSquare(newSquares, clickCoords)) {
    newSquares.forEach((rows, row) => {
      rows.forEach((columns, col) => {
        const square: SquareState = newSquares[row][col];
        if (
          isSquareAround({ row, col }, clickCoords) &&
          !square.state.visible &&
          !square.state.flagged
        ) {
          newSquares = revealSquare(newSquares, { row, col });
        }
      });
    });
  }

  return newSquares;
};

export const toggleSquareFlag = (
  squares: SquaresBoard,
  { row, col }: SquareCoords,
): SquaresBoard => {
  const newSquares = structuredClone(squares);

  const square: SquareState = newSquares[row][col];
  square.state.flagged = !square.state.flagged;

  return newSquares;
};

export const isGameLost = (squares: SquaresBoard): boolean => {
  const clickedSquares = squares.flat().filter(square => square.state.visible);

  return clickedSquares.some(square => square.hasBomb);
};

export const isGameWon = (squares: SquaresBoard): boolean => {
  const allSquaresRevealedOrFlagged = squares
    .flat()
    .every(
      square =>
        (square.state.visible && !square.hasBomb) || (square.state.flagged && square.hasBomb),
    );

  return allSquaresRevealedOrFlagged;
};

const isSquareAround = (
  { row, col }: SquareCoords,
  { row: clickedRow, col: clickedCol }: SquareCoords,
): boolean => {
  const isAdjacentRow = [clickedRow - 1, clickedRow + 1].includes(row);
  const isAdjacentCol = [clickedCol - 1, clickedCol + 1].includes(col);
  const isLeftOrRight = clickedRow === row && isAdjacentCol;
  const isUpOrDown = clickedCol === col && isAdjacentRow;
  const isInCorners = isAdjacentRow && isAdjacentCol;

  if (isInCorners || isLeftOrRight || isUpOrDown) {
    return true;
  }

  return false;
};

const generateBombs = (firstClick: SquareCoords): SquareCoords[] => {
  const { row: clickedRow, col: clickedCol } = firstClick;

  const bombs: SquareCoords[] = [];
  const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;

  for (let i = 0; i < NUM_BOMBS; i++) {
    const newBomb: SquareCoords = {
      row: randomCoord(MAX_HEIGHT),
      col: randomCoord(MAX_WIDTH),
    };

    const validLocation =
      !(newBomb.row === clickedRow && newBomb.col === clickedCol) &&
      !bombs.some(bomb => bomb.row === newBomb.row && bomb.col === newBomb.col) &&
      !isSquareAround(newBomb, firstClick);

    validLocation ? bombs.push(newBomb) : --i;
  }

  return bombs;
};

const getSquareValue = (squares: SquaresBoard, squareCoords: SquareCoords): Value => {
  let bombCount = 0;

  squares.forEach((rows, row) => {
    rows.forEach((columns, col) => {
      const square: SquareState = squares[row][col];
      if (isSquareAround({ row, col }, squareCoords) && square.hasBomb) {
        bombCount++;
      }
    });
  });

  return bombCount;
};

const flagsAroundSquare = (squares: SquaresBoard, clickCoords: SquareCoords): number => {
  let flagsCount = 0;

  squares.forEach((rows, row) => {
    rows.forEach((columns, col) => {
      if (isSquareAround({ row, col }, clickCoords) && squares[row][col].state.flagged)
        flagsCount++;
    });
  });

  return flagsCount;
};

//TODO: implement this
// export const isBoardSolvable = (squares: SquaresBoard): boolean => {};
