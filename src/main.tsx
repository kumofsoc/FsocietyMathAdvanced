import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@/styles.css";
import "@/styles/platform.css";
import "@/styles/readability.css";
import App from "@/app/App";
import { AppErrorBoundary } from "@/shared/ui/AppErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
