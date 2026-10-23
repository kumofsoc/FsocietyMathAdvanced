import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../public/analytics.js", import.meta.url), "utf8");

function browser({ saved = null, hash = "#matrices", pathname = "/" } = {}) {
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

  const location = { origin: "https://mathmamath.vercel.app", pathname, hash,
    reloadCalled: false, reload() { this.reloadCalled = true; },
  };
  const document = {
    title: "MathMaMath",
    currentScript: {
      getAttribute(key) {
        if (key === "data-measurement-id") return "G-TEST123456";
        if (key === "data-topic-ids") return "matrices,rank,derivative";
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
  assert.ok(controls, "Privacy controls must exist");
  const [manage, panel] = controls.children;
  const actions = panel.children.find((node) => node.className === "mathmamath-analytics-actions");
  const [decline, accept] = actions.children;

  function pageviews() {
    return (window.dataLayer || [])
      .filter((args) => args[0] === "event" && args[1] === "page_view")
      .map((args) => args[2]);
  }

  return { storage, scripts, events, window, location, manage, panel, accept, decline, pageviews };
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
