# SEO: crawlable pages and metadata

The source repository and the public product both use the name **MathMaMath**.

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

For this deployment the confirmed fallback origin is `https://mathmamath.vercel.app`. When the origin is known on a production build, `scripts/generate-seo.mjs` generates `sitemap.xml` with absolute canonical URLs and `robots.txt` with a Sitemap directive. On Vercel Preview it uses `noindex,nofollow` plus `robots.txt` disallow and does not create a sitemap. The fallback is the known production address, so CI now also verifies sitemap and canonical markup; a custom production domain can override it through `VITE_PUBLIC_SITE_URL`.

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

## Search and traffic analytics

Search-performance numbers come **from Google Search Console**, not from
JavaScript on the website. For the verified URL-prefix property
`https://mathmamath.vercel.app/` use:

- [Search performance](https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fmathmamath.vercel.app%2F):
  impressions, clicks, CTR, position, search terms, pages, device and country;
- [Pages and indexing](https://search.google.com/search-console/index?resource_id=https%3A%2F%2Fmathmamath.vercel.app%2F):
  excluded/crawled/indexed URLs, canonicalization problems;
- [Sitemaps](https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fmathmamath.vercel.app%2F):
  sitemap fetch status and discovered URLs;
- [Core Web Vitals](https://search.google.com/search-console/core-web-vitals?resource_id=https%3A%2F%2Fmathmamath.vercel.app%2F):
  field experience once sufficient real-user data is available.

### Optional Google Analytics 4

MathMaMath uses its registered GA4 web stream with Measurement ID
`G-CTLM64E8WF`. This public ID is already installed. An environment variable
is not required to display consent or start opt-in analytics.
`VITE_GA4_MEASUREMENT_ID` can override the ID for another stream on deployments
using the normal production build pipeline.

MathMaMath's public production GA4 ID `G-CTLM64E8WF` is bundled in the
first-party consent loader, so the UI works even if Vercel does not inject
the build-time environment variable or runs Vite without the SEO generator.
The `VITE_GA4_MEASUREMENT_ID` variable is **optional** and overrides the
public ID on builds using the normal SEO pipeline. If the Vercel value is
invalid, the build now warns and uses the public default ID instead of failing
the entire website deployment. Correct the value in Vercel separately; it
must contain only `G-CTLM64E8WF`, not a JavaScript snippet or `KEY=VALUE`. A future production
hostname change must also update the source `data-production-host` value.

On the production hostname, the site shows a Russian opt-in consent panel. Only
clicking **Разрешить аналитику** dynamically loads the Google tag. Declining
does not load it. The persistent **Конфиденциальность** control can reopen the
choice; withdrawing consent reloads into a non-tracking state. The choice is
stored under `mathmamath-analytics-consent-v1`. No email, account ID, query
string, reset/verification token or arbitrary hash fragment is sent in
page-view URLs. The existing SPA hash routes are mapped to a safe whitelist of
virtual `/learn/<topic>/` paths. Pre-rendered lesson and chapter pages have
the same opt-in behavior. Preview deployments never include the analytics tag.

GA4 and Search Console are distinct products. **GA4 cannot give Search
Console search-query impressions or ranking positions.** There are no GA4
reports until a real Measurement ID is configured and consenting traffic is
recorded. **Required GA4 stream configuration before enabling this variable:** open
Google Analytics → Admin → Data streams → Web → Enhanced measurement →
Page views (advanced options), and **disable "Page changes based on browser
history events"**. The website already sends explicit sanitized `page_view`
events for hash-navigation. Leaving this switch enabled causes duplicated
events and can send unfiltered browser-history URLs independently of the
website's consent-aware routing.

See [Google's manual-pageview guide](https://developers.google.com/analytics/devguides/collection/ga4/views#disable-page-changes-based-on-browser-history-events).


Optional: enable Vercel Web Analytics and Speed Insights from the project's
dashboard if desired. They are separate services that are **not** enabled
automatically by this implementation. Review your legal privacy and consent
requirements before adding other trackers.
