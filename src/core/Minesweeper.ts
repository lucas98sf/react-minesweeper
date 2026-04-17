// biome-ignore lint/style/useFilenamingConvention: class/hook naming convention
import {
  MAX_HEIGHT,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
  NUM_MINES,
} from "~/config/constants";
import {
  type BoardConfig,
  type BoardState,
  type GameState,
  type IntRange,
  MouseButton,
  type Square,
  type SquarePosition,
  type Squares,
  type SquareValue,
} from "~/core/types";

type PositionKey = `${number},${number}`;

const posKey = (pos: SquarePosition): PositionKey => `${pos.row},${pos.col}`;

const parsePosKey = (key: PositionKey): SquarePosition => {
  const [row, col] = key.split(",").map(Number);
  return { row, col } as SquarePosition;
};

interface SolverConstraint {
  unknowns: Set<PositionKey>;
  mineCount: number;
}

export class Minesweeper {
  private squares: Squares;
  private flagsLeft = NUM_MINES;
  private readonly config: BoardConfig = {
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

  // biome-ignore lint/style/noParameterProperties: constructor parameter property is intentional
  constructor(private readonly configOverrides: Partial<BoardConfig> = {}) {
    this.config = {
      ...this.config,
      ...this.configOverrides,
    };

    if (this.config.minesNumber > this.config.width * this.config.height - 9) {
      throw new Error("Too many mines");
    }

    if (this.config.minesNumber < 1) {
      throw new Error("Too few mines");
    }

    if (this.config.width < MIN_WIDTH) {
      throw new Error("Too few columns");
    }

    if (this.config.height < MIN_HEIGHT) {
      throw new Error("Too few rows");
    }

    if (this.config.height > MAX_HEIGHT) {
      throw new Error("Too many rows");
    }

    if (this.config.width > MAX_WIDTH) {
      throw new Error("Too many columns");
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
              row >= 0 &&
              row < this.config.height &&
              col >= 0 &&
              col < this.config.width
          ) as SquarePosition[],
          value: null,
          state: {
            flagged: false,
            revealed: false,
          },
        })
      )
    );
  }

  private generateSquaresValues(firstClick: SquarePosition): Squares {
    const mines = this.generateMines(firstClick);

    for (const { row, col } of mines) {
      this.squares[row][col].value = "mine";
    }

    for (const square of this.squares.flat()) {
      if (square.value !== "mine") {
        square.value = square.surroundings.filter(
          ({ row, col }) => this.squares[row][col].value === "mine"
        ).length as SquareValue;
      }
    }

    // biome-ignore lint/suspicious/noUnusedExpressions: dev-only debug logging
    import.meta.env.DEV && console.count("boardGeneration");

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
    const randomPosition = (
      MAX: typeof this.config.height | typeof this.config.width
      // biome-ignore lint/suspicious/noBitwiseOperators: bitwise OR for fast integer truncation
    ) => ((this.config.randomizer() * MAX) << 0) as IntRange<0, typeof MAX>;

    while (mines.length < this.config.minesNumber) {
      const newMine: SquarePosition = {
        row: randomPosition(this.config.height),
        col: randomPosition(this.config.width),
      };

      const validLocation =
        !mines.some(
          (mine) => mine.row === newMine.row && mine.col === newMine.col
        ) &&
        (Math.abs(newMine.row - clickedRow) > 1 ||
          Math.abs(newMine.col - clickedCol) > 1);

      if (validLocation) {
        mines.push(newMine);
      }
    }

    return mines;
  }

  private nonRevealedSquaresAround(
    square: Square,
    squares = this.squares
  ): SquarePosition[] {
    return square.surroundings.filter(
      ({ row, col }) =>
        !(squares[row][col].state.revealed || squares[row][col].state.flagged)
    );
  }

  private flagsAroundSquare(
    square: Square,
    squares = this.squares
  ): SquarePosition[] {
    return square.surroundings.filter(
      ({ row, col }) => squares[row][col].state.flagged
    );
  }

  private revealSquare(
    { row, col }: SquarePosition,
    squares = this.squares
  ): void {
    const square = squares[row][col];
    square.state.revealed = true;

    if (squares[row][col].value === 0) {
      this.revealSurroundingSquares({ row, col }, squares);
    }
  }

  private revealSurroundingSquares(
    { row, col }: SquarePosition,
    squares = this.squares
  ): void {
    const revealedSquare = squares[row][col];

    if (
      revealedSquare.value !== undefined &&
      revealedSquare.value ===
        this.flagsAroundSquare(revealedSquare, squares).length
    ) {
      for (const position of this.nonRevealedSquaresAround(
        revealedSquare,
        squares
      )) {
        this.revealSquare(position, squares);
      }
    }
  }

  private toggleSquareFlag(
    { row, col }: SquarePosition,
    squares = this.squares
  ): void {
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
    const clickedSquares = squares
      .flat()
      .filter((square) => square.state.revealed);

    return clickedSquares.some((square) => square.value === "mine");
  }

  private isGameWon(squares = this.squares): boolean {
    const allNonMinesRevealed = squares
      .flat()
      .every(
        (square) =>
          (square.state.revealed && square.value !== "mine") ||
          (!square.state.revealed && square.value === "mine")
      );

    return allNonMinesRevealed;
  }

  private checkGameState(): void {
    // biome-ignore lint/style/noNestedTernary: simple 3-state game result
    const result = this.isGameWon() ? "win" : this.isGameLost() ? "lose" : null;

    this.gameState = {
      ...this.gameState,
      gameOver: !!result,
      result,
    };
  }

  static prettyPrintBoard(squares: Squares, message?: string): string[] {
    if (import.meta.env.MODE !== "test") {
      return [];
    }

    const board = squares
      .flatMap((row) => [row, "\n"])
      .flat()
      .map((square) => {
        if (typeof square === "string") {
          return square;
        }

        const numbersEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

        if (square.state.revealed) {
          if (square.value === "mine") {
            return "💣";
          }
          if (square.value) {
            return numbersEmojis[square.value - 1];
          }
          return "⬛";
        }
        if (square.state.flagged) {
          return "🚩";
        }
        return "⬜";
      });
    const resultingMessage = `${message ?? ""}\n ${board.join(" ")}`;

    console.log(resultingMessage);
    return resultingMessage
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private isRevealedNumberSquare(
    square: Square
  ): square is Square & { value: number } {
    return typeof square.value === "number" && square.state.revealed;
  }

  private buildConstraints(squares: Squares): SolverConstraint[] {
    const constraints: SolverConstraint[] = [];
    for (const square of squares.flat()) {
      if (!this.isRevealedNumberSquare(square)) {
        continue;
      }

      const flaggedCount = this.flagsAroundSquare(square, squares).length;
      const mineCount = square.value - flaggedCount;
      const unknowns = new Set<PositionKey>();

      for (const pos of this.nonRevealedSquaresAround(square, squares)) {
        if (!squares[pos.row][pos.col].state.flagged) {
          unknowns.add(posKey(pos));
        }
      }

      if (unknowns.size > 0) {
        constraints.push({ unknowns, mineCount });
      }
    }
    return constraints;
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: solver algorithm is inherently complex
  private deduceFromConstraints(constraints: SolverConstraint[]): {
    mines: Set<PositionKey>;
    safe: Set<PositionKey>;
  } {
    const mines = new Set<PositionKey>();
    const safe = new Set<PositionKey>();

    // Simple deductions: single-constraint analysis
    for (const c of constraints) {
      if (c.mineCount === 0) {
        for (const u of c.unknowns) {
          safe.add(u);
        }
      } else if (c.mineCount === c.unknowns.size) {
        for (const u of c.unknowns) {
          mines.add(u);
        }
      }
    }

    // Subset analysis: compare constraint pairs for overlapping unknowns
    for (let i = 0; i < constraints.length; i++) {
      const a = constraints[i];
      for (let j = 0; j < constraints.length; j++) {
        if (i === j) {
          continue;
        }
        const b = constraints[j];
        if (a.unknowns.size > b.unknowns.size) {
          continue;
        }

        // Check if a.unknowns ⊆ b.unknowns
        let isSubset = true;
        for (const u of a.unknowns) {
          if (!b.unknowns.has(u)) {
            isSubset = false;
            break;
          }
        }
        if (!isSubset) {
          continue;
        }

        const diffMines = b.mineCount - a.mineCount;
        const diffUnknowns = [...b.unknowns].filter((u) => !a.unknowns.has(u));

        if (diffMines === 0 && diffUnknowns.length > 0) {
          for (const u of diffUnknowns) {
            safe.add(u);
          }
        } else if (
          diffMines === diffUnknowns.length &&
          diffUnknowns.length > 0
        ) {
          for (const u of diffUnknowns) {
            mines.add(u);
          }
        }
      }
    }

    return { mines, safe };
  }

  private getGuaranteedNonMines(
    possibleNonMines: SquarePosition[],
    squares: Squares
  ): SquarePosition[] {
    const nonMines: SquarePosition[] = [];

    for (const assumedMine of possibleNonMines) {
      const valuesIfMine = new Map<PositionKey, 0 | 1>().set(
        posKey(assumedMine),
        1
      );
      const checkedSurroundingSquares = new Set<PositionKey>();

      const getSurroundingValues = (unrevealedSquare: Square) =>
        // biome-ignore lint/suspicious/useIterableCallbackReturn: filter intentionally returns undefined for non-matches
        unrevealedSquare.surroundings.filter(({ row, col }) => {
          const square = squares[row][col];
          if (
            this.isRevealedNumberSquare(square) &&
            square.value > 0 &&
            !checkedSurroundingSquares.has(posKey(square.position))
          ) {
            checkedSurroundingSquares.add(posKey(square.position));
            return true;
          }
        });

      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: solver algorithm is inherently complex
      const checkSurroundingValues = (unrevealedSquare: Square) => {
        const surroundingValues = getSurroundingValues(unrevealedSquare);
        if (!surroundingValues.length) {
          return;
        }
        for (const { row, col } of surroundingValues) {
          const surroundingSquare = squares[row][col] as Square & {
            value: number;
          };

          const surroundingUnrevealedSquares = this.nonRevealedSquaresAround(
            surroundingSquare,
            squares
          );

          const flagsAroundSurroundingSquare = this.flagsAroundSquare(
            surroundingSquare,
            squares
          );

          if (flagsAroundSurroundingSquare.length) {
            for (const position of flagsAroundSurroundingSquare) {
              if (!valuesIfMine.has(posKey(position))) {
                valuesIfMine.set(posKey(position), 1);
              }
            }
          }

          const { maybeMinesAround, unknownSurroundingUnrevealedSquares } =
            surroundingUnrevealedSquares.reduce(
              (acc, position) => {
                if (valuesIfMine.has(posKey(position))) {
                  Object.assign(
                    acc,
                    valuesIfMine.get(posKey(position)) === 1
                      ? {
                          maybeMinesAround: acc.maybeMinesAround + 1,
                        }
                      : {
                          maybeNonMinesAround: acc.maybeNonMinesAround + 1,
                        }
                  );
                }
                acc.unknownSurroundingUnrevealedSquares.push(position);

                return acc;
              },
              {
                maybeMinesAround: 0,
                maybeNonMinesAround: 0,
                unknownSurroundingUnrevealedSquares: [] as SquarePosition[],
              }
            );

          const isImpossibleMine =
            maybeMinesAround > surroundingSquare.value ||
            maybeMinesAround + unknownSurroundingUnrevealedSquares.length <
              surroundingSquare.value;

          const hasPossibleMines =
            maybeMinesAround + unknownSurroundingUnrevealedSquares.length ===
            surroundingSquare.value;

          const hasPossibleNonMines =
            maybeMinesAround === surroundingSquare.value;

          if (isImpossibleMine) {
            nonMines.push(assumedMine);
          } else if (hasPossibleNonMines) {
            for (const unknownSquare of unknownSurroundingUnrevealedSquares) {
              if (!valuesIfMine.has(posKey(unknownSquare))) {
                valuesIfMine.set(posKey(unknownSquare), 0);
              }
            }
          } else if (hasPossibleMines) {
            for (const unknownSquare of unknownSurroundingUnrevealedSquares) {
              if (!valuesIfMine.has(posKey(unknownSquare))) {
                valuesIfMine.set(posKey(unknownSquare), 1);
              }
            }
          }
        }
        const lastCheckedSquare = surroundingValues.pop() ?? {
          row: 0,
          col: 0,
        };

        checkSurroundingValues(
          squares[lastCheckedSquare.row][lastCheckedSquare.col]
        );
      };

      checkSurroundingValues(squares[assumedMine.row][assumedMine.col]);
    }

    return [...new Set(nonMines)];
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: solver algorithm is inherently complex
  // biome-ignore lint/style/useConsistentMemberAccessibility: public method is part of class API
  public isBoardSolvable(squares: Squares): boolean {
    const squaresClone = structuredClone(squares);

    Minesweeper.prettyPrintBoard(squaresClone, "initial");
    // biome-ignore lint/suspicious/noUnusedExpressions: dev-only performance timing
    import.meta.env.DEV && console.time("isBoardSolvable");

    let progress = true;
    while (progress) {
      progress = false;

      // Phase 1: Constraint-based deduction (simple + subset analysis)
      const constraints = this.buildConstraints(squaresClone);
      const { mines, safe } = this.deduceFromConstraints(constraints);

      if (mines.size > 0 || safe.size > 0) {
        progress = true;

        for (const key of mines) {
          const pos = parsePosKey(key);
          this.toggleSquareFlag(pos, squaresClone);
        }

        for (const key of safe) {
          const pos = parsePosKey(key);
          this.revealSquare(pos, squaresClone);
          Minesweeper.prettyPrintBoard(
            squaresClone,
            `clicked ${JSON.stringify(pos)}`
          );
        }
      }

      // Phase 2: Trial-based reasoning for remaining unknowns
      if (!progress) {
        const remainingConstraints = this.buildConstraints(squaresClone);
        const allUnknowns = new Set<PositionKey>();
        for (const c of remainingConstraints) {
          for (const u of c.unknowns) {
            allUnknowns.add(u);
          }
        }

        const trialNonMines = this.getGuaranteedNonMines(
          [...allUnknowns].map(parsePosKey),
          squaresClone
        );

        if (trialNonMines.length) {
          progress = true;
          for (const pos of trialNonMines) {
            this.revealSquare(pos, squaresClone);
            Minesweeper.prettyPrintBoard(
              squaresClone,
              `clicked ${JSON.stringify(pos)}`
            );
          }
        }
      }
    }

    // biome-ignore lint/suspicious/noUnusedExpressions: dev-only performance timing
    import.meta.env.DEV && console.timeEnd("isBoardSolvable");
    Minesweeper.prettyPrintBoard(squaresClone, "final");

    return this.isGameWon(squaresClone);
  }

  // biome-ignore lint/style/useConsistentMemberAccessibility: public method is part of class API
  public handleAction(
    button: MouseButton,
    clickedCoords: SquarePosition
  ): this | false {
    const { row, col } = clickedCoords;
    const clickedSquare = this.squares[row][col];
    if (!clickedSquare) {
      throw new Error("Clicked square is not on the board");
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

  // biome-ignore lint/style/useConsistentMemberAccessibility: public getter is part of class API
  public get board(): BoardState {
    return {
      squares: this.squares,
      flagsLeft: this.flagsLeft,
      config: this.config,
    };
  }

  // biome-ignore lint/style/useConsistentMemberAccessibility: public getter is part of class API
  public get state(): GameState {
    return this.gameState;
  }

  // biome-ignore lint/style/useConsistentMemberAccessibility: public method is part of class API
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
