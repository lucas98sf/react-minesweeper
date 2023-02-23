import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { VitePluginFonts } from 'vite-plugin-fonts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    VitePluginFonts({
      custom: {
        families: [
          {
            name: 'MineSweeper',
            local: 'MineSweeper',
            src: './src/assets/fonts/*.ttf',
          },
        ],
        display: 'auto',
      },
    }),
  ],
  base: '/react-minesweeper/',
});
