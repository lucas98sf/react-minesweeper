import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) {
	throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_KEY) {
	throw new Error("SUPABASE_KEY is required");
}

// Supabase options example (build your own :))
// https://supabase.com/docs/reference/javascript/initializing#with-additional-parameters

// const supabaseOptions = {
//   fetch, // see ⚠️ cloudflare
//   schema: "public",
//   persistSession: true,
//   autoRefreshToken: true,
//   detectSessionInUrl: true,
//   headers: { "x-application-name": "{my-site-name}" }
// };

// ⚠️ cloudflare needs you define fetch option : https://github.com/supabase/supabase-js#custom-fetch-implementation
// Use Remix fetch polyfill for node (See https://remix.run/other-api/node)

export const supabaseClient = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY,
	// supabaseOptions
);

export { Session };
