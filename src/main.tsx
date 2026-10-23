import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@/styles.css";
import "@/styles/platform.css";
import "@/styles/typography.css";
import "@/styles/readability.css";
import "@/styles/theme-compat.css";
import "@/styles/mobile-adaptive.css";
import App from "@/app/App";
import { topicListMeta } from "@/data/courseMeta";
import { AppErrorBoundary } from "@/shared/ui/AppErrorBoundary";
import { getRuntimeConfigWarnings } from "@/shared/config/runtime";
import { installGlobalRuntimeErrorReporting } from "@/shared/observability/runtimeErrors";

// The first-party consent loader is present in index.html even when Vercel
// skips post-build scripts. Give it the published topic allowlist for safe
// virtual page views; never send arbitrary hash fragments to GA4.
const analyticsLoader = document.querySelector<HTMLScriptElement>('script[src="/analytics.js"]');
if (analyticsLoader) {
  analyticsLoader.dataset.topicIds = topicListMeta
    .filter((topic) => !topic.isStub)
    .map((topic) => topic.id)
    .join(",");
  window.dispatchEvent(new Event("mathmamath:analytics-topics-ready"));
}

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
