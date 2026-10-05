import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: { host: true, port: 5173 },
  test: {
    exclude: ["e2e/**", "e2e-backend/**", "node_modules/**", "dist/**"],
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("@react-three") ||
            id.includes("/three/") ||
            id.includes("\\three\\")
          ) {
            return "three";
          }
          if (id.includes("@antv/")) return "graph";
          if (id.includes("katex") || id.includes("react-katex")) return "math";
          if (id.includes("framer-motion")) return "framer";
          if (id.includes("/gsap/") || id.includes("\\gsap\\")) return "gsap";
          if (id.includes("/react/") || id.includes("react-dom")) return "react";
          return undefined;
        },
      },
    },
  },
});
