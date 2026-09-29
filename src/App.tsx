import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { chapters, topicList, topics } from "./data/course";
import { CommandPalette } from "./components/CommandPalette";
import { CustomCursor } from "./components/CustomCursor";
import { HomePage } from "./components/HomePage";
import { HistoryDock } from "./components/HistoryDock";
import { MathBackdrop } from "./components/MathBackdrop";
import { ScrollProgress } from "./components/ScrollProgress";
import { SettingsPanel } from "./components/SettingsPanel";
import { reportCourseIntegrity } from "./lib/courseIntegrity";
import { LEARNING_EVENT } from "./lib/learning";
import {
  getChapterProgress,
  getCourseProgress,
  getLearningSnapshot,
  getTopicProgress,
  isTrackedChapter,
} from "./lib/progress";
import type { Chapter } from "./types/course";

const LAST_TOPIC_KEY = "fsociety-last-topic-v1";

function routeFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  return raw || "home";
}

const CourseMap = lazy(() =>
  import("./components/CourseMap").then((module) => ({ default: module.CourseMap })),
);
const TopicPage = lazy(() =>
  import("./components/TopicPage").then((module) => ({ default: module.TopicPage })),
);

function ChapterAccordion({
  chapter,
  route,
  snapshot,
}: {
  chapter: Chapter;
  route: string;
  snapshot: ReturnType<typeof getLearningSnapshot>;
}) {
  const containsRoute = chapter.topicIds.includes(route);
  const [open, setOpen] = useState(chapter.id === "linear" || containsRoute);

  useEffect(() => {
    if (containsRoute) setOpen(true);
  }, [containsRoute]);

  return (
    <section className={"chapter-accordion " + (open ? "open" : "")}>
      <button className="chapter-summary" onClick={() => setOpen((value) => !value)}>
        <span>{chapter.number}</span>
        <strong>{chapter.title}</strong>
        <i>{open ? "−" : "+"}</i>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="chapter-topics-clip"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="chapter-topics"
              initial="closed"
              animate="open"
              variants={{
                closed: {},
                open: { transition: { staggerChildren: 0.025 } },
              }}
            >
              {chapter.topicIds.map((id) => {
                const item = topics[id];
                if (!item) return null;
                const tracked = isTrackedChapter(item.chapterId);
                const progress = tracked ? getTopicProgress(id, snapshot) : 0;
                return (
                  <motion.button
                    key={id}
                    className={route === id ? "active" : ""}
                    onClick={() => (window.location.hash = id)}
                    title={tracked ? "Освоение: " + progress + "%" : undefined}
                    variants={{
                      closed: { opacity: 0, x: -8 },
                      open: { opacity: 1, x: 0 },
                    }}
                  >
                    <span>{tracked ? (progress >= 100 ? "●" : progress > 0 ? "◐" : "○") : "·"}</span>
                    <em>§ {item.number}</em>
                    {item.title}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SidebarProgressItem({
  chapter,
  route,
  progress,
  snapshot,
}: {
  chapter: Chapter;
  route: string;
  progress: number;
  snapshot: ReturnType<typeof getLearningSnapshot>;
}) {
  const containsRoute = chapter.topicIds.includes(route);
  const [open, setOpen] = useState(containsRoute);

  useEffect(() => {
    if (containsRoute) setOpen(true);
  }, [containsRoute]);

  return (
    <section className={"sidebar-progress-item " + (open ? "open" : "")}>
      <button
        className="sidebar-progress-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="sidebar-progress-number">{chapter.number}</span>
        <span className="sidebar-progress-copy">
          <span className="sidebar-progress-title-row">
            <strong>{chapter.title}</strong>
            <b>{progress}%</b>
          </span>
          <span className="progress-track">
            <i style={{ width: progress + "%" }} />
          </span>
        </span>
        <i className="sidebar-progress-chevron">⌄</i>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="sidebar-progress-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sidebar-progress-topics">
              {chapter.topicIds.map((id) => {
                const item = topics[id];
                if (!item) return null;
                const value = getTopicProgress(id, snapshot);
                return (
                  <button
                    key={id}
                    className={route === id ? "active" : ""}
                    onClick={() => (window.location.hash = id)}
                  >
                    <span className="sidebar-topic-state">
                      {value >= 100 ? "●" : value > 0 ? "◐" : "○"}
                    </span>
                    <span className="sidebar-topic-copy">
                      <em>§ {item.number}</em>
                      <strong>{item.title}</strong>
                    </span>
                    <span className="sidebar-topic-progress">{value}%</span>
                  </button>
                );
              })}
            </div>
            <small className="sidebar-progress-note">
              50% теория + 50% практика по каждой теме
            </small>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("fsociety-sidebar-collapsed-v1") === "1";
    } catch {
      return false;
    }
  });
  const [learningVersion, setLearningVersion] = useState(0);
  const [lastTopicId, setLastTopicId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_TOPIC_KEY);
    } catch {
      return null;
    }
  });
  const mainRef = useRef<HTMLElement>(null);
  const routeRef = useRef(route);

  useEffect(() => {
    reportCourseIntegrity();
  }, []);

  useEffect(() => {
    const key = "fsociety-route-scroll-v1";

    const readPositions = (): Record<string, number> => {
      try {
        return JSON.parse(sessionStorage.getItem(key) || "{}");
      } catch {
        return {};
      }
    };

    const onHash = () => {
      const positions = readPositions();
      positions[routeRef.current] = window.scrollY;
      sessionStorage.setItem(key, JSON.stringify(positions));

      const previousRoute = routeRef.current;
      if (topics[previousRoute]) {
        try {
          localStorage.setItem(LAST_TOPIC_KEY, previousRoute);
        } catch {
          // Resume state is optional.
        }
        setLastTopicId(previousRoute);
      }

      const next = routeFromHash();
      setRoute(next);
      routeRef.current = next;
      setSidebarOpen(false);

      window.requestAnimationFrame(() => {
        const y = positions[next] ?? 0;
        window.scrollTo({ top: y, behavior: y > 0 ? "auto" : "smooth" });
      });
    };

    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "fsociety-sidebar-collapsed-v1",
        sidebarCollapsed ? "1" : "0",
      );
    } catch {
      // Storage may be unavailable in strict/private contexts.
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    const refresh = () => setLearningVersion((value) => value + 1);
    window.addEventListener(LEARNING_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LEARNING_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>(".topic-hero, .map-header");
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 20, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.68, ease: "power3.out" },
      );
    }, root);

    return () => ctx.revert();
  }, [route]);

  const learningSnapshot = useMemo(
    () => getLearningSnapshot(),
    [learningVersion],
  );

  const trackedProgressRows = useMemo(() => {
    const snapshot = learningSnapshot;
    return chapters
      .filter((chapter) => isTrackedChapter(chapter.id))
      .map((chapter) => ({
        chapter,
        progress: getChapterProgress(chapter.id, snapshot),
      }));
  }, [learningSnapshot]);

  const courseProgress = useMemo(
    () => getCourseProgress(learningSnapshot),
    [learningSnapshot],
  );

  const topic = topics[route];
  const resumeTopic = lastTopicId ? topics[lastTopicId] : undefined;

  return (
    <div className={"app-shell " + (sidebarCollapsed ? "sidebar-collapsed" : "")}>
      <ScrollProgress />
      <MathBackdrop />
      <CustomCursor />
      <HistoryDock />

      <aside className={"sidebar " + (sidebarOpen ? "open " : "") + (sidebarCollapsed ? "collapsed" : "")}>
        <button
          className="sidebar-collapse-control"
          onClick={() => {
            setSidebarCollapsed(true);
            setSidebarOpen(false);
          }}
          title="Скрыть sidebar"
          aria-label="Скрыть sidebar"
        >
          ←
        </button>
        <button className="brand" onClick={() => (window.location.hash = "home")}>
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

        <div className="sidebar-section-label">
          <span>Прогресс по курсу</span>
          <small>{trackedProgressRows.length} разделов</small>
        </div>

        <div className="sidebar-progress-list">
          {trackedProgressRows.map(({ chapter, progress }) => (
            <SidebarProgressItem
              key={chapter.id}
              chapter={chapter}
              route={route}
              progress={progress}
              snapshot={learningSnapshot}
            />
          ))}
        </div>

        <div className="sidebar-section-label sidebar-section-label-all">
          <span>Все разделы</span>
          <small>{chapters.length}</small>
        </div>

        <div className="chapter-list">
          {chapters.map((chapter) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              route={route}
              snapshot={learningSnapshot}
            />
          ))}
        </div>
      </aside>

      {sidebarCollapsed && (
        <button
          className="sidebar-reopen"
          onClick={() => setSidebarCollapsed(false)}
          title="Показать sidebar"
          aria-label="Показать sidebar"
        >
          ☰
        </button>
      )}

      <div className="page-column">
        <header className="topbar topbar-minimal">
          <button
            className="mobile-menu"
            onClick={() => {
              if (sidebarCollapsed) {
                setSidebarCollapsed(false);
                setSidebarOpen(true);
              } else {
                setSidebarOpen((value) => !value);
              }
            }}
          >
            ☰
          </button>
          <CommandPalette />
          <div className="topbar-spacer" />
          <div className="topbar-course-progress" title="Общий прогресс по отслеживаемым разделам">
            <span>COURSE</span>
            <i><b style={{ width: courseProgress + "%" }} /></i>
            <strong>{courseProgress}%</strong>
          </div>
          <SettingsPanel />
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
              <Suspense
                fallback={
                  <div className="route-loading" role="status">
                    <span />
                    <strong>Загружаю модуль…</strong>
                  </div>
                }
              >
                {route === "home" ? (
                  <HomePage
                    progress={courseProgress}
                    resumeTopic={
                      resumeTopic
                        ? {
                            id: resumeTopic.id,
                            number: resumeTopic.number,
                            title: resumeTopic.title,
                          }
                        : undefined
                    }
                  />
                ) : route === "map" ? (
                  <CourseMap />
                ) : topic ? (
                  <TopicPage topic={topic} />
                ) : (
                  <section className="not-found">
                    <div className="eyebrow">404 / UNKNOWN TOPIC</div>
                    <h1>Такой темы пока нет.</h1>
                    <button onClick={() => (window.location.hash = "map")}>Открыть карту</button>
                  </section>
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
