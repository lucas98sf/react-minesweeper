import path from "path";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import relay from "vite-plugin-relay";
import viteTsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [relay, remix(), viteTsconfigPaths()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./app"),
		},
	},
	// base: "/react-minesweeper/",
});
