// biome-ignore lint/style/useFilenamingConvention: React component naming convention
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
import {
  isSquarePosition,
  MouseButton,
  type SquarePosition,
  type Square as SquareType,
} from "~/core/types";
import { isTouchEvent, useLongPress, useMinesweeper } from "~/hooks";
import { supabase } from "~/lib/supabase";

import { Flag } from "./Flag";
import { Mine } from "./Mine";
import { Square } from "./Square";

interface BoardProps {
  locked?: boolean;
  session?: Session | null;
  userEmail?: string;
}

export const Board = ({ userEmail, locked, session }: BoardProps) => {
  const {
    boardState,
    gameState,
    timeElapsed,
    setBoardState,
    setGameState,
    touchToMouseClick,
    handleClick,
    reset,
  } = useMinesweeper({
    guessFree: true,
  });

  const isMultiplayer = !!userEmail;

  useEffect(() => {
    if (isMultiplayer) {
      const channel = supabase.channel(`boards:${userEmail}`);

      channel.on("broadcast", { event: "sync" }, ({ payload }) => {
        if (payload.userEmail !== session?.user.email) {
          setBoardState(payload.boardState);
          setGameState(payload.gameState);
        }
      });

      channel.subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [
    isMultiplayer,
    userEmail,
    setBoardState,
    setGameState,
    session?.user.email,
  ]);

  useEffect(() => {
    if (isMultiplayer && gameState.result) {
      supabase.channel("boards").send({
        type: "broadcast",
        event: "over",
        payload: {
          boardState,
          gameState,
          userEmail,
        },
      });
    }
  }, [gameState.result, userEmail, isMultiplayer, boardState, gameState]);

  useEffect(() => {
    if (isMultiplayer) {
      const boardsChannel = supabase.channel("boards");
      boardsChannel.on("broadcast", { event: "reset" }, reset);

      // boardsChannel.subscribe();

      // return () => {
      // 	boardsChannel.unsubscribe();
      // };
    }
  }, [isMultiplayer, reset]);

  const boardRef = useRef<HTMLDivElement>(null);

  const handleSquareAction = useLongPress<
    HTMLButtonElement & {
      dataset: DOMStringMap | SquarePosition;
    }
  >(
    {
      onLongPress: async (e) => {
        if (locked || (isMultiplayer && session?.user?.email !== userEmail)) {
          return;
        }
        if (!isTouchEvent(e)) {
          return;
        }
        if (isSquarePosition(e.currentTarget.dataset)) {
          // long press on mobile = normal click after the first move
          handleClick(MouseButton.left, e.currentTarget.dataset);

          if (isMultiplayer) {
            await supabase.channel(`boards:${userEmail}`).send({
              type: "broadcast",
              event: "sync",
              payload: {
                boardState,
                gameState,
                userEmail,
              },
            });
          }
        }
      },
      onClick: async (e) => {
        if (locked || (isMultiplayer && session?.user?.email !== userEmail)) {
          return;
        }
        if (isSquarePosition(e.currentTarget.dataset)) {
          const mouseButton: MouseButton = isTouchEvent(e)
            ? touchToMouseClick(gameState, boardState, e.currentTarget.dataset)
            : e.button;

          handleClick(mouseButton, e.currentTarget.dataset);

          if (isMultiplayer) {
            await supabase.channel(`boards:${userEmail}`).send({
              type: "broadcast",
              event: "sync",
              payload: {
                boardState,
                gameState,
                userEmail,
              },
            });
          }
        }
      },
    },
    {
      delay: 300,
      // shouldPreventDefault: true,
    }
  );

  const getContent = ({ state: { revealed, flagged }, value }: SquareType) => {
    if (flagged) {
      return <Flag />;
    }
    if (revealed && value) {
      return value === "mine" ? <Mine /> : value;
    }
    return null;
  };

  const resetBoard = async () => {
    reset();
    if (isMultiplayer) {
      await supabase.channel(`boards:${userEmail}`).send({
        type: "broadcast",
        event: "sync",
        payload: {
          boardState,
          gameState,
          userEmail,
        },
      });
    }
  };

  const squareNumberColors: Record<number, string> = {
    0: "",
    1: "text-indigo-700",
    2: "text-green-900",
    3: "text-red-700",
    4: "text-blue-900",
    5: "text-orange-900",
    6: "text-teal-900",
    7: "text-black",
    8: "text-gray-900",
  };

  return (
    <div className="board mx-auto w-fit bg-[grey] p-2 shadow-md" ref={boardRef}>
      <div className="flex justify-around p-2">
        <div className="flex flex-row">
          <div className="pt-2 pb-2">{boardState.flagsLeft}</div>
          <Flag />
        </div>
        {!isMultiplayer && (
          <>
            <Square
              boardRef={boardRef}
              className="square-unrevealed pb-2 pl-0"
              onClick={resetBoard}
            >
              {gameState.result === "win" && "😎"}
              {gameState.result === "lose" && "😵"}
              {!gameState.result && "🙂"}
            </Square>
            <div className="pt-2 pb-2">{timeElapsed}</div>
          </>
        )}
      </div>
      <div className="flex flex-col items-center">
        {boardState.squares.map((rows, row) => {
          const generatedRow = rows.map((_, col) => {
            const square: SquareType = boardState.squares[row][col];
            return (
              <Square
                boardRef={boardRef}
                className={
                  square.state.revealed &&
                  square.value !== null &&
                  square.value !== undefined
                    ? (squareNumberColors[square.value as number] ?? "mine")
                    : "square-unrevealed"
                }
                data-col={col}
                data-row={row}
                // biome-ignore lint/suspicious/noArrayIndexKey: grid positions are stable keys
                key={`${row}-${col}`}
                surroundings={square.surroundings}
                {...handleSquareAction}
              >
                {getContent(square)}
              </Square>
            );
          });
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: grid row index is a stable key
            <div className="flex flex-no-wrap flex-row" key={row}>
              {generatedRow}
            </div>
          );
        })}
      </div>
    </div>
  );
};
