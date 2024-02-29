import { authenticator, supabaseStrategy } from "@/auth.server";
import { ActionFunction, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
	// If token refresh and successRedirect not set, reload the current route
	const session = await supabaseStrategy.checkSession(request);

	if (!session) {
		// If the user is not authenticated, you can do something or nothing
		// ⚠️ If you do nothing, /profile page is display
	}
};

// Handle logout action
export const action: ActionFunction = async ({ request }) => {
	await authenticator.logout(request, { redirectTo: "/login" });
};
