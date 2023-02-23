import { MAX_HEIGHT, MAX_WIDTH, NUM_MINES } from '@/config/constants';
import { Board, IntRange, Square, SquarePosition, SquareValue } from '@/types';

//TODO: organize this file
export const generateEmptySquares = () => {
  const squares = Array.from({ length: MAX_HEIGHT }, (_, rowIndex) =>
    Array.from(
      { length: MAX_WIDTH },
      (_, colIndex): Square => ({
        position: { row: rowIndex, col: colIndex } as SquarePosition,
        surroundings: [
          { row: rowIndex - 1, col: colIndex - 1 },
          { row: rowIndex - 1, col: colIndex },
          { row: rowIndex - 1, col: colIndex + 1 },
          { row: rowIndex, col: colIndex - 1 },
          { row: rowIndex, col: colIndex + 1 },
          { row: rowIndex + 1, col: colIndex - 1 },
          { row: rowIndex + 1, col: colIndex },
          { row: rowIndex + 1, col: colIndex + 1 },
        ].filter(
          ({ row, col }) => row >= 0 && row < MAX_HEIGHT && col >= 0 && col < MAX_WIDTH,
        ) as SquarePosition[],
        value: null,
        state: {
          flagged: false,
          revealed: false,
        },
      }),
    ),
  );

  return squares;
};

export const generateSquaresValues = (firstClick: SquarePosition): Board => {
  const squares = generateEmptySquares();
  const mines = generateMines(firstClick);

  for (const { row, col } of mines) {
    squares[row][col].value = 'mine';
  }

  for (const square of squares.flat()) {
    if (square.value !== 'mine') {
      square.value = square.surroundings.filter(
        ({ row, col }) => squares[row][col].value === 'mine',
      ).length as SquareValue;
    }
  }

  import.meta.env.DEV && console.count('boardGeneration');

  const newSquares = revealSquare(squares, firstClick);

  if (isBoardSolvable(newSquares)) {
    return newSquares;
  }

  return generateSquaresValues(firstClick);
};

export const generateMines = (firstClick: SquarePosition): SquarePosition[] => {
  const { row: clickedRow, col: clickedCol } = firstClick;
  const mines: SquarePosition[] = [];
  const randomPosition = (MAX: number) => ((Math.random() * MAX) << 0) as IntRange<0, typeof MAX>;

  while (mines.length < NUM_MINES) {
    const newMine: SquarePosition = {
      row: randomPosition(MAX_HEIGHT),
      col: randomPosition(MAX_WIDTH),
    };

    const validLocation =
      Math.abs(newMine.row - clickedRow) > 1 &&
      Math.abs(newMine.col - clickedCol) > 1 &&
      !mines.some(mine => mine.row === newMine.row && mine.col === newMine.col);

    if (validLocation) {
      mines.push(newMine);
    }
  }

  return mines;
};

export const revealSquare = (squares: Board, { row, col }: SquarePosition) => {
  const newSquares = structuredClone(squares);
  const revealedSquare = newSquares[row][col];
  revealedSquare.state.revealed = true;

  if (revealedSquare.value === 0) {
    return revealSurroundingSquares(newSquares, { row, col });
  }

  return newSquares;
};

export const revealSurroundingSquares = (squares: Board, { row, col }: SquarePosition): Board => {
  let newSquares = structuredClone(squares);
  const revealedSquare = newSquares[row][col];

  if (
    revealedSquare.value !== undefined &&
    nonRevealedSquaresAround(newSquares, revealedSquare).length &&
    revealedSquare.value === flagsAroundSquare(newSquares, revealedSquare)
  ) {
    for (const position of nonRevealedSquaresAround(newSquares, revealedSquare)) {
      if (!newSquares[position.row][position.col].state.flagged) {
        newSquares = revealSquare(newSquares, position);
      }
    }
  }

  return newSquares;
};

export const toggleSquareFlag = (squares: Board, { row, col }: SquarePosition) => {
  const newSquares = structuredClone(squares);

  const newSquare: Square = newSquares[row][col];
  newSquare.state.flagged = !newSquare.state.flagged;

  return newSquares;
};

export const isGameLost = (squares: Board): boolean => {
  const clickedSquares = squares.flat().filter(square => square.state.revealed);

  return clickedSquares.some(square => square.value === 'mine');
};

export const isGameWon = (squares: Board): boolean => {
  const allSquaresRevealedOrFlagged = squares
    .flat()
    .every(
      square =>
        (square.state.revealed && square.value !== 'mine') ||
        (square.state.flagged && square.value === 'mine'),
    );

  return allSquaresRevealedOrFlagged;
};

export const isBoardSolvable = (squares: Board) => {
  let squaresMut = structuredClone(squares);

  let guaranteedMines = getGuaranteedMines(squaresMut);
  let guaranteedNonMines = getGuaranteedNonMines(squaresMut);
  prettyPrintBoard(squaresMut, 'initial');
  import.meta.env.DEV && console.time('isBoardSolvable');

  while (guaranteedMines.length || guaranteedNonMines.length) {
    for (const { row, col } of guaranteedMines) {
      const mine = squaresMut[row][col];
      if (!mine.state.flagged) {
        squaresMut = toggleSquareFlag(squaresMut, mine.position);

        // prettyPrintBoard(squaresMut, `flagged ${JSON.stringify(mine.position)}`);
      }
    }

    if (guaranteedNonMines.length) {
      for (const { row, col } of guaranteedNonMines) {
        const nonMine = squaresMut[row][col];
        if (!nonMine.state.revealed) {
          squaresMut = revealSquare(squaresMut, nonMine.position);

          prettyPrintBoard(squaresMut, `clicked ${JSON.stringify(nonMine.position)}`);
        }
      }
    }

    let revealedSquaresCount: number;
    do {
      [squaresMut, revealedSquaresCount] = revealOkSquares(squaresMut);
    } while (revealedSquaresCount > 0);

    guaranteedMines = getGuaranteedMines(squaresMut);
    guaranteedNonMines = getGuaranteedNonMines(squaresMut);
  }
  import.meta.env.DEV && console.timeEnd('isBoardSolvable');
  prettyPrintBoard(squaresMut, 'final');

  return isGameWon(squaresMut);
};

const prettyPrintBoard = (squares: Board, message?: string): void => {
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

      if (square.state.revealed) {
        if (square.value === 'mine') {
          return '💣';
        }
        if (square.value) {
          return numbersEmojis[square.value - 1];
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

const nonRevealedSquaresAround = (squares: Board, square: Square) =>
  square.surroundings.filter(
    ({ row, col }) => !squares[row][col].state.revealed && !squares[row][col].state.flagged,
  );

const getGuaranteedMines = (squares: Board) =>
  squares
    .flat()
    .filter(isRevealedNumberSquare)
    .reduce<SquarePosition[]>((acc, square) => {
      const unrevealedSquaresAround = nonRevealedSquaresAround(squares, square);
      if (!unrevealedSquaresAround.length) {
        return acc;
      }

      const hasGuaranteedMineAround =
        square.value === unrevealedSquaresAround.length + flagsAroundSquare(squares, square);

      return hasGuaranteedMineAround ? [...acc, ...unrevealedSquaresAround] : acc;
    }, []);

const getGuaranteedNonMines = (squares: Board) =>
  squares
    .flat()
    .filter(isRevealedNumberSquare)
    .reduce<SquarePosition[]>((acc, square) => {
      const unrevealedSquaresAround = nonRevealedSquaresAround(squares, square);
      if (!unrevealedSquaresAround.length) {
        return acc;
      }

      //for each unrevealed square, check if marking it will invalidate any of the surrounding squares
      const hasGuaranteedNonMineAround = unrevealedSquaresAround.some(({ row, col }) => {
        const newSquares = structuredClone(squares);
        newSquares[row][col].state.flagged = true;

        const unrevealedSquaresAroundNew = nonRevealedSquaresAround(newSquares, square);
        if (!unrevealedSquaresAroundNew.length) {
          return false;
        }

        return (
          square.value ===
          unrevealedSquaresAroundNew.length + flagsAroundSquare(newSquares, square) + 1
        );
      });

      return hasGuaranteedNonMineAround ? [...acc, ...unrevealedSquaresAround] : acc;
    }, []);

const revealOkSquares = (squares: Board): [Board, number] => {
  const okSquares = squares
    .flat()
    .filter(
      square =>
        square.state.revealed &&
        square.value &&
        flagsAroundSquare(squares, square) === square.value,
    );

  let changeCount = 0,
    newSquares = structuredClone(squares),
    revealedSquaresCount = newSquares.flat().filter(({ state: { revealed } }) => revealed).length;

  for (const square of okSquares) {
    const revealedSquares = revealSurroundingSquares(newSquares, square.position);
    const newRevealedSquaresCount = revealedSquares
      .flat()
      .filter(({ state: { revealed } }) => revealed).length;

    if (newRevealedSquaresCount !== revealedSquaresCount) {
      newSquares = revealedSquares;
      revealedSquaresCount = newRevealedSquaresCount;
      changeCount += 1;
      // prettyPrintBoard(newSquares, `revealed ${JSON.stringify(square.position)}`);
    }
  }

  return [newSquares, changeCount];
};

const flagsAroundSquare = (squares: Board, square: Square): number =>
  square.surroundings.filter(({ row, col }) => squares[row][col].state.flagged).length;

const isRevealedNumberSquare = (square: Square): square is Square & { value: number } =>
  typeof square.value === 'number' && square.state.revealed;
