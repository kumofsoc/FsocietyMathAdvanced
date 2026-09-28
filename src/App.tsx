import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { chapters, topicList, topics } from "./data/course";
import { practiceByTopic } from "./data/practice";
import { CourseMap } from "./components/CourseMap";
import { CustomCursor } from "./components/CustomCursor";
import { HomePage } from "./components/HomePage";
import { MathBackdrop } from "./components/MathBackdrop";
import { ScrollProgress } from "./components/ScrollProgress";
import { SettingsPanel } from "./components/SettingsPanel";
import { TopicPage } from "./components/TopicPage";
import { LEARNING_EVENT, loadSet, SOLVED_KEY, THEORY_KEY } from "./lib/learning";

function routeFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  return raw || "home";
}

function topicProgress(id: string) {
  const theory = loadSet(THEORY_KEY).has(id) ? 50 : 0;
  const tasks = practiceByTopic[id] ?? [];
  if (!tasks.length) return theory;
  const solved = loadSet(SOLVED_KEY);
  const practice = tasks.filter((task) => solved.has(task.id)).length / tasks.length;
  return Math.round(theory + practice * 50);
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [learningVersion, setLearningVersion] = useState(0);
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

  const linearIds = useMemo(
    () => chapters.find((chapter) => chapter.id === "linear")?.topicIds ?? [],
    [],
  );

  const linearProgress = useMemo(() => {
    if (!linearIds.length) return 0;
    return Math.round(linearIds.reduce((sum, id) => sum + topicProgress(id), 0) / linearIds.length);
  }, [linearIds, learningVersion]);

  const topic = topics[route];

  return (
    <div className="app-shell">
      <ScrollProgress />
      <MathBackdrop />
      <CustomCursor />

      <aside className={"sidebar " + (sidebarOpen ? "open" : "")}>
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

        <div className="sidebar-progress">
          <div>
            <span>Линейная алгебра</span>
            <strong>{linearProgress}%</strong>
          </div>
          <div className="progress-track"><i style={{ width: linearProgress + "%" }} /></div>
          <small>50% теория + 50% практика по каждой теме</small>
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
                  const progress = item.chapterId === "linear" ? topicProgress(id) : 0;
                  return (
                    <button
                      key={id}
                      className={route === id ? "active" : ""}
                      onClick={() => (window.location.hash = id)}
                      title={item.chapterId === "linear" ? "Освоение: " + progress + "%" : undefined}
                    >
                      <span>{item.chapterId === "linear" ? (progress >= 100 ? "●" : progress > 0 ? "◐" : "○") : "·"}</span>
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
        <header className="topbar topbar-minimal">
          <button className="mobile-menu" onClick={() => setSidebarOpen((value) => !value)}>
            ☰
          </button>
          <div className="topbar-spacer" />
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
              {route === "home" ? (
                <HomePage progress={linearProgress} />
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
