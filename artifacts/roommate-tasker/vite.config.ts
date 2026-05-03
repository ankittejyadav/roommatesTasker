import { defineConfig, Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "fs";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

const basePath = process.env.BASE_PATH ?? "/";

function firebaseSwPlugin(): Plugin {
  const swTemplatePath = path.resolve(
    import.meta.dirname,
    "src/firebase-messaging-sw.template.js",
  );

  return {
    name: "firebase-sw-inject",
    configResolved() {
      function getEnv(key: string): string {
        const raw = process.env[key] ?? "";
        const eqIdx = raw.indexOf("=");
        return eqIdx !== -1 ? raw.slice(eqIdx + 1) : raw;
      }
      const template = fs.readFileSync(swTemplatePath, "utf-8");
      const filled = template
        .replace("__VITE_FIREBASE_API_KEY__", getEnv("VITE_FIREBASE_API_KEY"))
        .replace("__VITE_FIREBASE_AUTH_DOMAIN__", getEnv("VITE_FIREBASE_AUTH_DOMAIN"))
        .replace("__VITE_FIREBASE_PROJECT_ID__", getEnv("VITE_FIREBASE_PROJECT_ID"))
        .replace("__VITE_FIREBASE_STORAGE_BUCKET__", getEnv("VITE_FIREBASE_STORAGE_BUCKET"))
        .replace("__VITE_FIREBASE_MESSAGING_SENDER_ID__", getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"))
        .replace("__VITE_FIREBASE_APP_ID__", getEnv("VITE_FIREBASE_APP_ID"));

      const outDir = path.resolve(import.meta.dirname, "public");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "firebase-messaging-sw.js"), filled, "utf-8");
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    firebaseSwPlugin(),
    svelte(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },

  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
