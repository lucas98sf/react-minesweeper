import { NUM_BOMBS, MAX_HEIGHT, MAX_WIDTH } from '@/config/constants';
import { SquaresBoard, Square, SquareCoords, SquareValue } from '@/types';

//TODO: organize this file
export const generateEmptySquares = () =>
  Array.from({ length: MAX_HEIGHT }, (__row, rowIndex) =>
    Array.from(
      { length: MAX_WIDTH },
      (__col, colIndex): Square => ({
        hasBomb: false,
        position: { row: rowIndex, col: colIndex },
        state: {
          flagged: false,
          visible: false,
          value: null,
        },
      }),
    ),
  );

export const generateSquaresValues = (firstClick: SquareCoords): SquaresBoard => {
  const bombs = generateBombs(firstClick);
  const squares: SquaresBoard = Array.from({ length: MAX_HEIGHT }, (__row, rowIndex) =>
    Array.from({ length: MAX_WIDTH }, (__col, colIndex) => {
      const hasBomb = bombs.some(bomb => bomb.row === rowIndex && bomb.col === colIndex);

      return {
        hasBomb,
        position: { row: rowIndex, col: colIndex },
        state: {
          flagged: false,
          visible: rowIndex === firstClick.row && colIndex === firstClick.col,
          value: hasBomb ? SquareValue.bomb : null,
        },
      };
    }),
  );

  import.meta.env.DEV && console.count('boardGeneration');

  const squaresAfterFirstClick = revealSquare(squares, firstClick);
  if (isBoardSolvable(squaresAfterFirstClick)) {
    return squaresAfterFirstClick;
  }

  return generateSquaresValues(firstClick);
};

export const revealSquare = (squares: SquaresBoard, clickCoords: SquareCoords): SquaresBoard => {
  const { row: clickedRow, col: clickedCol } = clickCoords;
  const newSquares: SquaresBoard = structuredClone(squares);

  const clickedSquare = newSquares[clickedRow][clickedCol];

  clickedSquare.state.value = clickedSquare.hasBomb
    ? SquareValue.bomb
    : getSquareValue(newSquares, clickCoords);
  clickedSquare.state.visible = true;

  const isEmptySquare = clickedSquare.state.value === SquareValue.zero;

  return isEmptySquare ? revealSurroundingSquares(newSquares, clickCoords) : newSquares;
};

export const revealSurroundingSquares = (
  squares: SquaresBoard,
  clickCoords: SquareCoords,
): SquaresBoard => {
  const squareValue = squares[clickCoords.row][clickCoords.col].state.value;

  if (
    squareValue !== null &&
    nonVisibleSquaresAround(squares, clickCoords).length &&
    squareValue === flagsAroundSquare(squares, clickCoords)
  ) {
    let newSquares: SquaresBoard = structuredClone(squares);
    const nonVisibleSquares = nonVisibleSquaresAround(squares, clickCoords);

    for (const position of nonVisibleSquares) {
      if (!squares[position.row][position.col].state.flagged) {
        newSquares = revealSquare(newSquares, position);
      }
    }

    return newSquares;
  }
  return squares;
};

export const toggleSquareFlag = (
  squares: SquaresBoard,
  { row, col }: SquareCoords,
): SquaresBoard => {
  const newSquares = structuredClone(squares);

  const square: Square = newSquares[row][col];
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
  const isRowAdjacent = [clickedRow - 1, clickedRow + 1].includes(row);
  const isColAdjacent = [clickedCol - 1, clickedCol + 1].includes(col);
  const isLeftOrRight = clickedRow === row && isColAdjacent;
  const isUpOrDown = clickedCol === col && isRowAdjacent;
  const isInCorners = isRowAdjacent && isColAdjacent;

  if (isInCorners || isLeftOrRight || isUpOrDown) {
    return true;
  }

  return false;
};

const generateBombs = (firstClick: SquareCoords): SquareCoords[] => {
  const { row: clickedRow, col: clickedCol } = firstClick;
  const bombs = new Set<SquareCoords>();
  const randomCoord = (MAX: number) => (Math.random() * MAX) << 0;

  for (let i = 0; i < NUM_BOMBS; i++) {
    const newBomb: SquareCoords = {
      row: randomCoord(MAX_HEIGHT),
      col: randomCoord(MAX_WIDTH),
    };

    const validLocation =
      !(newBomb.row === clickedRow && newBomb.col === clickedCol) &&
      !bombs.has(newBomb) &&
      !isSquareAround(newBomb, firstClick);

    if (validLocation) {
      bombs.add(newBomb);
    } else {
      --i;
    }
  }

  return [...bombs];
};

const getSquareValue = (squares: SquaresBoard, squareCoords: SquareCoords) =>
  squares.flat().filter(square => square.hasBomb && isSquareAround(square.position, squareCoords))
    .length as SquareValue;

const flagsAroundSquare = (squares: SquaresBoard, clickCoords: SquareCoords): number =>
  squares
    .flat()
    .filter(square => square.state.flagged && isSquareAround(square.position, clickCoords)).length;

//FIXME: its slow
export const isBoardSolvable = (squares: SquaresBoard) => {
  let squaresMut = structuredClone(squares);

  let guaranteedBombs = getGuaranteedBombs(squaresMut);
  prettyPrintBoard(squaresMut, 'initial');
  import.meta.env.DEV && console.time('isBoardSolvable');
  while (guaranteedBombs.length) {
    for (const position of guaranteedBombs) {
      if (!squaresMut[position.row][position.col].state.flagged) {
        squaresMut = toggleSquareFlag(squaresMut, position);
        prettyPrintBoard(squaresMut, `flagged ${JSON.stringify(position)}`);
      }
    }

    let revealedSquaresCount: number;
    do {
      [squaresMut, revealedSquaresCount] = revealOkSquares(squaresMut);
    } while (revealedSquaresCount > 0);

    guaranteedBombs = getGuaranteedBombs(squaresMut);
  }
  import.meta.env.DEV && console.timeEnd('isBoardSolvable');
  prettyPrintBoard(squaresMut, 'final');

  return isGameWon(squaresMut);
};

const prettyPrintBoard = (squares: SquaresBoard, message?: string): void => {
  if (import.meta.env.MODE !== 'testing') {
    return;
  }

  const board = squares
    .flatMap(row => [row, '\n'])
    .flat()
    .map(square => {
      if (typeof square === 'string') {
        return square;
      }

      const numbersEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

      if (square.state.visible) {
        if (square.hasBomb) {
          return '💣';
        }
        if (square.state.value) {
          return numbersEmojis[square.state.value - 1];
        }
        return '⬛';
      } else {
        if (square.state.flagged) {
          return '🚩';
        }
        return '⬜';
      }
    });

  message && console.log(message + '\n');
  return console.log(` ${board.join(' ')}`);
};

const nonVisibleSquaresAround = (squares: SquaresBoard, position: SquareCoords) =>
  squares
    .flat()
    .filter(
      nonRevSquare =>
        !nonRevSquare.state.visible &&
        !nonRevSquare.state.flagged &&
        isSquareAround(nonRevSquare.position, position),
    )
    .map(square => square.position);

const getGuaranteedBombs = (squares: SquaresBoard) =>
  squares
    .flat()
    .filter(square => square.state.value)
    .reduce<SquareCoords[]>((acc, square) => {
      const unrevealedSquaresAround = nonVisibleSquaresAround(squares, square.position);
      if (!unrevealedSquaresAround.length) {
        return acc;
      }

      const hasGuaranteedBombAround =
        square.state.value ===
        unrevealedSquaresAround.length + flagsAroundSquare(squares, square.position);

      return hasGuaranteedBombAround ? [...acc, ...unrevealedSquaresAround] : acc;
    }, []);

const revealOkSquares = (squares: SquaresBoard): [SquaresBoard, number] => {
  const okSquares = squares
    .flat()
    .filter(
      ({ position, state: { value } }) => value && flagsAroundSquare(squares, position) === value,
    );

  let changeCount = 0,
    newSquares = structuredClone(squares),
    visibleSquaresCount = newSquares.flat().filter(s => s.state.visible).length;

  for (const square of okSquares) {
    const revealedSquares = revealSurroundingSquares(newSquares, square.position);
    const newVisibleSquaresCount = revealedSquares.flat().filter(s => s.state.visible).length;
    if (newVisibleSquaresCount !== visibleSquaresCount) {
      newSquares = revealedSquares;
      visibleSquaresCount = newVisibleSquaresCount;
      changeCount += 1;
      prettyPrintBoard(newSquares, `revealed ${JSON.stringify(square.position)}`);
    }
  }

  return [newSquares, changeCount];
};
