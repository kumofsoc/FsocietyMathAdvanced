import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
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
          if (id.includes("@xyflow")) return "graph";
          if (id.includes("katex") || id.includes("react-katex")) return "math";
          if (id.includes("framer-motion") || id.includes("/gsap/")) return "motion";
          if (id.includes("/react/") || id.includes("react-dom")) return "react";
          return undefined;
        },
      },
    },
  },
});
