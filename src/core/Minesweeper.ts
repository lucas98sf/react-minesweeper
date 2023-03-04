import { MAX_HEIGHT, MAX_WIDTH, MIN_HEIGHT, MIN_WIDTH, NUM_MINES } from '@/config/constants';
import {
  BoardConfig,
  BoardState,
  GameState,
  IntRange,
  MouseButton,
  Square,
  SquarePosition,
  Squares,
  SquareValue,
} from '@/types';

export class Minesweeper {
  private squares: Squares;
  private flagsLeft = NUM_MINES;
  private config: BoardConfig = {
    guessFree: false,
    minesNumber: NUM_MINES,
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    randomizer: Math.random,
  };
  private gameState: GameState = {
    gameOver: false,
    result: null,
    isFirstMove: true,
  };

  constructor(private configOverrides: Partial<BoardConfig> = {}) {
    this.config = {
      ...this.config,
      ...this.configOverrides,
    };

    if (this.config.minesNumber > this.config.width * this.config.height - 9) {
      throw new Error('Too many mines');
    }

    if (this.config.minesNumber < 1) {
      throw new Error('Too few mines');
    }

    if (this.config.width < MIN_WIDTH) {
      throw new Error('Too few columns');
    }

    if (this.config.height < MIN_HEIGHT) {
      throw new Error('Too few rows');
    }

    if (this.config.height > MAX_HEIGHT) {
      throw new Error('Too many rows');
    }

    if (this.config.width > MAX_WIDTH) {
      throw new Error('Too many columns');
    }

    this.flagsLeft = this.config.minesNumber;
    this.squares = this.generateEmptySquares();
  }

  private generateEmptySquares(): Squares {
    return Array.from({ length: this.config.height }, (_, rowIndex) =>
      Array.from(
        { length: this.config.width },
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
            ({ row, col }) =>
              row >= 0 && row < this.config.height && col >= 0 && col < this.config.width,
          ) as SquarePosition[],
          value: null,
          state: {
            flagged: false,
            revealed: false,
          },
        }),
      ),
    );
  }

  private generateSquaresValues(firstClick: SquarePosition): Squares {
    const mines = this.generateMines(firstClick);

    for (const { row, col } of mines) {
      this.squares[row][col].value = 'mine';
    }

    for (const square of this.squares.flat()) {
      if (square.value !== 'mine') {
        square.value = square.surroundings.filter(
          ({ row, col }) => this.squares[row][col].value === 'mine',
        ).length as SquareValue;
      }
    }

    import.meta.env.DEV && console.count('boardGeneration');

    this.revealSquare(firstClick);

    if (this.config.guessFree) {
      if (this.isBoardSolvable(this.squares)) {
        return this.squares;
      }

      this.squares = this.generateEmptySquares();

      return this.generateSquaresValues(firstClick);
    }

    return this.squares;
  }

  private generateMines(firstClick: SquarePosition): SquarePosition[] {
    const { row: clickedRow, col: clickedCol } = firstClick;
    const mines: SquarePosition[] = [];
    const randomPosition = (MAX: typeof this.config.height | typeof this.config.width) =>
      ((this.config.randomizer() * MAX) << 0) as IntRange<0, typeof MAX>;

    while (mines.length < this.config.minesNumber) {
      const newMine: SquarePosition = {
        row: randomPosition(this.config.height),
        col: randomPosition(this.config.width),
      };

      const validLocation =
        !mines.some(mine => mine.row === newMine.row && mine.col === newMine.col) &&
        (Math.abs(newMine.row - clickedRow) > 1 || Math.abs(newMine.col - clickedCol) > 1);

      if (validLocation) {
        mines.push(newMine);
      }
    }

    return mines;
  }

  private nonRevealedSquaresAround(square: Square, squares = this.squares): SquarePosition[] {
    return square.surroundings.filter(
      ({ row, col }) => !squares[row][col].state.revealed && !squares[row][col].state.flagged,
    );
  }

  private flagsAroundSquare(square: Square, squares = this.squares) {
    return square.surroundings.filter(({ row, col }) => squares[row][col].state.flagged);
  }

  private revealSquare({ row, col }: SquarePosition, squares = this.squares): void {
    const square = squares[row][col];
    square.state.revealed = true;

    if (squares[row][col].value === 0) {
      return this.revealSurroundingSquares({ row, col }, squares);
    }
  }

  private revealSurroundingSquares({ row, col }: SquarePosition, squares = this.squares): void {
    const revealedSquare = squares[row][col];

    if (
      revealedSquare.value !== undefined &&
      revealedSquare.value === this.flagsAroundSquare(revealedSquare, squares).length
    ) {
      for (const position of this.nonRevealedSquaresAround(revealedSquare, squares)) {
        this.revealSquare(position, squares);
      }
    }
  }

  private toggleSquareFlag({ row, col }: SquarePosition, squares = this.squares): void {
    const square = squares[row][col];
    if (square.state.flagged) {
      square.state.flagged = false;
      if (squares === this.squares) {
        this.flagsLeft += 1;
      }
    } else {
      square.state.flagged = true;
      if (squares === this.squares) {
        this.flagsLeft -= 1;
      }
    }
  }

  private isGameLost(squares = this.squares): boolean {
    const clickedSquares = squares.flat().filter(square => square.state.revealed);

    return clickedSquares.some(square => square.value === 'mine');
  }

  private isGameWon(squares = this.squares): boolean {
    const allSquaresRevealedOrFlagged = squares
      .flat()
      .every(
        square =>
          (square.state.revealed && square.value !== 'mine') ||
          (square.state.flagged && square.value === 'mine'),
      );

    return allSquaresRevealedOrFlagged;
  }

  private checkGameState() {
    const result = this.isGameWon() ? 'win' : this.isGameLost() ? 'lose' : null;

    this.gameState = {
      ...this.gameState,
      gameOver: !!result,
      result,
    };
  }

  public static prettyPrintBoard(squares: Squares, message?: string) {
    if (import.meta.env.MODE !== 'test') {
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
    const resultingMessage = (message ?? '') + '\n' + ` ${board.join(' ')}`;

    console.log(resultingMessage);
    return resultingMessage
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  public isBoardSolvable(squares: Squares): boolean {
    const isRevealedNumberSquare = (square: Square): square is Square & { value: number } =>
      typeof square.value === 'number' && square.state.revealed;

    const getGuaranteedMines = (squares: Squares) => {
      const revealedNumberSquares = squares.flat().filter(isRevealedNumberSquare);
      const guaranteedMines = revealedNumberSquares.reduce<{
        mines: SquarePosition[];
        nonMines: SquarePosition[];
        okSquares: Square[];
      }>(
        (acc, square) => {
          if (
            acc.okSquares.some(
              ({ position }) => JSON.stringify(position) === JSON.stringify(square.position),
            )
          ) {
            return acc;
          }

          const unrevealedSquaresAround = this.nonRevealedSquaresAround(square, squares);
          if (!unrevealedSquaresAround.length) {
            return acc;
          }

          const hasGuaranteedMineAround =
            square.value ===
            unrevealedSquaresAround.length + this.flagsAroundSquare(square, squares).length;

          if (hasGuaranteedMineAround) {
            for (const position of unrevealedSquaresAround) {
              if (!acc.mines.some(mine => JSON.stringify(mine) === JSON.stringify(position))) {
                acc.mines.push(position);
              }
            }
            acc.okSquares.push(square);
          } else {
            const checkUnrevealedSquaresAround = (
              unrevealedSquaresAround: SquarePosition[],
            ): void => {
              for (const { row, col } of unrevealedSquaresAround.sort(
                ({ row, col }) => squares[row][col].surroundings.length,
              )) {
                const unrevealedSquare = squares[row][col];

                const surroundingValues = unrevealedSquare.surroundings.filter(({ row, col }) =>
                  isRevealedNumberSquare(squares[row][col]),
                );

                const positionToString = (position: SquarePosition) =>
                  '' + position.row + position.col;

                const stringToPosition = (position: string) => {
                  const [row, col] = position.split('');
                  return { row: Number(row), col: Number(col) } as SquarePosition;
                };

                const valuesIfMine = new Map<string, 0 | 1>().set(
                  positionToString({ row, col }),
                  1,
                );

                for (const { row, col } of surroundingValues) {
                  const surroundingSquare = squares[row][col] as Square & { value: number }; // (0, 1)

                  const surroundingUnrevealedSquares = this.nonRevealedSquaresAround(
                    surroundingSquare,
                    squares,
                  );

                  const flagsAroundSurroundingSquare = this.flagsAroundSquare(
                    surroundingSquare,
                    squares,
                  );

                  if (flagsAroundSurroundingSquare.length) {
                    for (const position of flagsAroundSurroundingSquare) {
                      if (!valuesIfMine.has(positionToString(position))) {
                        valuesIfMine.set(positionToString(position), 1);
                      }
                    }
                  }

                  const { maybeMinesAround, unknownSurroundingUnrevealedSquares } =
                    surroundingUnrevealedSquares.reduce(
                      (acc, position) => {
                        if (valuesIfMine.has(positionToString(position))) {
                          return valuesIfMine.get(positionToString(position)) === 1
                            ? {
                                ...acc,
                                maybeMinesAround: acc.maybeMinesAround + 1,
                              }
                            : {
                                ...acc,
                                maybeNonMinesAround: acc.maybeNonMinesAround + 1,
                              };
                        } else {
                          acc.unknownSurroundingUnrevealedSquares.push(position);
                        }

                        return acc;
                      },
                      {
                        maybeMinesAround: 0,
                        maybeNonMinesAround: 0,
                        unknownSurroundingUnrevealedSquares: [] as SquarePosition[],
                      },
                    );

                  if (
                    maybeMinesAround > surroundingSquare.value ||
                    maybeMinesAround + unknownSurroundingUnrevealedSquares.length <
                      surroundingSquare.value
                  ) {
                    console.log('asjhkdhjksadhjkasdhjkashjkd');
                    return checkUnrevealedSquaresAround(
                      unrevealedSquaresAround.filter(
                        square =>
                          JSON.stringify(square) !== JSON.stringify(unrevealedSquare.position),
                      ),
                    );
                  } else if (maybeMinesAround === surroundingSquare.value) {
                    for (const unknownSquare of unknownSurroundingUnrevealedSquares) {
                      if (!valuesIfMine.has(positionToString(unknownSquare))) {
                        valuesIfMine.set(positionToString(unknownSquare), 0);
                      }
                    }
                  } else if (
                    maybeMinesAround + unknownSurroundingUnrevealedSquares.length ===
                    surroundingSquare.value
                  ) {
                    for (const unknownSquare of unknownSurroundingUnrevealedSquares) {
                      if (!valuesIfMine.has(positionToString(unknownSquare))) {
                        valuesIfMine.set(positionToString(unknownSquare), 1);
                      }
                    }
                  }
                }

                //fazer recursao antes...
                valuesIfMine.forEach((value, position) => {
                  if (value === 0) {
                    if (
                      !acc.nonMines.some(mine => JSON.stringify(mine) === JSON.stringify(position))
                    ) {
                      console.log({ value, position });
                      acc.nonMines.push(stringToPosition(position));
                    }
                  } else {
                    if (
                      !acc.mines.some(mine => JSON.stringify(mine) === JSON.stringify(position))
                    ) {
                      console.log({ value, position });
                      acc.mines.push(stringToPosition(position));
                    }
                  }
                });

                // if (
                //   !acc.okSquares.some(
                //     ({ position }) => JSON.stringify(position) === JSON.stringify(square.position),
                //   )
                // ) {
                //   acc.okSquares.push(square);
                // }
              }
            };
            checkUnrevealedSquaresAround(unrevealedSquaresAround);
          }

          return acc;
        },
        { mines: [], nonMines: [], okSquares: [] },
      );

      if (!guaranteedMines.okSquares.length) {
        return {
          mines: guaranteedMines.mines,
          nonMines: guaranteedMines.nonMines,
          okSquares: revealedNumberSquares.filter(
            square =>
              this.flagsAroundSquare(square, squares).length === square.value &&
              this.nonRevealedSquaresAround(square, squares).length,
          ),
        };
      }

      return guaranteedMines;
    };

    const squaresClone = structuredClone(squares);
    let guaranteedMines = getGuaranteedMines(squaresClone);

    Minesweeper.prettyPrintBoard(squaresClone, 'initial');
    import.meta.env.DEV && console.time('isBoardSolvable');

    while (Object.values(guaranteedMines).flat().length) {
      for (const { row, col } of guaranteedMines.mines) {
        const mine = squaresClone[row][col];
        this.toggleSquareFlag(mine.position, squaresClone);
        // Minesweeper.prettyPrintBoard(squaresClone, `flagged ${JSON.stringify(mine.position)}`);
      }

      for (const { row, col } of guaranteedMines.nonMines) {
        const nonMine = squaresClone[row][col];
        this.revealSquare(nonMine.position, squaresClone);
        Minesweeper.prettyPrintBoard(squaresClone, `clicked ${JSON.stringify(nonMine.position)}`);
      }

      for (const square of guaranteedMines.okSquares) {
        this.revealSurroundingSquares(square.position, squaresClone);
      }

      guaranteedMines = getGuaranteedMines(squaresClone);
    }

    import.meta.env.DEV && console.timeEnd('isBoardSolvable');
    Minesweeper.prettyPrintBoard(squaresClone, 'final');

    const result = this.isGameWon(squaresClone);

    return result;
  }

  public handleAction(button: MouseButton, clickedCoords: SquarePosition): this | false {
    const { row, col } = clickedCoords;
    const clickedSquare = this.squares[row][col];
    if (!clickedSquare) {
      throw new Error('Clicked square is not on the board');
    }

    const { revealed: visible, flagged } = clickedSquare.state;

    if (this.gameState.gameOver) {
      return false;
    }

    if (this.gameState.isFirstMove) {
      this.generateSquaresValues(clickedCoords);
      this.gameState.isFirstMove = false;

      return this;
    }

    if (button === MouseButton.left && !(visible || flagged)) {
      this.revealSquare(clickedCoords);
    }

    if (button === MouseButton.middle && visible) {
      this.revealSurroundingSquares(clickedCoords);
    }

    if (button === MouseButton.right && !visible) {
      this.toggleSquareFlag(clickedCoords);
    }

    this.checkGameState();
    return this;
  }

  public get board(): BoardState {
    return {
      squares: this.squares,
      flagsLeft: this.flagsLeft,
      config: this.config,
    };
  }

  public get state(): GameState {
    return this.gameState;
  }

  public reset(): this {
    this.squares = this.generateEmptySquares();
    this.flagsLeft = this.config.minesNumber;
    this.gameState = {
      gameOver: false,
      result: null,
      isFirstMove: true,
    };

    return this;
  }
}
