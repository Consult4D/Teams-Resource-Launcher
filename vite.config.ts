import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  if (!env.VITE_ENGAGE_URL?.trim()) {
    throw new Error(
      "VITE_ENGAGE_URL is required. Set it in .env.local or the build environment.",
    );
  }

  return {
    base: command === "build" ? "/Teams-Resource-Launcher/" : "/",
  };
});
