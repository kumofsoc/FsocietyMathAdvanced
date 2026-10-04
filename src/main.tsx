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
import { validateRuntimeConfig } from "@/shared/config/runtime";
import { installGlobalErrorReporting } from "@/shared/observability/clientObservability";

installGlobalErrorReporting();

const runtimeIssues = validateRuntimeConfig();
runtimeIssues
  .filter((issue) => issue.level === "warning")
  .forEach((issue) => console.warn("[VisualMath config]", issue.message));

const rootElement = document.getElementById("root")!;
const configErrors = runtimeIssues.filter((issue) => issue.level === "error");

if (configErrors.length) {
  const main = document.createElement("main");
  main.className = "app-crash";
  const eyebrow = document.createElement("div");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "CONFIGURATION ERROR";
  const title = document.createElement("h1");
  title.textContent = "VisualMath не может запуститься.";
  const copy = document.createElement("p");
  copy.textContent = configErrors.map((issue) => issue.message).join(" ");
  main.append(eyebrow, title, copy);
  rootElement.replaceChildren(main);
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
}
