import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
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
        name: "Horse Care",
        short_name: "HorseCare",
        theme_color: "#2c4b29",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/logo-equilife.png",
            sizes: "any",
            type: "image/png",
          },
          {
            src: "/logo-equilife.png",
            sizes: "any",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@@": fileURLToPath(new URL("../", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    allowedHosts: ["dave-bushier-tobias.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      "/uploads": {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  };
});
