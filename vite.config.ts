import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const LAZY_ONLY_CHUNK_PREFIXES = [
  "graph-",
  "three-",
  "gsap-",
  "math-",
  "courseSearchIndex-",
];

function initialChunkBoundaryPlugin() {
  return {
    name: "visualmath-initial-chunk-boundary",
    apply: "build" as const,
    generateBundle(
      _options: unknown,
      bundle: Record<
        string,
        {
          type: string;
          fileName: string;
          isEntry?: boolean;
          imports?: string[];
        }
      >,
    ) {
      const chunks = new Map(
        Object.values(bundle)
          .filter((item) => item.type === "chunk")
          .map((item) => [item.fileName, item]),
      );
      const initial = new Set<string>();
      const visit = (fileName: string) => {
        if (initial.has(fileName)) return;
        initial.add(fileName);
        for (const imported of chunks.get(fileName)?.imports ?? []) {
          visit(imported);
        }
      };

      for (const chunk of chunks.values()) {
        if (chunk.isEntry) visit(chunk.fileName);
      }

      const leaked = [...initial].filter((fileName) =>
        LAZY_ONLY_CHUNK_PREFIXES.some((prefix) => fileName.startsWith(prefix)),
      );
      if (leaked.length > 0) {
        throw new Error(
          "Heavy lazy-only chunks leaked into the initial graph: " +
            leaked.sort().join(", "),
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), initialChunkBoundaryPlugin()],
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
