import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const dist = path.join(ROOT, "dist");
const main = await readFile(path.join(dist, "index.html"), "utf8");
const catalog = await readFile(path.join(dist, "learn/index.html"), "utf8");
const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
const directory = await readdir(path.join(dist, "learn"), { withFileTypes: true });
const subjectDirectory = await readdir(path.join(dist, "subjects"), { withFileTypes: true });
const chapterIds = subjectDirectory.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const ids = directory.filter((e) => e.isDirectory()).map((e) => e.name);

function check(condition, message) {
  if (!condition) throw new Error("[SEO] " + message);
}

check(ids.length >= 80, "Expected at least 80 generated lesson pages; got " + ids.length);
check(chapterIds.length >= 23, "Expected at least 23 chapter pages; got " + chapterIds.length);
check(main.includes('property="og:title"'), "Home Open Graph tags missing");
check(main.includes('application/ld+json'), "Home structured data missing");
check(catalog.includes("<h1>Курс высшей математики</h1>"), "Catalog is missing content");
check(catalog.includes('href="/learn/matrices/"'), "Catalog is missing crawlable links");
check(catalog.includes('href="/subjects/linear/"'), "Catalog is missing chapter links");
for (const id of chapterIds) {
  const html = await readFile(path.join(dist, "subjects", id, "index.html"), "utf8");
  check(html.includes("<ol>") && html.includes('href="/learn/'), "Chapter missing crawlable topics: " + id);
  check(html.includes('type="application/ld+json"'), "Chapter schema missing: " + id);
}
check(robots.includes("User-agent: *"), "robots.txt is missing");
for (const id of ids) {
  const file = path.join(dist, "learn", id, "index.html");
  const source = await readFile(file, "utf8");
  check(source.includes("<article>") && source.includes("<h1>"), "Lesson content missing: " + id);
  check(source.includes('application/ld+json'), "Structured data missing: " + id);
  check(source.includes('href="/#'), "Interactive link missing: " + id);
  check((await stat(file)).size > 700, "HTML is suspiciously small: " + id);
}
const site = process.env.VITE_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL ||
  "https://mathmamath.vercel.app";
if (process.env.VERCEL_ENV !== "preview") {
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  check(sitemap.includes("<urlset"), "Sitemap missing");
  check(sitemap.includes("/learn/matrices/"), "Sitemap missing a lesson");
  check(sitemap.includes("/subjects/linear/"), "Sitemap missing a chapter");
  check(!sitemap.includes("#"), "Sitemap must not contain hash routes");
  const origin = new URL(site.includes("://") ? site : "https://" + site).origin;
  check(sitemap.includes("<loc>" + origin + "/</loc>"), "Canonical home URL missing in sitemap");
  check(robots.includes("Sitemap: " + origin + "/sitemap.xml"), "robots.txt has wrong sitemap origin");
  check(main.includes('rel="canonical" href="' + origin + '/"'), "Home canonical missing or wrong");
}
console.log("[SEO] Verified " + ids.length + " crawlable lessons, " + chapterIds.length + " chapters, catalog and metadata.");
