import "unfonts.css";
import "./app.css";

import type { RealtimePresenceState, Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { Board } from "~/components";
import { AuthForm } from "~/components/AuthForm";
import { useTimer } from "~/hooks";
import { supabase } from "~/lib/supabase";

function Container({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <div className="flex flex-col items-center">
      {session?.user && (
        <div className="fixed top-0 left-0 m-2 flex flex-row rounded-md bg-black p-2 text-white">
          {session.user.identities?.[0]?.provider === "google" ? (
            <>
              {/* biome-ignore lint/correctness/useImageSize: avatar URL with CSS sizing */}
              <img
                alt="Google"
                className="mr-2 h-6 w-6 rounded-full"
                src={session.user.identities[0].identity_data?.avatar_url}
              />
              {session.user.identities[0].identity_data?.email}
            </>
          ) : (
            session.user.email
          )}
        </div>
      )}
      <button
        className="fixed top-0 right-0 m-2 rounded-md bg-black p-2 text-white"
        onClick={async () => {
          await supabase.auth.signOut({ scope: "local" });
        }}
        type="button"
      >
        Sign Out
      </button>
      {children}
    </div>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userState, setUserState] = useState<RealtimePresenceState>({});

  const countdownId = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [countdownStarted, setCountdownStarted] = useState<boolean>(false);

  const { resetTimer, startTimer, stopTimer, timeElapsed } = useTimer();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    if (gameOver) {
      stopTimer();
    }
    if (gameStarted && timeElapsed === "000") {
      startTimer();
    }
  }, [gameOver, gameStarted, startTimer, stopTimer, timeElapsed]);

  useEffect(() => {
    if (countdownStarted && countdown === 0) {
      setCountdownStarted(false);
      setGameStarted(true);
    }
  }, [countdownStarted, countdown]);

  useEffect(() => {
    if (countdownStarted && countdown > 0) {
      countdownId.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (countdownId.current) {
        clearInterval(countdownId.current);
      }
    };
  }, [countdownStarted, countdown]);

  useEffect(() => {
    if (!session?.user?.email) {
      return;
    }
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: session?.user?.email,
        },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const presentState = channel.presenceState();
      setUserState({ ...presentState });
    });

    // channel.on("presence", { event: "join" }, ({ newPresences }) => {
    // 	console.log("New users have joined: ", newPresences);
    // });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_name: session?.user?.email,
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) {
      return;
    }
    const channel = supabase.channel("boards");

    channel.on("broadcast", { event: "over" }, ({ payload }) => {
      if (
        payload.gameState.result === "lose" &&
        Object.keys(userState).length - 1 <= 1
      ) {
        setGameOver(true);
        // biome-ignore lint/suspicious/noAlert: game over notification
        alert(
          payload.userEmail === session?.user.email ? "You lost!" : "You won!"
        );
      }
      if (payload.gameState.result === "win") {
        setGameOver(true);
        // biome-ignore lint/suspicious/noAlert: game over notification
        alert(
          payload.userEmail === session?.user.email ? "You won!" : "You lost!"
        );
      }
    });

    channel.on("broadcast", { event: "countdown" }, () => {
      setCountdownStarted(true);
    });

    channel.on("broadcast", { event: "reset" }, () => {
      setGameStarted(false);
      setGameOver(false);
      setCountdownStarted(false);
      setCountdown(3);
      resetTimer();
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.email, userState, resetTimer]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="mt-4 flex flex-col md:flex-row">
        <Board />
        <div className="p-10">
          <div className="board">
            <p>Play Online</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  let gameStateDisplay: React.ReactNode;
  if (gameStarted) {
    gameStateDisplay = (
      <div className="board">
        <p>{timeElapsed}</p>
      </div>
    );
  } else if (countdownStarted) {
    gameStateDisplay = (
      <div className="board">
        <p>{countdown}</p>
      </div>
    );
  } else {
    gameStateDisplay = (
      <button
        className="m-2 rounded-md bg-black p-2 text-white"
        onClick={async () => {
          await supabase.channel("boards").send({
            type: "broadcast",
            event: "countdown",
            payload: {},
          });
        }}
        type="button"
      >
        Start
      </button>
    );
  }

  return (
    <Container session={session}>
      {gameOver && (
        <button
          className="m-2 rounded-md bg-black p-2 text-white"
          onClick={async () => {
            await supabase.channel("boards").send({
              type: "broadcast",
              event: "reset",
              payload: {},
            });
          }}
          type="button"
        >
          Restart
        </button>
      )}
      {gameStateDisplay}
      <div className="my-6 flex flex-col gap-2 md:flex-row">
        {Object.keys(userState).map((email) => (
          <div key={email}>
            {
              <div className="m-2 flex flex-row items-center rounded-md bg-black p-2 text-white">
                <div className={"mr-1 text-green-500 text-lg"}>●</div>
                {email}
              </div>
            }
            <Board
              locked={!gameStarted || gameOver}
              session={session}
              userEmail={email}
            />
          </div>
        ))}
      </div>
    </Container>
  );
}

export default App;
