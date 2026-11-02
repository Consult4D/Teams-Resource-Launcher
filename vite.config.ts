import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Teams-Resource-Launcher/" : "/",
}));
