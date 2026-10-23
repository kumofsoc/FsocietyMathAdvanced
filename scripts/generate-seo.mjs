import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import katex from "katex";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const APP_NAME = "MathMaMath";
// Confirmed public Vercel production domain. Environment override supports custom domains.
const DEFAULT_PUBLIC_ORIGIN = "https://mathmamath.vercel.app";
const HOME_TITLE = "MathMaMath: высшая математика, теория и задачи";
const HOME_DESCRIPTION = "MathMaMath: бесплатный интерактивный курс высшей математики: линейная алгебра, аналитическая геометрия, математический анализ, интегралы и ряды. Теория, доказательства, примеры и практика.";

// Shared opt-in analytics script. Unset by default; disabled on Preview builds.
// A GA4 measurement ID is public and must never be confused with a secret key.
let analyticsHeadMarkup = "";

function analyticsMarkup(publishedIds) {
  const id = (process.env.VITE_GA4_MEASUREMENT_ID || "").trim();
  if (!id) return "";
  if (!/^G-[A-Z0-9]{6,16}$/.test(id)) {
    throw new Error("VITE_GA4_MEASUREMENT_ID must be a GA4 web measurement ID (G-...).");
  }
  if (IS_PREVIEW) return "";
  const ids = publishedIds.filter((topicId) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(topicId));
  return '<link rel="stylesheet" href="/analytics.css">' +
    '<script defer src="/analytics.js" data-measurement-id="' + escapeHtml(id) +
    '" data-topic-ids="' + escapeHtml(ids.join(",")) + '"></script>';
}

function siteOrigin() {
  const raw = (
    process.env.VITE_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL ||
    DEFAULT_PUBLIC_ORIGIN
  ).trim();
  if (!raw) return "";
  const url = new URL(raw.includes("://") ? raw : "https://" + raw);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_PUBLIC_SITE_URL must be an HTTPS origin, without a path, query, or fragment.");
  }
  return url.origin;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function renderMath(formula) {
  let rendered = "";
  try {
    rendered = katex.renderToString(String(formula), {
      output: "mathml",
      throwOnError: true,
      trust: false,
      strict: "ignore",
    });
  } catch {
    // Some legacy formulas are intentionally informal; keep their source legible.
  }
  return '<div class="formula">' +
    (rendered || '<code>' + escapeHtml(formula) + '</code>') +
    '</div>';
}

function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function richTitle(title) {
  return escapeHtml(title + " | " + APP_NAME);
}

function meta(description, title, url, type = "article") {
  return [
    '<meta name="description" content="' + escapeHtml(description) + '">',
    '<meta name="robots" content="' + (IS_PREVIEW ? "noindex,nofollow" : "index,follow,max-image-preview:large") + '">',
    '<meta property="og:type" content="' + type + '">',
    '<meta property="og:locale" content="ru_RU">',
    '<meta property="og:site_name" content="' + APP_NAME + '">',
    '<meta property="og:title" content="' + escapeHtml(title) + '">',
    '<meta property="og:description" content="' + escapeHtml(description) + '">',
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:title" content="' + escapeHtml(title) + '">',
    '<meta name="twitter:description" content="' + escapeHtml(description) + '">',
    ...(url ? [
      '<link rel="canonical" href="' + escapeHtml(url) + '">',
      '<meta property="og:url" content="' + escapeHtml(url) + '">',
    ] : []),
  ].join("\n");
}

const STYLES = [
  "*,*::before,*::after{box-sizing:border-box}",
  "body{margin:0;background:#0c0e15;color:#e9ebf5;font:17px/1.65 system-ui,-apple-system,'Segoe UI',sans-serif}",
  "a{color:#9fb9ff}a:hover{text-decoration-thickness:2px}",
  "main{width:min(100% - 2rem,850px);margin:3rem auto 6rem}",
  "h1{font-size:clamp(2rem,5vw,3rem);line-height:1.2}h2{line-height:1.25;margin:2.7rem 0 .8rem}",
  "h3{line-height:1.35;margin:1.5rem 0 .4rem}",
  "p{white-space:pre-wrap}nav{display:flex;flex-wrap:wrap;gap:.85rem;margin:1.4rem 0}",
  ".muted{color:#b8bed1}.block{border-top:1px solid #32384a;padding:.8rem 0}",
  "code,.formula{white-space:pre-wrap;overflow-wrap:anywhere;background:#191e2d;padding:.3rem .5rem}",
  ".formula{display:block;padding:1rem;margin:1rem 0;border-radius:.4rem}",
  "ul{padding-left:1.3rem}li{margin:.45rem 0}",
  ".topic-list{display:grid;gap:.55rem;margin:2rem 0}",
  ".topic-list a{display:block;border:1px solid #303750;border-radius:8px;padding:.7rem 1rem;text-decoration:none}",
  ".topic-list a:hover{background:#1a2032}",
].join("");

function basePage(title, description, content, schema, url, type) {
  return '<!doctype html>\n<html lang="ru"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="theme-color" content="#0c0e15"><title>' + richTitle(title) + '</title>\n' +
    meta(description, title, url, type) +
    '<style>' + STYLES + '</style>' +
    '<script type="application/ld+json">' + jsonLd(schema) + '</script>' +
    analyticsHeadMarkup +
    '</head><body>' + content + '</body></html>\n';
}

function renderItems(items) {
  if (!items || items.length === 0) return "";
  return "<ul>" + items.map((item) => "<li>" + escapeHtml(item) + "</li>").join("") + "</ul>";
}

function renderAnnotations(items, heading) {
  if (!items || items.length === 0) return "";
  return items.map((item) =>
    '<section><h4>' + escapeHtml(item.label || item.title || heading) + '</h4>' +
    '<p>' + escapeHtml(item.body || item.claim || "") + '</p>' +
    (item.formula ? renderMath(item.formula) : "") +
    "</section>"
  ).join("");
}

function renderBlock(block, index) {
  const heading = block.title || block.kind;
  return '<section class="block" id="section-' + index + '">' +
    '<h2>' + escapeHtml(heading) + '</h2>' +
    '<p>' + escapeHtml(block.body) + '</p>' +
    (block.formula ? renderMath(block.formula) : "") +
    renderItems(block.items) +
    renderAnnotations(block.proofs, "Доказательство") +
    renderAnnotations(block.corollaries, "Следствие") +
    renderAnnotations(block.workedExamples, "Пример") +
    (block.statements || []).map((statement) =>
      '<section><h3>' + escapeHtml(statement.claim) + '</h3>' +
      (statement.conditions ? '<p>' + escapeHtml(statement.conditions) + '</p>' : "") +
      renderAnnotations([statement.proof], "Доказательство") +
      renderAnnotations([statement.example], "Пример") +
      '</section>'
    ).join("") +
    '</section>';
}

async function writePage(relative, content) {
  const target = path.join(DIST, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

async function generate() {
  const origin = siteOrigin();
  // Use Vite's existing TS transform and alias resolver instead of parsing TS with regex.
  const vite = await createServer({
    configFile: false,
    root: ROOT,
    resolve: { alias: [{ find: "@", replacement: path.join(ROOT, "src") }] },
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });
  try {
    const { chapters, topicMeta, topicListMeta } = await vite.ssrLoadModule("/src/data/courseMeta.ts");
    const { loadCourseTopic } = await vite.ssrLoadModule("/src/data/course/topicLoaders.ts");
    const { loadPracticeForTopic } = await vite.ssrLoadModule("/src/data/practice/loaders.ts");
    const available = topicListMeta.filter((item) => !item.isStub);
    if (available.length === 0) throw new Error("No published course topics found.");
    const availableIds = new Set(available.map((item) => item.id));
    analyticsHeadMarkup = analyticsMarkup([...availableIds]);
    const urls = ["/", "/learn/"];

    const catalog = chapters.map((chapter) => {
      const entries = chapter.topicIds.filter((id) => availableIds.has(id));
      if (!entries.length) return "";
      return '<section><h2><a href="/subjects/' + encodeURIComponent(chapter.id) + '/">' + escapeHtml(chapter.title) + '</a></h2><div class="topic-list">' +
        entries.map((id) => {
          const item = topicMeta[id];
          return '<a href="/learn/' + encodeURIComponent(id) + '/"><strong>§ ' +
            escapeHtml(item.number) + '. ' + escapeHtml(item.title) +
            '</strong><br><span class="muted">' + escapeHtml(item.summary) + '</span></a>';
        }).join("") + '</div></section>';
    }).join("");

    const catalogUrl = origin ? origin + "/learn/" : undefined;
    const catalogHtml = basePage(
      "Курс высшей математики: все темы",
      "Открытый курс высшей математики MathMaMath. Каталог тем по линейной алгебре, геометрии, математическому анализу и другим разделам.",
      '<main><nav><a href="/">MathMaMath</a><a href="/#map">Интерактивная карта</a></nav>' +
      '<h1>Курс высшей математики</h1><p class="muted">Теория, определения, доказательства, формулы и примеры. Все темы доступны для чтения без аккаунта.</p>' +
      catalog + '</main>',
      { "@context": "https://schema.org", "@type": "CollectionPage", name: "Курс высшей математики", inLanguage: "ru", ...(catalogUrl ? { url: catalogUrl } : {}) },
      catalogUrl, "website",
    );
    await writePage("learn/index.html", catalogHtml);

    // Every discipline/chapter also has a crawlable landing page. These are
    // not thin doorway pages: their descriptions come from real course metadata
    // and lead directly to the canonical lessons.
    let publishedChapters = 0;
    for (const chapter of chapters) {
      const entries = chapter.topicIds.filter((id) => availableIds.has(id));
      if (!entries.length) continue;
      const pathname = "/subjects/" + encodeURIComponent(chapter.id) + "/";
      const chapterUrl = origin ? origin + pathname : undefined;
      const longDescription = "Раздел «" + chapter.title +
        "»: основные понятия, определения, теоремы, формулы и задачи. " +
        entries.slice(0, 3).map((id) => topicMeta[id].summary).join(" ");
      const lessonList = entries.map((id) => {
        const topic = topicMeta[id];
        return '<li><h2><a href="/learn/' + encodeURIComponent(topic.id) +
          '/">§ ' + escapeHtml(topic.number) + '. ' + escapeHtml(topic.title) +
          '</a></h2><p>' + escapeHtml(topic.summary) + '</p></li>';
      }).join("");
      const content = '<main><nav aria-label="Навигация"><a href="/">Главная</a>' +
        '<a href="/learn/">Курс</a><a href="/#map">Интерактивная карта</a></nav>' +
        '<h1>' + escapeHtml(chapter.title) + '</h1>' +
        '<p>' + escapeHtml(longDescription) + '</p>' +
        '<ol>' + lessonList + '</ol>' +
        '<p><a href="/learn/">Смотреть все разделы курса</a></p></main>';
      const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: chapter.title,
        description: longDescription,
        inLanguage: "ru",
        isPartOf: { "@type": "Course", name: "Курс высшей математики MathMaMath" },
        ...(chapterUrl ? { url: chapterUrl } : {}),
      };
      await writePage("subjects/" + chapter.id + "/index.html",
        basePage(chapter.title, longDescription.slice(0, 240), content, schema, chapterUrl, "website"));
      urls.push(pathname);
      publishedChapters += 1;
    }

    for (const item of available) {
      const [topic, practice] = await Promise.all([loadCourseTopic(item.id), loadPracticeForTopic(item.id)]);
      if (!topic || topic.id !== item.id || !Array.isArray(topic.blocks) || topic.blocks.length === 0) {
        throw new Error("Incomplete topic: " + item.id);
      }
      const chapter = chapters.find((c) => c.id === item.chapterId);
      const siblings = chapter?.topicIds.filter((id) => availableIds.has(id)) ?? [];
      const index = siblings.indexOf(item.id);
      const next = index >= 0 ? siblings[index + 1] : undefined;
      const previous = index > 0 ? siblings[index - 1] : undefined;
      const pathname = "/learn/" + encodeURIComponent(item.id) + "/";
      const canonical = origin ? origin + pathname : undefined;
      const prereq = item.prerequisites.filter((id) => availableIds.has(id));

      const content =
        '<main><nav aria-label="Навигация"><a href="/">Главная</a><a href="/learn/">Все темы</a>' +
        '<a href="/#' + encodeURIComponent(item.id) + '">Интерактивная версия</a></nav>' +
        '<article><header><p class="muted"><a href="/subjects/' + encodeURIComponent(item.chapterId) + '/">' + escapeHtml(chapter?.title || "Высшая математика") + '</a>' +
        ' · § ' + escapeHtml(item.number) + '</p><h1>' + escapeHtml(item.title) + '</h1>' +
        '<p>' + escapeHtml(item.summary) + '</p></header>' +
        (prereq.length ? '<aside><h2>Предварительные темы</h2><ul>' +
          prereq.map((id) => '<li><a href="/learn/' + encodeURIComponent(id) + '/">' + escapeHtml(topicMeta[id].title) + '</a></li>').join("") + '</ul></aside>' : "") +
        topic.blocks.map(renderBlock).join("") +
        (practice.length ? '<section class="block"><h2>Задачи для самостоятельной практики</h2><p>Задания курса доступны в интерактивной версии. Ниже приведены формулировки части заданий без ответов.</p><ol>' +
          practice.slice(0, 12).map((task) => '<li><h3>' + escapeHtml(task.title) + '</h3><p>' + escapeHtml(task.prompt) + '</p></li>').join("") +
          '</ol><p><a href="/#' + encodeURIComponent(item.id) + '">Открыть все задачи в тренажёре</a></p></section>' : "") +
        '</article>' +
        '<nav aria-label="Другие темы">' +
        (previous ? '<a href="/learn/' + encodeURIComponent(previous) + '/">← ' + escapeHtml(topicMeta[previous].title) + '</a>' : "") +
        (next ? '<a href="/learn/' + encodeURIComponent(next) + '/">' + escapeHtml(topicMeta[next].title) + ' →</a>' : "") +
        '<a href="/learn/">Каталог</a></nav>' +
        '</main>';

      const schema = {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: item.title,
        description: item.summary,
        inLanguage: "ru",
        learningResourceType: "Lesson",
        isPartOf: { "@type": "Course", name: "Курс высшей математики MathMaMath" },
        ...(canonical ? { url: canonical } : {}),
      };
      await writePage("learn/" + item.id + "/index.html",
        basePage(item.title, item.summary, content, schema, canonical));
      urls.push(pathname);
    }

    // The interactive SPA remains at /. Its original HTML gets consistent social
    // metadata and a canonical URL only when the production origin is known.
    const indexPath = path.join(DIST, "index.html");
    let index = await readFile(indexPath, "utf8");
    const rootMeta = [
      '<meta property="og:locale" content="ru_RU">',
      '<meta property="og:site_name" content="MathMaMath">',
      '<meta property="og:type" content="website">',
      '<meta property="og:title" content="' + escapeHtml(HOME_TITLE) + '">',
      '<meta property="og:description" content="' + escapeHtml(HOME_DESCRIPTION) + '">',
      '<meta name="twitter:card" content="summary">',
      '<meta name="robots" content="' + (IS_PREVIEW ? "noindex,nofollow" : "index,follow") + '">',
      ...(origin ? [
        '<link rel="canonical" href="' + escapeHtml(origin + "/") + '">',
        '<meta property="og:url" content="' + escapeHtml(origin + "/") + '">',
      ] : []),
      '<script type="application/ld+json">' +
        jsonLd({ "@context": "https://schema.org", "@type": "WebSite", name: "MathMaMath", description: HOME_DESCRIPTION, inLanguage: "ru", ...(origin ? { url: origin + "/" } : {}) }) +
        '</script>',
      analyticsHeadMarkup,
    ].join("\n");
    if (!index.includes("</head>")) throw new Error("dist/index.html has no </head> tag");
    index = index.replace("</head>", rootMeta + "\n</head>");
    await writeFile(indexPath, index, "utf8");

    // This repository's confirmed public production hostname is used by default.
    // VITE_PUBLIC_SITE_URL overrides it when a verified custom domain is configured.
    let robots = IS_PREVIEW ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n";
    if (origin && !IS_PREVIEW) {
      const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((url) => "  <url><loc>" + escapeHtml(origin + url) + "</loc></url>").join("\n") +
        '\n</urlset>\n';
      await writePage("sitemap.xml", sitemap);
      robots += "Sitemap: " + origin + "/sitemap.xml\n";
    }
    await writePage("robots.txt", robots);
    console.log("[SEO] Generated " + available.length + " topic pages, " + publishedChapters + " chapter pages, index, robots.txt" +
      (origin ? ", sitemap.xml (" + origin + ")" : "; no sitemap: public site origin unavailable"));
  } finally {
    await vite.close();
  }
}

generate().catch((error) => {
  console.error("[SEO] Build failed:", error);
  process.exitCode = 1;
});
