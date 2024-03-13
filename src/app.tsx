import "unfonts.css";
import "./app.css";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import {
	RealtimePresenceState,
	type Session,
	createClient,
} from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { Board } from "~/components";
import { useTimer } from "~/hooks";

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function Container({
	children,
	session,
}: { children: React.ReactNode; session: Session }) {
	return (
		<div className="flex items-center flex-col">
			{session?.user && (
				<div className="fixed top-0 left-0 p-2 m-2 bg-black text-white rounded-md flex flex-row">
					{session.user.identities?.[0]?.provider === "google" ? (
						<>
							<img
								src={session.user.identities[0].identity_data?.avatar_url}
								alt="Google"
								className="w-6 h-6 mr-2 rounded-full"
							/>
							{session.user.identities[0].identity_data?.email}
						</>
					) : (
						session.user.email
					)}
				</div>
			)}
			<button
				type="button"
				className="right-0 top-0 fixed p-2 m-2 bg-black text-white rounded-md"
				onClick={async () => {
					await supabase.auth.signOut({ scope: "local" });
				}}
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
		if (!session?.user?.email) return;
		const channel = supabase.channel("online-users", {
			config: {
				presence: {
					key: session?.user?.email,
				},
			},
		});

		channel.on("presence", { event: "sync" }, () => {
			const presentState = channel.presenceState();
			console.log("inside presence: ", presentState);

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
		if (!session?.user?.email) return;
		const channel = supabase.channel("boards");

		channel.on("broadcast", { event: "over" }, ({ payload }) => {
			if (
				payload.gameState.result === "lose" &&
				Object.keys(userState).length - 1 <= 1
			) {
				setGameOver(true);
				alert(
					payload.userEmail === session?.user.email ? "You lost!" : "You won!",
				);
			}
			if (payload.gameState.result === "win") {
				setGameOver(true);
				alert(
					payload.userEmail === session?.user.email ? "You won!" : "You lost!",
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
			<Auth
				supabaseClient={supabase}
				appearance={{
					theme: ThemeSupa,
					style: {
						container: {
							minWidth: "400px",
						},
					},
				}}
				redirectTo={window.location.origin + import.meta.env.BASE_URL}
				providers={["google"]}
			/>
		);
	}

	return (
		<Container session={session}>
			<SessionContextProvider supabaseClient={supabase}>
				{gameOver && (
					<button
						type="button"
						className="p-2 m-2 bg-black text-white rounded-md"
						onClick={async () => {
							await supabase.channel("boards").send({
								type: "broadcast",
								event: "reset",
								payload: {},
							});
						}}
					>
						Restart
					</button>
				)}
				{!gameStarted ? (
					countdownStarted ? (
						<div className="board">
							<p>{countdown}</p>
						</div>
					) : (
						<button
							type="button"
							className="p-2 m-2 bg-black text-white rounded-md"
							onClick={async () => {
								await supabase.channel("boards").send({
									type: "broadcast",
									event: "countdown",
									payload: {},
								});
							}}
						>
							Start
						</button>
					)
				) : (
					<div className="board">
						<p>{timeElapsed}</p>
					</div>
				)}
				<div className="flex flex-row">
					{Object.keys(userState).map((email) => {
						return (
							<div key={email}>
								{
									<div className="p-2 m-2 bg-black text-white rounded-md flex flex-row items-center">
										<div className={"text-green-500 mr-1 text-lg"}>●</div>
										{email}
									</div>
								}
								<Board userEmail={email} locked={!gameStarted || gameOver} />
							</div>
						);
					})}
				</div>
			</SessionContextProvider>
		</Container>
	);
}

export default App;
