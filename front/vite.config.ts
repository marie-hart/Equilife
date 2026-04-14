import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import vuetify from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = env.VITE_API_BASE_URL || "/api";
  const inferredTarget = baseUrl.startsWith("http")
    ? new URL(baseUrl).origin
    : "http://localhost:3000";
  const proxyTarget = env.VITE_API_PROXY_TARGET || inferredTarget;

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      VitePWA({
        registerType: "autoUpdate",
        strategies: "injectManifest",
        srcDir: "src/pwa",
        filename: "sw.ts",
        injectRegister: "auto",
        manifest: {
          name: "Equilife",
          short_name: "Equilife",
          theme_color: "#2c4b29",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
            { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "maskable any" },
          ],
        },
        includeAssets: ["apple-touch-icon.png"],
        devOptions: { enabled: true, type: "module" },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@@": fileURLToPath(new URL("./", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      allowedHosts: ["dave-bushier-tobias.ngrok-free.dev"],
      https: {
        key: fs.readFileSync("./localhost+1-key.pem"),
        cert: fs.readFileSync("./localhost+1.pem"),
      },
      proxy: {
        "/api": { target: "http://localhost:3001", changeOrigin: true, secure: false },
        "/uploads": { target: "http://localhost:3001", changeOrigin: true },
      },
      host: true,
      hmr: mode === "development"
        ? { protocol: "wss", port: 5173 }
        : undefined,
    },
  };
});
