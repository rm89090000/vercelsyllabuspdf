import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",         // project root (where index.html lives)
  build: {
    outDir: "dist",  // production build output
    emptyOutDir: true,
  },
  server: {
    port: 5173,      // optional, local dev port
  },
});
