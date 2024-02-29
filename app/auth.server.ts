import { Session, supabaseClient } from "@/lib/supabase";
import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import { SupabaseStrategy } from "remix-auth-supabase";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "sb",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [process.env.SECRET], // This should be an env variable
		secure: process.env.NODE_ENV === "production",
	},
});

export const supabaseStrategy = new SupabaseStrategy(
	{
		supabaseClient,
		sessionStorage,
		sessionKey: "sb:session", // if not set, default is sb:session
		sessionErrorKey: "sb:error", // if not set, default is sb:error
	},
	// simple verify example for email/password auth
	async ({ req, supabaseClient }) => {
		const form = await req.formData();
		const email = form?.get("email");
		const password = form?.get("password");

		if (!email) throw new AuthorizationError("Email is required");
		if (typeof email !== "string")
			throw new AuthorizationError("Email must be a string");

		if (!password) throw new AuthorizationError("Password is required");
		if (typeof password !== "string")
			throw new AuthorizationError("Password must be a string");

		return supabaseClient.auth
			.signInWithPassword({ email, password })
			.then(({ data, error }): Session => {
				if (error || !data || data.weakPassword) {
					throw new AuthorizationError(
						error?.message ?? "No user session found",
					);
				}

				return data.session;
			});
	},
);

export const authenticator = new Authenticator(sessionStorage, {
	sessionKey: supabaseStrategy.sessionKey, // keep in sync
	sessionErrorKey: supabaseStrategy.sessionErrorKey, // keep in sync
});

// biome-ignore lint/suspicious/noExplicitAny: This is a Remix type error
authenticator.use(supabaseStrategy as any);
