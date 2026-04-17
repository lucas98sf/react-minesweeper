// biome-ignore lint/style/useFilenamingConvention: React component naming convention
import { supabase } from "~/lib/supabase";

export const AuthForm = () => {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
  };

  return (
    <div style={{ minWidth: "300px" }}>
      <button
        className="m-2 rounded-md bg-black p-2 text-white"
        onClick={handleGoogleSignIn}
        type="button"
      >
        Sign in with Google
      </button>
    </div>
  );
};
