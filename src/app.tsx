import "unfonts.css";
import "./app.css";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import {
	RealtimePresenceState,
	type Session,
	createClient,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Board } from "~/components";

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function App() {
	const [session, setSession] = useState<Session | null>(null);
	const [userState, setUserState] = useState<RealtimePresenceState>({});

	useEffect(() => {
		console.log("user: ", session?.user);

		const channel = supabase.channel("online-users", {
			config: {
				presence: {
					key: session?.user?.email ? session?.user?.email : "Unknown",
				},
			},
		});

		channel.on("presence", { event: "sync" }, () => {
			const presentState = channel.presenceState();

			console.log("inside presence: ", presentState);

			setUserState({ ...presentState });
		});

		channel.on("presence", { event: "join" }, ({ newPresences }) => {
			console.log("New users have joined: ", newPresences);
		});

		channel.subscribe(async (status) => {
			if (status === "SUBSCRIBED") {
				const status = await channel.track({
					user_name: session?.user?.email ? session?.user?.email : "Unknown",
				});
				console.log("status: ", status);
			}
		});
	}, [session?.user]);

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
				{Object.keys(userState).map((key) => {
					if (key === session?.user?.email || key === "Unknown") return null;
					return (
						<div
							key={key}
							className="fixed top-28 left-0 p-2 m-2 bg-black text-white rounded-md flex flex-row items-center"
						>
							<div className={"text-green-500 mr-1 text-lg"}>●</div>
							{key}
						</div>
					);
				})}
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
			<Board />
		</Container>
	);
}

export default App;
