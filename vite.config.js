import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, __dirname) };

  return {
    root: "./viewer/",
    base: "./",
    publicDir: "../scripts/backlog/dist/assets",
    build: {
      sourcemap: true,
      outDir: "../dist",
      emptyOutDir: true,
      copyPublicDir: true,
      rollupOptions: {
        input: "./viewer/index.html"
      }
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy", "classProperties"],
          },
        },
      }),
    ],
  };
});
