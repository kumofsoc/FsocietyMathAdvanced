import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@/styles.css";
import "@/styles/platform.css";
import "@/styles/typography.css";
import "@/styles/readability.css";
import "@/styles/theme-compat.css";
import App from "@/app/App";
import { AppErrorBoundary } from "@/shared/ui/AppErrorBoundary";
import { getRuntimeConfigWarnings } from "@/shared/config/runtime";
import { installGlobalRuntimeErrorReporting } from "@/shared/observability/runtimeErrors";

installGlobalRuntimeErrorReporting();

for (const warning of getRuntimeConfigWarnings()) {
  console.warn("[MathMaMath] runtime config:", warning);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
