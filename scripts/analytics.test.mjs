import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { DEFAULT_GA4_MEASUREMENT_ID, resolveGa4MeasurementId } from "./analytics-config.mjs";
import { DEFAULT_PUBLIC_ORIGIN, resolvePublicSiteOrigin } from "./public-site-origin.mjs";

const source = readFileSync(new URL("../public/analytics.js", import.meta.url), "utf8");

function browser({ saved = null, hash = "#matrices", pathname = "/", hostname = "mathmamath.vercel.app", configuredHost = "mathmamath.vercel.app", topicsReady = true } = {}) {
  const storage = new Map(saved ? [["mathmamath-analytics-consent-v1", saved]] : []);
  const events = new Map();
  const scripts = [];
  const elements = [];

  function element(tag) {
    const listeners = new Map();
    const node = {
      tagName: tag.toUpperCase(),
      children: [],
      hidden: false,
      appendChild(child) { this.children.push(child); },
      setAttribute(key, value) { this[key] = value; },
      addEventListener(name, handler) { listeners.set(name, handler); },
      trigger(name) { const fn = listeners.get(name); if (!fn) throw new Error("No handler: " + name); fn(); },
      focus() {},
    };
    elements.push(node);
    return node;
  }

  const location = { origin: "https://mathmamath.vercel.app", hostname, pathname, hash,
    reloadCalled: false, reload() { this.reloadCalled = true; },
  };
  let topicIds = topicsReady ? "matrices,rank,derivative" : "";
  const document = {
    title: "MathMaMath",
    currentScript: {
      getAttribute(key) {
        if (key === "data-measurement-id") return "G-TEST123456";
        if (key === "data-topic-ids") return topicIds;
        if (key === "data-production-host") return configuredHost;
        return null;
      },
    },
    createElement: element,
    head: { appendChild(node) { scripts.push(node); } },
    body: { appendChild(node) { elements.push(node); } },
  };
  const window = {
    location,
    addEventListener(name, handler) { events.set(name, handler); },
  };
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); },
  };
  runInNewContext(source, { document, window, localStorage, console, encodeURIComponent });

  const controls = elements.find((node) => node.className === "mathmamath-analytics-controls");
  if (hostname !== "mathmamath.vercel.app" &&
      (hostname.endsWith(".vercel.app") || hostname !== configuredHost)) {
    assert.equal(controls, undefined, "No consent/tracking UI on preview or unrelated host");
    return { scripts, events, window, location };
  }
  assert.ok(controls, "Privacy controls must exist");
  const [manage, panel] = controls.children;
  const actions = panel.children.find((node) => node.className === "mathmamath-analytics-actions");
  const [decline, accept] = actions.children;

  function pageviews() {
    return (window.dataLayer || [])
      .filter((args) => args[0] === "event" && args[1] === "page_view")
      .map((args) => args[2]);
  }

  return {
    storage, scripts, events, window, location, manage, panel, accept, decline, pageviews,
    publishTopics() {
      topicIds = "matrices,rank,derivative";
      events.get("mathmamath:analytics-topics-ready")();
    },
  };
}

test("does not contact Google before user consent and persists refusal", () => {
  const app = browser();
  assert.equal(app.panel.hidden, false);
  assert.equal(app.scripts.length, 0);
  assert.equal(app.pageviews().length, 0);
  app.decline.trigger("click");
  assert.equal(app.storage.get("mathmamath-analytics-consent-v1"), "declined");
  assert.equal(app.scripts.length, 0);
  const next = browser({ saved: "declined" });
  assert.equal(next.panel.hidden, true);
  assert.equal(next.scripts.length, 0);
});

test("accepting enables GA4 and tracks only whitelisted lesson routes", () => {
  const app = browser();
  app.accept.trigger("click");
  assert.equal(app.storage.get("mathmamath-analytics-consent-v1"), "accepted");
  assert.equal(app.scripts.length, 1);
  assert.match(app.scripts[0].src, /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-TEST123456$/);
  assert.equal(app.pageviews()[0].page_location, "https://mathmamath.vercel.app/learn/matrices/");

  app.location.hash = "#account?reset=secret-token";
  app.events.get("hashchange")();
  app.location.hash = "#secret-token";
  app.events.get("hashchange")();
  assert.equal(app.pageviews().length, 1, "token hashes and account must be excluded");

  app.location.hash = "#rank/block/7";
  app.events.get("hashchange")();
  assert.deepEqual(Array.from(app.pageviews(), (event) => event.page_path),
    ["/learn/matrices/", "/learn/rank/"]);
  assert.equal(app.pageviews()[1].page_title, "/learn/rank/ | MathMaMath");

  // A route re-entry after an excluded account page is a new page view.
  app.location.hash = "#account?reset=secret-token";
  app.events.get("hashchange")();
  app.location.hash = "#rank";
  app.events.get("hashchange")();
  assert.deepEqual(Array.from(app.pageviews(), (event) => event.page_path),
    ["/learn/matrices/", "/learn/rank/", "/learn/rank/"]);
});

test("static search landing page is tracked with no query or fragment", () => {
  const app = browser({ saved: "accepted", pathname: "/subjects/linear/", hash: "#token" });
  assert.equal(app.scripts.length, 1);
  assert.equal(app.pageviews()[0].page_location, "https://mathmamath.vercel.app/subjects/linear/");
  app.manage.trigger("click");
  app.decline.trigger("click");
  assert.equal(app.location.reloadCalled, true);
  assert.equal(app.storage.get("mathmamath-analytics-consent-v1"), "declined");
});

test("source HTML ships exactly one public-ID consent loader without needing an environment variable", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.equal((html.match(/src="\/analytics\.js"/g) ?? []).length, 1);
  assert.ok(html.includes('data-measurement-id="G-CTLM64E8WF"'));
  assert.ok(html.includes('data-production-host="mathmamath.vercel.app"'));
  assert.ok(!html.includes("www.googletagmanager.com/gtag/js"));
});

test("SPA can publish safe lesson route IDs after the consent script initializes", () => {
  const app = browser({ saved: "accepted", topicsReady: false });
  assert.equal(app.scripts.length, 1);
  assert.equal(app.pageviews().length, 0);
  app.publishTopics();
  assert.equal(app.pageviews().length, 1);
  assert.equal(app.pageviews()[0].page_location, "https://mathmamath.vercel.app/learn/matrices/");
});

test("preview and localhost skip consent and all Google Analytics requests", () => {
  const preview = browser({ saved: "accepted", hostname: "mathmamath-git-feature.example.vercel.app" });
  const localhost = browser({ saved: "accepted", hostname: "localhost" });
  assert.equal(preview.scripts.length, 0);
  assert.equal(localhost.scripts.length, 0);
});

test("GA4 production build tolerates missing and malformed Vercel configuration", () => {
  const warnings = [];
  const warn = (message) => warnings.push(message);

  assert.equal(DEFAULT_GA4_MEASUREMENT_ID, "G-CTLM64E8WF");
  assert.equal(resolveGa4MeasurementId(undefined, warn), "G-CTLM64E8WF");
  assert.equal(resolveGa4MeasurementId("", warn), "G-CTLM64E8WF");
  assert.equal(resolveGa4MeasurementId("  G-CTLM64E8WF  ", warn), "G-CTLM64E8WF");
  assert.equal(resolveGa4MeasurementId("G-ABCDEF9876", warn), "G-ABCDEF9876");
  assert.equal(warnings.length, 0);

  // Vercel may receive a pasted snippet or a Value containing Key=Value.
  // Neither case should break the entire production site's SEO build.
  assert.equal(
    resolveGa4MeasurementId("VITE_GA4_MEASUREMENT_ID=G-CTLM64E8WF", warn),
    "G-CTLM64E8WF",
  );
  assert.equal(
    resolveGa4MeasurementId("<script>gtag('config', 'G-CTLM64E8WF')</script>", warn),
    "G-CTLM64E8WF",
  );
  assert.equal(warnings.length, 2);
  for (const warning of warnings) {
    assert.match(warning, /Invalid VITE_GA4_MEASUREMENT_ID/);
    assert.ok(!warning.includes("<script>"));
  }
});

test("per-deployment Vercel URL cannot replace stable SEO and GA4 site hostname", () => {
  assert.equal(DEFAULT_PUBLIC_ORIGIN, "https://mathmamath.vercel.app");
  assert.equal(
    resolvePublicSiteOrigin({
      VERCEL_PROJECT_PRODUCTION_URL: "mathmamath-cljsa0p46-iplayens3-2767.vercel.app",
    }),
    DEFAULT_PUBLIC_ORIGIN,
  );
  assert.equal(
    resolvePublicSiteOrigin({
      VERCEL_URL: "mathmamath-cljsa0p46-iplayens3-2767.vercel.app",
      VITE_VERCEL_PROJECT_PRODUCTION_URL: "mathmamath-branch-other.vercel.app",
    }),
    DEFAULT_PUBLIC_ORIGIN,
  );
  assert.equal(
    resolvePublicSiteOrigin({ VITE_PUBLIC_SITE_URL: "https://example.org" }),
    "https://example.org",
  );
  assert.throws(
    () => resolvePublicSiteOrigin({ VITE_PUBLIC_SITE_URL: "http://example.org" }),
    /HTTPS origin/,
  );
});

test("canonical production origin still runs consent when Vercel generated stale deployment hostname", () => {
  const staleHost = "mathmamath-cljsa0p46-iplayens3-2767.vercel.app";
  const app = browser({ hostname: "mathmamath.vercel.app", configuredHost: staleHost });
  assert.equal(app.panel.hidden, false);
  assert.equal(app.scripts.length, 0);
  app.accept.trigger("click");
  assert.equal(app.scripts.length, 1);
  assert.equal(app.pageviews()[0].page_location, "https://mathmamath.vercel.app/learn/matrices/");

  const preview = browser({ hostname: staleHost, configuredHost: staleHost, saved: "accepted" });
  assert.equal(preview.scripts.length, 0);
});

test("explicit custom production hostname remains supported without tracking previews", () => {
  const site = browser({ hostname: "math.example.org", configuredHost: "math.example.org" });
  assert.equal(site.panel.hidden, false);
  assert.equal(site.scripts.length, 0);
  site.accept.trigger("click");
  assert.equal(site.scripts.length, 1);
});
