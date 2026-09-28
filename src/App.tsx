import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { chapters, topicList, topics } from "./data/course";
import { CourseMap } from "./components/CourseMap";
import { CustomCursor } from "./components/CustomCursor";
import { MathBackdrop } from "./components/MathBackdrop";
import { ThemeStudio } from "./components/ThemeStudio";
import { TopicPage } from "./components/TopicPage";

const MASTERY_KEY = "fsociety-math-mastery-v1";

function readMastery(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(MASTERY_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function routeFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return "matrices";
  if (raw.startsWith("block-")) return "matrices";
  return raw;
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [query, setQuery] = useState("");
  const [mastered, setMastered] = useState<Set<string>>(readMastery);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onHash = () => {
      const next = routeFromHash();
      setRoute(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSidebarOpen(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!mainRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".topic-hero, .map-header",
        { opacity: 0, y: 20, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.68, ease: "power3.out" },
      );
    }, mainRef);
    return () => ctx.revert();
  }, [route]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return topicList
      .filter((topic) =>
        topic.title.toLowerCase().includes(normalized) ||
        topic.summary.toLowerCase().includes(normalized),
      )
      .slice(0, 8);
  }, [query]);

  const toggleMastered = (id: string) => {
    setMastered((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(MASTERY_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const progress = Math.round((mastered.size / topicList.length) * 100);
  const topic = topics[route];

  return (
    <div className="app-shell">
      <MathBackdrop />
      <CustomCursor />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="brand" onClick={() => (window.location.hash = "matrices")}>
          <span className="brand-mark">∑</span>
          <span>
            <strong>FsocietyMath</strong>
            <small>ADVANCED</small>
          </span>
        </button>

        <button className="map-entry" onClick={() => (window.location.hash = "map")}>
          <span>◌</span>
          Карта курса
          <b>{topicList.length}</b>
        </button>

        <div className="sidebar-progress">
          <div>
            <span>Освоено</span>
            <strong>{mastered.size} / {topicList.length}</strong>
          </div>
          <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="chapter-list">
          {chapters.map((chapter) => (
            <details key={chapter.id} open={chapter.id === "linear"}>
              <summary>
                <span>{chapter.number}</span>
                <strong>{chapter.title}</strong>
              </summary>
              <div className="chapter-topics">
                {chapter.topicIds.map((id) => {
                  const item = topics[id];
                  if (!item) return null;
                  return (
                    <button
                      key={id}
                      className={route === id ? "active" : ""}
                      onClick={() => (window.location.hash = id)}
                    >
                      <span>{mastered.has(id) ? "●" : "○"}</span>
                      <em>§ {item.number}</em>
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </aside>

      <div className="page-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen((value) => !value)}>
            ☰
          </button>

          <div className="search-shell">
            <span>⌕</span>
            <input
              placeholder="Поиск по курсу…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {results.length > 0 && (
              <div className="search-results">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      window.location.hash = result.id;
                      setQuery("");
                    }}
                  >
                    <span>§ {result.number}</span>
                    <strong>{result.title}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="topbar-actions">
            <span className="progress-label">{progress}% курса</span>
            <ThemeStudio />
          </div>
        </header>

        <main ref={mainRef} className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {route === "map" ? (
                <CourseMap />
              ) : topic ? (
                <TopicPage
                  topic={topic}
                  mastered={mastered.has(topic.id)}
                  onToggleMastered={toggleMastered}
                />
              ) : (
                <section className="not-found">
                  <div className="eyebrow">404 / UNKNOWN TOPIC</div>
                  <h1>Такой темы пока нет.</h1>
                  <button onClick={() => (window.location.hash = "map")}>Открыть карту</button>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
