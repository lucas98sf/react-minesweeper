import "unfonts.css";
import "./app.css";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { type Session, createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Board } from "~/components";

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
	{
		auth: {
			debug: true,
		},
	},
);

function App() {
	const [session, setSession] = useState<Session | null>(null);

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
						{session?.user?.identities?.[0]?.provider === "google" ? (
							<>
								<img
									src={session?.user?.identities[0].identity_data?.avatar_url}
									alt="Google"
									className="w-6 h-6 mr-2 rounded-full"
								/>
								{session?.user?.identities[0].identity_data?.name}
							</>
						) : (
							session?.user.email
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
			<Board />
		</Container>
	);
}

export default App;
