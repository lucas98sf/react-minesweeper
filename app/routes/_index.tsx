// import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Link, useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";

export async function loader() {
	return {
		env: {
			SUPABASE_URL: process.env.SUPABASE_URL,
			SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
		},
	};
}

function App() {
	const { env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(
		env.SUPABASE_URL,
		env.SUPABASE_ANON_KEY,
		{
			auth: {
				autoRefreshToken: true,
				detectSessionInUrl: false,
				persistSession: true,
			},
			cookies: {},
		},
	);

	return (
		<>
			<Button
				className="absolute top-0 right-0 m-5"
				onClick={(_) => supabase.auth.signOut()}
			>
				Sign Out
			</Button>
			<Link to="/signup">Sign Up</Link>
			<br />
			<Link to="/login">Login</Link>
			{/* <div className="flex columns-2">
				<Board playerId={nanoid()} roomId="1" />
				<Board playerId={nanoid()} roomId="1" />
			</div> */}
		</>
	);
}

export default App;
