/*
 * Optional, consent-first GA4 instrumentation for the MathMaMath public site.
 * Works on both the SPA and the generated, JavaScript-readable lesson pages.
 * Nothing is sent to Google until the visitor actively opts in.
 */
(() => {
  "use strict";

  const source = document.currentScript;
  const measurementId = source?.getAttribute("data-measurement-id") ?? "";
  if (!/^G-[A-Z0-9]{6,16}$/.test(measurementId)) return;

  const consentKey = "mathmamath-analytics-consent-v1";
  const lessonIds = new Set(
    (source?.getAttribute("data-topic-ids") ?? "")
      .split(",")
      .filter((value) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(value)),
  );

  function readConsent() {
    try {
      const stored = localStorage.getItem(consentKey);
      return stored === "accepted" || stored === "declined" ? stored : null;
    } catch {
      return null;
    }
  }

  function saveConsent(choice) {
    try {
      localStorage.setItem(consentKey, choice);
    } catch {
      // Private browsing may disallow persistent storage.
    }
  }

  // Never report location.search, arbitrary hashes, reset/verify tokens or
  // account pages. Only known, published lesson IDs are eligible for a
  // virtual lesson view in the existing hash-router SPA.
  function safePagePath() {
    const path = window.location.pathname;
    if (path !== "/") {
      if (path === "/learn/" || /^\/(?:learn|subjects)\/[a-z0-9][a-z0-9-]{0,79}\/?$/.test(path)) {
        return path.endsWith("/") ? path : path + "/";
      }
      return null;
    }
    // An arbitrary or malformed fragment is not the homepage. It may contain
    // a one-time auth token or private value, so never infer a pageview from it.
    if (window.location.hash === "" || window.location.hash === "#home") return "/";
    const match = /^#([a-z0-9][a-z0-9-]{0,79})(?:\/block\/\d+)?$/.exec(window.location.hash);
    if (!match) return null;
    const route = match[1];
    if (lessonIds.has(route)) return "/learn/" + route + "/";
    if (route === "map" || route === "academy" || route === "review" || route === "marks") {
      return "/app/" + route + "/";
    }
    return null;
  }

  let initialized = false;
  let lastPage = null;
  let consent = readConsent();

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function trackPageView() {
    if (!initialized || consent !== "accepted") return;
    const path = safePagePath();
    if (!path) {
      // Returning to a previously viewed lesson after an untracked page is
      // a new visit; do not retain an old deduplication marker.
      lastPage = null;
      return;
    }
    if (path === lastPage) return;
    lastPage = path;
    gtag("event", "page_view", {
      page_location: window.location.origin + path,
      page_path: path,
      // React updates the SPA document.title asynchronously after hashchange.
      // The safe canonical route gives a stable, accurate title immediately.
      page_title: window.location.pathname === "/" ? path + " | MathMaMath" : document.title,
    });
  }

  function startAnalytics() {
    if (initialized || consent !== "accepted") return;
    initialized = true;
    window.dataLayer = window.dataLayer || [];
    gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    // The stream owner must also disable Enhanced Measurement's
    // "Page changes based on browser history events" to avoid duplicate
    // pageviews that can bypass safePagePath() on SPA navigation.
    gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
    trackPageView();
  }

  const controls = document.createElement("div");
  controls.className = "mathmamath-analytics-controls";

  const manage = document.createElement("button");
  manage.type = "button";
  manage.className = "mathmamath-analytics-manage";
  manage.textContent = "Конфиденциальность";
  manage.setAttribute("aria-label", "Настройки аналитики и согласия");
  controls.appendChild(manage);

  const panel = document.createElement("section");
  panel.className = "mathmamath-analytics-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Выбор аналитики сайта");
  panel.hidden = true;

  const title = document.createElement("strong");
  title.textContent = "Аналитика MathMaMath";
  panel.appendChild(title);

  const description = document.createElement("p");
  description.textContent =
    "С разрешения мы используем Google Analytics 4, чтобы понимать, какие страницы посещают. " +
    "До согласия Google Analytics не загружается. Вы можете отказаться или изменить выбор.";
  panel.appendChild(description);

  const policy = document.createElement("a");
  policy.href = "https://policies.google.com/technologies/partner-sites";
  policy.target = "_blank";
  policy.rel = "noopener noreferrer";
  policy.textContent = "Как Google обрабатывает данные";
  panel.appendChild(policy);

  const actions = document.createElement("div");
  actions.className = "mathmamath-analytics-actions";
  const decline = document.createElement("button");
  decline.type = "button";
  decline.textContent = "Отказаться";
  const accept = document.createElement("button");
  accept.type = "button";
  accept.className = "mathmamath-analytics-accept";
  accept.textContent = "Разрешить аналитику";
  actions.appendChild(decline);
  actions.appendChild(accept);
  panel.appendChild(actions);
  controls.appendChild(panel);

  function openChoices() {
    panel.hidden = false;
    accept.focus();
  }
  manage.addEventListener("click", () => {
    panel.hidden ? openChoices() : (panel.hidden = true);
  });
  accept.addEventListener("click", () => {
    consent = "accepted";
    saveConsent(consent);
    panel.hidden = true;
    startAnalytics();
  });
  decline.addEventListener("click", () => {
    const wasActive = initialized;
    consent = "declined";
    saveConsent(consent);
    panel.hidden = true;
    if (wasActive) {
      gtag("consent", "update", { analytics_storage: "denied" });
      // Remove the already-loaded Google tag by reloading in declined mode.
      window.location.reload();
    }
  });
  document.body.appendChild(controls);

  window.addEventListener("hashchange", trackPageView);
  if (consent === "accepted") startAnalytics();
  if (consent === null) openChoices();
})();
