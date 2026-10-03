import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { getLocalStorageItem, getSessionStorageItem, setLocalStorageItem, setSessionStorageItem } from "@/shared/lib/browserStorage";
import { chapters, topicListMeta, topicMeta } from "@/data/courseMeta";
import { BackgroundMusicPlayer } from "@/features/background-music/ui/BackgroundMusicPlayer";
import { CommandPalette } from "@/features/navigation/ui/CommandPalette";
import { CustomCursor } from "@/features/personalization/ui/CustomCursor";
import { HistoryDock } from "@/features/navigation/ui/HistoryDock";
import { getHistoryHotkeyDirection } from "@/features/navigation/model/historyHotkeys";
import { ScrollProgress } from "@/features/navigation/ui/ScrollProgress";
import { SettingsPanel } from "@/features/personalization/ui/SettingsPanel";
import { StubTopicPage } from "@/pages/topic/StubTopicPage";
import { LEARNING_EVENT } from "@/features/learning/model/learning";
import {
  getChapterProgress,
  getCourseProgress,
  getLearningSnapshot,
  getTopicProgress,
  isTrackedChapter,
  isTrackedTopic,
} from "@/features/learning/model/progress";
import type { Chapter } from "@/entities/course/model/types";
import { useAppShellStore } from "@/app/store/useAppShellStore";
import { MOTION_CHANGE_EVENT, MOTION_PROFILE_KEY, parseMotionProfile } from "@/features/home-experience/model/homeExperience";

const LAST_TOPIC_KEY = "fsociety-last-topic-v1";
const ROUTE_SCROLL_KEY = "fsociety-route-scroll-v1";

function readRouteScrollPositions(): Record<string, number> {
  try {
    const parsed = JSON.parse(getSessionStorageItem(ROUTE_SCROLL_KEY) || "{}") as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
        .map(([route, value]) => [route, Math.max(0, Number(value))]),
    );
  } catch {
    return {};
  }
}

function writeRouteScrollPosition(route: string, y: number) {
  const positions = readRouteScrollPositions();
  positions[route] = Math.max(0, y);
  setSessionStorageItem(ROUTE_SCROLL_KEY, JSON.stringify(positions));
}

function RouteScrollRestorer({ route }: { route: string }) {
  useEffect(() => {
    const y = readRouteScrollPositions()[route] ?? 0;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route]);

  return null;
}

function shouldLoadMathBackdrop() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return parseMotionProfile(getLocalStorageItem(MOTION_PROFILE_KEY)) !== "off";
}

function DeferredMathBackdrop() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;

    const refresh = () => {
      window.clearTimeout(timer);
      if (!shouldLoadMathBackdrop()) {
        setReady(false);
        return;
      }

      // Keep the ~900 KB Three.js vendor chunk off the critical first render.
      timer = window.setTimeout(() => setReady(true), 220);
    };

    refresh();
    window.addEventListener(MOTION_CHANGE_EVENT, refresh);
    media.addEventListener("change", refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(MOTION_CHANGE_EVENT, refresh);
      media.removeEventListener("change", refresh);
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <MathBackdrop />
    </Suspense>
  );
}

function routeFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  return raw || "home";
}

const HomePage = lazy(() =>
  import("@/pages/home/HomePage").then((module) => ({ default: module.HomePage })),
);
const MathBackdrop = lazy(() =>
  import("@/shared/ui/MathBackdrop").then((module) => ({ default: module.MathBackdrop })),
);
const AccountPage = lazy(() =>
  import("@/pages/account/AccountPage").then((module) => ({ default: module.AccountPage })),
);
const CourseMap = lazy(() =>
  import("@/pages/course-map/CourseMap").then((module) => ({ default: module.CourseMap })),
);
const LinearAcademyHub = lazy(() =>
  import("@/pages/linear-academy/LinearAcademyHub").then((module) => ({
    default: module.LinearAcademyHub,
  })),
);
const ReviewHub = lazy(() =>
  import("@/pages/review/ReviewHub").then((module) => ({
    default: module.ReviewHub,
  })),
);
const TopicPage = lazy(() =>
  import("@/pages/topic/TopicPage").then((module) => ({ default: module.TopicPage })),
);

const preloadAccountPage = () => {
  void import("@/pages/account/AccountPage");
};
const preloadTopicPage = () => {
  void import("@/pages/topic/TopicPage");
};
const preloadCourseMap = () => {
  void import("@/pages/course-map/CourseMap");
};
const preloadLinearAcademy = () => {
  void import("@/pages/linear-academy/LinearAcademyHub");
};
const preloadReviewHub = () => {
  void import("@/pages/review/ReviewHub");
};

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
                const item = topicMeta[id];
                if (!item) return null;
                const value = getTopicProgress(id, snapshot);
                return (
                  <button
                    key={id}
                    className={(route === id ? "active " : "") + (item.isStub ? "planned" : "")}
                    onMouseEnter={() => !item.isStub && preloadTopicPage()}
                    onFocus={() => !item.isStub && preloadTopicPage()}
                    onClick={() => (window.location.hash = id)}
                  >
                    <span className="sidebar-topic-state">
                      {item.isStub ? "◇" : value >= 100 ? "●" : value > 0 ? "◐" : "○"}
                    </span>
                    <span className="sidebar-topic-copy">
                      <em>§ {item.number}</em>
                      <strong>{item.title}</strong>
                    </span>
                    <span className="sidebar-topic-progress">
                      {item.isStub ? "PLAN" : value + "%"}
                    </span>
                  </button>
                );
              })}
            </div>
            <small className="sidebar-progress-note">
              Материал → завершение теории → практика → освоение темы
            </small>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const sidebarOpen = useAppShellStore((state) => state.sidebarOpen);
  const sidebarCollapsed = useAppShellStore((state) => state.sidebarCollapsed);
  const setSidebarOpen = useAppShellStore((state) => state.setSidebarOpen);
  const setSidebarCollapsed = useAppShellStore((state) => state.setSidebarCollapsed);
  const [learningVersion, setLearningVersion] = useState(0);
  const [lastTopicId, setLastTopicId] = useState<string | null>(() => {
    try {
      const stored = getLocalStorageItem(LAST_TOPIC_KEY);
      return stored && topicMeta[stored] && !topicMeta[stored].isStub ? stored : null;
    } catch {
      return null;
    }
  });
  const routeRef = useRef(route);

  const openHomeAtTop = () => {
    writeRouteScrollPosition("home", 0);

    if (routeRef.current === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.location.hash = "home";
  };

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void import("@/entities/course/lib/courseIntegrity").then(({ reportCourseIntegrity }) => {
      reportCourseIntegrity();
    });
  }, []);

  useEffect(() => {
    const onHash = () => {
      writeRouteScrollPosition(routeRef.current, window.scrollY);

      const next = routeFromHash();
      setRoute(next);
      routeRef.current = next;
      setSidebarOpen(false);
    };

    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setSidebarOpen]);

  useEffect(() => {
    const current = topicMeta[route];
    if (!current || current.isStub) return;
    try {
      setLocalStorageItem(LAST_TOPIC_KEY, route);
      setLastTopicId(route);
    } catch {
      // Resume state is optional.
    }
  }, [route]);

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
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = getHistoryHotkeyDirection(event);
      if (!direction) return;
      event.preventDefault();
      if (direction < 0) window.history.back();
      else window.history.forward();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  const topic = topicMeta[route];
  const resumeTopic = lastTopicId ? topicMeta[lastTopicId] : undefined;

  return (
    <div className={"app-shell " + (sidebarCollapsed ? "sidebar-collapsed" : "")}>
      <ScrollProgress />
      <DeferredMathBackdrop />
      <CustomCursor />
      {route === "home" && <HistoryDock />}
      <BackgroundMusicPlayer />

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
        <button className="brand" onClick={openHomeAtTop}>
          <span className="brand-mark">∑</span>
          <span>
            <strong>VisualMath</strong>
            <small>ADVANCED</small>
          </span>
        </button>

        <button
          className="map-entry"
          onMouseEnter={preloadCourseMap}
          onFocus={preloadCourseMap}
          onClick={() => (window.location.hash = "map")}
        >
          <span>◌</span>
          Карта курса
          <b>{topicListMeta.length}</b>
        </button>

        <button
          className={"map-entry academy-entry " + (route === "academy" ? "active" : "")}
          onMouseEnter={preloadLinearAcademy}
          onFocus={preloadLinearAcademy}
          onClick={() => (window.location.hash = "academy")}
        >
          <span>λ</span>
          Линейная математика
          <b>КУРС</b>
        </button>

        <button
          className={"map-entry review-entry " + (route === "review" ? "active" : "")}
          onMouseEnter={preloadReviewHub}
          onFocus={preloadReviewHub}
          onClick={() => (window.location.hash = "review")}
        >
          <span>≡</span>
          Краткий конспект
          <b>REVIEW</b>
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
          <button
            className={"topbar-account " + (route === "account" ? "active" : "")}
            onMouseEnter={preloadAccountPage}
            onFocus={preloadAccountPage}
            onClick={() => (window.location.hash = "account")}
          >
            <span>VM</span>
            <strong>Профиль</strong>
          </button>
          <SettingsPanel />
        </header>

        <main className="main-content">
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
                <RouteScrollRestorer route={route} />
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
                ) : route === "account" ? (
                  <AccountPage progress={courseProgress} snapshot={learningSnapshot} />
                ) : route === "map" ? (
                  <CourseMap />
                ) : route === "academy" ? (
                  <LinearAcademyHub />
                ) : route === "review" ? (
                  <ReviewHub />
                ) : topic?.isStub ? (
                  <StubTopicPage topicId={topic.id} />
                ) : topic ? (
                  <TopicPage topicId={topic.id} />
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
