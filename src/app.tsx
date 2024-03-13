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
import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "~/components";
import { useTimer } from "~/hooks";

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function App() {
	const [session, setSession] = useState<Session | null>(null);
	const [userState, setUserState] = useState<RealtimePresenceState>({});

	const [gameOver, setGameOver] = useState<boolean>(false);
	const { resetTimer, startTimer, stopTimer, timeElapsed } = useTimer();

	const [countdownStarted, setCountdownStarted] = useState<boolean>(false);
	const countdownId = useRef<NodeJS.Timeout | null>(null);
	const [countdown, setCountdown] = useState<number>(5);
	const [gameStarted, setGameStarted] = useState<boolean>(false);

	// useEffect(() => {
	// 	if (gameOver) {
	// 		stopTimer();
	// 	}
	// 	if (gameStarted && timeElapsed === "000") {
	// 		startTimer();
	// 	}
	// }, [gameOver, gameStarted, startTimer, stopTimer, timeElapsed]);

	useEffect(() => {
		if (countdownStarted && countdown === 0) {
			setCountdownStarted(false);
			setGameStarted(true);
		}
	}, [countdown, countdownStarted]);

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
	}, [countdown, countdownStarted]);

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

	function Container({ children }: { children: React.ReactNode }) {
		return (
			<>
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
			</>
		);
	}

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
		<Container>
			{!gameStarted ? (
				countdownStarted ? (
					<>{countdown}</>
				) : (
					<button
						type="button"
						className="p-2 m-2 bg-black text-white rounded-md"
						onClick={() => setCountdownStarted(true)}
					>
						Start
					</button>
				)
			) : (
				<>{timeElapsed}</>
			)}
			<SessionContextProvider supabaseClient={supabase}>
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
								<Board userEmail={email} locked={!gameStarted} />
							</div>
						);
					})}
				</div>
			</SessionContextProvider>
		</Container>
	);
}

export default App;
