# SEO: crawlable pages and metadata

MathMaMath is the source repository; the site and product use the public name **VisualMath**.

## What gets indexed

The interactive client retains existing hash navigation (`/#matrices`, `/#map`) to avoid breaking user progress and deep links. Hash routes are **not** placed in the sitemap. Google Search discourages using URL fragments to represent different indexable pages.

The build creates independent, server-readable HTML resources:

- `/learn/`: chapter navigation and links to every published course topic.
- `/learn/<topic-id>/`: full semantic lesson HTML, including headings, course text, formulas as accessible text, examples, proofs and selected practice prompts where available.
- `/subjects/<chapter-id>/`: 23 chapter landing pages with real topic summaries, an organized learning sequence and contextual links.
- Each lesson provides links to prerequisites, neighboring topics, and its interactive counterpart.

Generated HTML comes from canonical TypeScript course loaders, not manually copied or invented SEO summaries. `pnpm seo:check` confirms the catalog and pages exist.

## Production origin

Set `VITE_PUBLIC_SITE_URL` to the **actual publicly accessible HTTPS origin**, with no path, e.g. `https://math.example`.

Vercel builds can use the system-provided `VERCEL_PROJECT_PRODUCTION_URL` as a fallback, including for previews, if system variables are exposed. This must match the origin that serves pages. For a separate Nginx/Docker deployment, pass `--build-arg VITE_PUBLIC_SITE_URL=https://math.example` to Docker build.

When the origin is known on a production build, `scripts/generate-seo.mjs` generates `sitemap.xml` with absolute canonical URLs and `robots.txt` with a Sitemap directive. On Vercel Preview it uses `noindex,nofollow` plus `robots.txt` disallow and does not create a sitemap. With no known origin (e.g. local CI), it avoids publishing a fabricated sitemap. There is no invented domain.

## Manual verification after deployment

1. Check `/learn/`, `/learn/matrices/`, `/robots.txt` and `/sitemap.xml` at the live production address.
2. Verify HTTP 200, semantic text in **view source** without JavaScript, and canonical URLs pointing at the real deployment.
3. Verify `/learn/not-a-real-topic/` and `/subjects/not-a-real-chapter/` return **HTTP 404**; check Vercel and Nginx routing separately.
4. Check `/learn/` and lessons are reachable from the home page, not only the XML sitemap.
5. Add the domain to Google Search Console / Bing Webmaster Tools, submit the sitemap, and inspect selected URLs.
6. Review real crawl/index coverage, Core Web Vitals, structured-data diagnostics and robots/canonical conflicts after launch.

Do not promise rankings or use fabricated reviews, FAQ markup, aggregate ratings or nonexistent dates. No keyword stuffing; page headings and descriptions match the actual lesson.

## Implementation details

- `index.html`: descriptive home title/description, visible no-JS catalog link.
- `scripts/generate-seo.mjs`: builds full HTML pages using Vite SSR module loading; emits chapter pages, metadata, schema.org LearningResource, semantic MathML formulas (fallback to original text), robots and sitemap.
- `scripts/check-seo.mjs`: validates built pages and relevant markup.
- `deploy/nginx.conf`: prevents SPA fallback for nonexistent `/learn/` URLs.
- `e2e/production-image.spec.ts`: validates static HTML and 404 routing in the actual Nginx image.

## Notes

- The indexability of the static pages does not imply that the dynamic hash routes are indexable.
- Google may choose different canonical URLs and is never required to index all pages.
- `VITE_PUBLIC_SITE_URL` is a **public origin**, never a credential or secret.
- Page-based Open Graph images and social screenshots are a separate future enhancement; no imagery is invented by the generator.
