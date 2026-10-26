import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  // In development the browser talks to this dev server and /api is forwarded to the Laravel API,
  // so there is no cross-origin traffic and the page works from a phone on the same Wi-Fi.
  const apiTarget = env.VITE_API_PROXY ?? "http://127.0.0.1:3002";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // reachable from phones on the local network
      port: 5173,
      proxy: { "/api": { target: apiTarget, changeOrigin: false } },
    },
  };
});
