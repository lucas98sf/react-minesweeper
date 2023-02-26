import { MAX_HEIGHT, MAX_WIDTH, NUM_MINES } from '@/config/constants';
import {
  BoardConfig,
  BoardState,
  GameResult,
  IntRange,
  MouseButton,
  Square,
  SquarePosition,
  Squares,
  SquareValue,
} from '@/types';

export class Minesweeper {
  private squares: Squares;
  private isFirstMove = true;
  private flagsLeft = NUM_MINES;
  private config: BoardConfig = {
    guessFree: false,
    minesNumber: NUM_MINES,
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
  };
  private gameState: GameResult = {
    gameOver: false,
    result: null,
  };

  constructor(private configOverrides: Partial<BoardConfig> = {}) {
    this.config = {
      ...this.config,
      ...this.configOverrides,
    };

    if (this.config.minesNumber > this.config.width * this.config.height) {
      throw new Error('Too many mines');
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
  }

  private nonRevealedSquaresAround(square: Square, squares = this.squares): SquarePosition[] {
    return square.surroundings.filter(
      ({ row, col }) => !squares[row][col].state.revealed && !squares[row][col].state.flagged,
    );
  }

  private flagsAroundSquare(square: Square, squares = this.squares): number {
    return square.surroundings.filter(({ row, col }) => squares[row][col].state.flagged).length;
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
      this.nonRevealedSquaresAround(revealedSquare, squares).length &&
      revealedSquare.value === this.flagsAroundSquare(revealedSquare, squares)
    ) {
      for (const position of this.nonRevealedSquaresAround(revealedSquare, squares)) {
        if (!squares[position.row][position.col].state.flagged) {
          this.revealSquare(position, squares);
        }
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

  public checkGameResult(): GameResult {
    const gameResult = this.isGameWon() ? 'win' : this.isGameLost() ? 'lose' : null;

    return {
      ...this.gameState,
      ...(gameResult
        ? {
            gameOver: true,
            result: gameResult,
          }
        : {
            gameOver: false,
            result: gameResult,
          }),
    };
  }

  public isBoardSolvable(squares: Squares): boolean {
    const isRevealedNumberSquare = (square: Square): square is Square & { value: number } =>
      typeof square.value === 'number' && square.state.revealed;

    const prettyPrintBoard = (squares: Squares, message?: string): void => {
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

    const getGuaranteedMines = (squares: Squares) =>
      squares
        .flat()
        .filter(isRevealedNumberSquare)
        .reduce<SquarePosition[]>((acc, square) => {
          const unrevealedSquaresAround = this.nonRevealedSquaresAround(square, squares);
          if (!unrevealedSquaresAround.length) {
            return acc;
          }

          const hasGuaranteedMineAround =
            square.value ===
            unrevealedSquaresAround.length + this.flagsAroundSquare(square, squares);

          return hasGuaranteedMineAround ? [...acc, ...unrevealedSquaresAround] : acc;
        }, []);

    const getGuaranteedNonMines = (squares: Squares) =>
      squares
        .flat()
        .filter(isRevealedNumberSquare)
        .reduce<SquarePosition[]>((acc, square) => {
          const unrevealedSquaresAround = this.nonRevealedSquaresAround(square, squares);
          if (!unrevealedSquaresAround.length) {
            return acc;
          }
          //TODO: fix this, it's not working
          //for each unrevealed square, check if marking it will invalidate any of the surrounding squares
          const hasGuaranteedNonMineAround = unrevealedSquaresAround.some(({ row, col }) => {
            const newSquares = structuredClone(squares);
            newSquares[row][col].state.flagged = true;

            const unrevealedSquaresAroundNew = this.nonRevealedSquaresAround(square, squares);
            if (!unrevealedSquaresAroundNew.length) {
              return false;
            }

            return (
              square.value ===
              unrevealedSquaresAroundNew.length + this.flagsAroundSquare(square, squares) + 1
            );
          });

          return hasGuaranteedNonMineAround ? [...acc, ...unrevealedSquaresAround] : acc;
        }, []);

    const revealOkSquares = (squares: Squares): number => {
      const okSquares = squares
        .flat()
        .filter(
          square =>
            square.state.revealed &&
            square.value &&
            this.flagsAroundSquare(square, squares) === square.value,
        );

      let changeCount = 0,
        revealedSquaresCount = squares.flat().filter(({ state: { revealed } }) => revealed).length;

      for (const square of okSquares) {
        this.revealSurroundingSquares(square.position, squares);
        const newRevealedSquaresCount = squares
          .flat()
          .filter(({ state: { revealed } }) => revealed).length;

        if (newRevealedSquaresCount !== revealedSquaresCount) {
          revealedSquaresCount = newRevealedSquaresCount;
          changeCount += 1;
          // prettyPrintBoard(`revealed ${JSON.stringify(square.position)}`);
        }
      }

      return changeCount;
    };

    let squaresClone = structuredClone(squares);

    let guaranteedMines = getGuaranteedMines(squaresClone);
    // TODO: remove coment when getGuaranteedNonMines is fixed
    const guaranteedNonMines: ReturnType<typeof getGuaranteedNonMines> = []; //getGuaranteedNonMines(squaresClone);
    prettyPrintBoard(squaresClone, 'initial');
    import.meta.env.DEV && console.time('isBoardSolvable');

    while (guaranteedMines.length || guaranteedNonMines.length) {
      for (const { row, col } of guaranteedMines) {
        const mine = squaresClone[row][col];
        if (!mine.state.flagged) {
          this.toggleSquareFlag(mine.position, squaresClone);
          // prettyPrintBoard(`flagged ${JSON.stringify(mine.position)}`);
        }
      }

      // if (guaranteedNonMines.length) {
      //   for (const { row, col } of guaranteedNonMines) {
      //     const nonMine = squaresClone[row][col];
      //     if (!nonMine.state.revealed) {
      //       this.revealSquare(nonMine.position, squaresClone);
      //       prettyPrintBoard(squaresClone, `clicked ${JSON.stringify(nonMine.position)}`);
      //     }
      //   }
      // }

      let revealedSquaresCount: number;
      do {
        revealedSquaresCount = revealOkSquares(squaresClone);
      } while (revealedSquaresCount);

      guaranteedMines = getGuaranteedMines(squaresClone);
      // guaranteedNonMines = getGuaranteedNonMines(squaresClone);
    }
    import.meta.env.DEV && console.timeEnd('isBoardSolvable');
    prettyPrintBoard(squaresClone, 'final');

    const result = this.isGameWon(squaresClone);
    squaresClone = [];

    return result;
  }

  public handleAction(button: MouseButton, clickedCoords: SquarePosition): GameResult {
    const { row, col } = clickedCoords;
    const clickedSquare = this.squares[row][col];
    const { revealed: visible, flagged } = clickedSquare.state;

    if (this.isFirstMove) {
      this.isFirstMove = false;
      this.generateSquaresValues(clickedCoords);

      return this.gameState;
    }

    if (button === MouseButton['left'] && !(visible || flagged)) {
      this.revealSquare(clickedCoords);
    }

    if (button === MouseButton['middle'] && visible) {
      this.revealSurroundingSquares(clickedCoords);
    }

    if (button === MouseButton['right'] && !visible) {
      this.toggleSquareFlag(clickedCoords);
    }

    return this.checkGameResult();
  }

  public get board(): BoardState {
    return {
      squares: this.squares,
      flagsLeft: this.flagsLeft,
      gameState: this.gameState,
      config: this.config,
    };
  }

  public reset(): this {
    this.squares = this.generateEmptySquares();
    this.flagsLeft = this.config.minesNumber;
    this.gameState = {
      gameOver: false,
      result: null,
    };
    this.isFirstMove = true;

    return this;
  }
}
