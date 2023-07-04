import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, __dirname) };

  return {
    root: "./viewer/",
    publicDir: "../scripts/backlog/dist",
    server: {
      hmr: {
        protocol: "ws",
      },
    },
    build: {
      sourcemap: true,
      outDir: "../dist/",
      copyPublicDir: true,
    },
    plugins: [
      nodePolyfills(),
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
      splitVendorChunkPlugin(),
    ],
  };
});
