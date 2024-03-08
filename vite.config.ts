import path from "node:path";
import react from "@vitejs/plugin-react";
import Unfonts from "unplugin-fonts/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		Unfonts({
			custom: {
				families: [
					{
						name: "MineSweeper",
						local: "MineSweeper",
						src: "./src/assets/fonts/*.ttf",
					},
				],
				display: "auto",
			},
		}),
	],
	base: "/react-minesweeper/",
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
});
