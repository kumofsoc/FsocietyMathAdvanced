import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { chapters, topicListMeta, topicMeta } from "@/data/courseMeta";
import { BackgroundMusicPlayer } from "@/features/background-music/ui/BackgroundMusicPlayer";
import { CommandPalette } from "@/features/navigation/ui/CommandPalette";
import { CustomCursor } from "@/features/personalization/ui/CustomCursor";
import { HistoryDock } from "@/features/navigation/ui/HistoryDock";
import { SidebarTopicToc } from "@/features/navigation/ui/SidebarTopicToc";
import { MathBackdrop } from "@/shared/ui/MathBackdrop";
import { RouteSkeleton } from "@/shared/ui/RouteSkeleton";
import { ScrollProgress } from "@/features/navigation/ui/ScrollProgress";
import { BackToTop } from "@/features/navigation/ui/BackToTop";
import { SettingsPanel } from "@/features/personalization/ui/SettingsPanel";
import { StubTopicPage } from "@/pages/topic/StubTopicPage";
import { LEARNING_EVENT } from "@/features/learning/model/learning";
import {
  getChapterProgress,
  getCourseProgress,
  getLearningSnapshot,
  getTopicProgress,
  isTrackedChapter,
} from "@/features/learning/model/progress";
import type { Chapter } from "@/entities/course/model/types";
import { useAppShellStore } from "@/app/store/useAppShellStore";
import { loadSavedTopicIds, SAVED_TOPICS_EVENT, SAVED_TOPICS_KEY, setTopicSaved } from "@/features/saved-topics/model/savedTopics";
import { installAuthSessionListener, useAuthStore } from "@/features/auth/model/authSession";
import { installUserStateAutoSync } from "@/features/sync/model/autoSync";
import { useAppNavigationLifecycle } from "@/features/navigation/model/useAppNavigationLifecycle";

const LAST_TOPIC_KEY = "fsociety-last-topic-v1";

const HomePage = lazy(() =>
  import("@/pages/home/HomePage").then((module) => ({ default: module.HomePage })),
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
const MyMarksPage = lazy(() =>
  import("@/pages/marks/MyMarksPage").then((module) => ({
    default: module.MyMarksPage,
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
const preloadMyMarks = () => {
  void import("@/pages/marks/MyMarksPage");
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
    <section className={"sidebar-progress-item " + (open ? "open " : "") + (containsRoute ? "current" : "")}>
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
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const sidebarOpen = useAppShellStore((state) => state.sidebarOpen);
  const sidebarCollapsed = useAppShellStore((state) => state.sidebarCollapsed);
  const readingFocusMode = useAppShellStore((state) => state.readingFocusMode);
  const sidebarTopicToc = useAppShellStore((state) => state.sidebarTopicToc);
  const activeSidebarTopicTocKey = useAppShellStore((state) => state.activeSidebarTopicTocKey);
  const setSidebarOpen = useAppShellStore((state) => state.setSidebarOpen);
  const setSidebarCollapsed = useAppShellStore((state) => state.setSidebarCollapsed);
  const setReadingFocusMode = useAppShellStore((state) => state.setReadingFocusMode);
  const [learningVersion, setLearningVersion] = useState(0);
  const [savedTopicIds, setSavedTopicIds] = useState(loadSavedTopicIds);
  const [lastTopicId, setLastTopicId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_TOPIC_KEY);
      return stored && topicMeta[stored] && !topicMeta[stored].isStub ? stored : null;
    } catch {
      return null;
    }
  });
  const {
    route,
    topbarVisible,
    openHomeAtTop,
    revealTopbar,
    scheduleTopbarHide,
  } = useAppNavigationLifecycle({
    readingFocusMode,
    setSidebarOpen,
    setReadingFocusMode,
  });
  const mainContentRef = useRef<HTMLElement>(null);
  const routeFocusReadyRef = useRef(false);

  useEffect(() => {
    installAuthSessionListener();
    installUserStateAutoSync();
    void bootstrapAuth();
  }, [bootstrapAuth]);


  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void import("@/entities/course/lib/courseIntegrity").then(({ reportCourseIntegrity }) => {
      reportCourseIntegrity();
    });
  }, []);

  useEffect(() => {
    const current = topicMeta[route];
    if (!current || current.isStub) return;
    try {
      localStorage.setItem(LAST_TOPIC_KEY, route);
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
    const syncSavedTopics = () => setSavedTopicIds(loadSavedTopicIds());
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_TOPICS_KEY) syncSavedTopics();
    };

    window.addEventListener(SAVED_TOPICS_EVENT, syncSavedTopics);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SAVED_TOPICS_EVENT, syncSavedTopics);
      window.removeEventListener("storage", onStorage);
    };
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

  const savedTopics = useMemo(
    () =>
      savedTopicIds
        .map((id) => topicMeta[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item && !item.isStub)),
    [savedTopicIds],
  );

  const topic = topicMeta[route];
  const resumeTopic = lastTopicId ? topicMeta[lastTopicId] : undefined;
  const currentChapter = topic
    ? chapters.find((chapter) => chapter.id === topic.chapterId)
    : undefined;

  const routeContext =
    route === "home"
      ? { section: "MathMaMath", current: "Главная" }
      : route === "map"
        ? { section: "Навигация", current: "Карта курса" }
        : route === "academy"
          ? { section: "Курс", current: "Линейная математика" }
          : route === "review"
            ? { section: "Повторение", current: "Краткий конспект" }
            : route === "marks"
              ? { section: "Личное", current: "Мои отметки" }
              : route === "account"
              ? { section: "Аккаунт", current: "Профиль" }
              : topic
                ? {
                    section: currentChapter?.title ?? "Курс",
                    current: "§ " + topic.number + " " + topic.title,
                  }
                : { section: "MathMaMath", current: "Страница" };

  const routeSkeletonVariant =
    topic
      ? "topic"
      : route === "map"
        ? "map"
        : route === "review" || route === "marks"
          ? "review"
          : route === "account"
            ? "account"
            : route === "academy"
              ? "academy"
              : "home";

  useEffect(() => {
    document.title = routeContext.current + " · MathMaMath";
    if (!routeFocusReadyRef.current) {
      routeFocusReadyRef.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      mainContentRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route, routeContext.current]);

  return (
    <div
      className={
        "app-shell " +
        (sidebarCollapsed ? "sidebar-collapsed " : "") +
        (readingFocusMode && topic && !topic.isStub ? "reading-focus-mode" : "")
      }
    >
      <a className="skip-to-content" href="#visualmath-main-content">
        Перейти к содержимому
      </a>
      <div className="route-announcer" aria-live="polite" aria-atomic="true">
        {routeContext.current}
      </div>
      <ScrollProgress />
      <BackToTop />
      <MathBackdrop />
      <CustomCursor />
      <BackgroundMusicPlayer />

      {readingFocusMode && topic && !topic.isStub && (
        <button
          type="button"
          className="reading-focus-exit"
          onClick={() => setReadingFocusMode(false)}
          title="Вернуть обычный интерфейс"
        >
          <span aria-hidden="true">×</span>
          <strong>Выйти из фокуса</strong>
        </button>
      )}

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
            <strong>MathMaMath</strong>
            <small>ADVANCED</small>
          </span>
        </button>

        <button
          className={"map-entry " + (route === "map" ? "active" : "")}
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

        <button
          className={"map-entry marks-entry " + (route === "marks" ? "active" : "")}
          onMouseEnter={preloadMyMarks}
          onFocus={preloadMyMarks}
          onClick={() => (window.location.hash = "marks")}
        >
          <span>◆</span>
          Мои отметки
          <b>MY</b>
        </button>

        {topic &&
          !topic.isStub &&
          sidebarTopicToc?.topicId === topic.id && (
            <SidebarTopicToc
              topicId={topic.id}
              topicNumber={topic.number}
              topicTitle={topic.title}
              items={sidebarTopicToc.items}
              activeKey={activeSidebarTopicTocKey}
            />
          )}

        <section className={"sidebar-saved-topics " + (savedTopics.length ? "has-items" : "")}>
          <div className="sidebar-saved-head">
            <span>★ Сохранённые темы</span>
            <small>{savedTopics.length}</small>
          </div>

          {savedTopics.length ? (
            <div className="sidebar-saved-list">
              {savedTopics.map((item) => (
                <div
                  key={item.id}
                  className={"sidebar-saved-row " + (route === item.id ? "active" : "")}
                >
                  <button
                    type="button"
                    className="sidebar-saved-open"
                    onMouseEnter={preloadTopicPage}
                    onFocus={preloadTopicPage}
                    onClick={() => (window.location.hash = item.id)}
                    title={"Открыть: " + item.title}
                  >
                    <span>§ {item.number}</span>
                    <strong>{item.title}</strong>
                  </button>
                  <button
                    type="button"
                    className="sidebar-saved-remove"
                    onClick={() => setTopicSaved(item.id, false)}
                    aria-label={"Убрать из сохранённых: " + item.title}
                    title="Убрать из сохранённых"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="sidebar-saved-empty">
              Сохраняй темы через ☆ на странице материала.
            </p>
          )}
        </section>

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
        <div
          className="topbar-reveal-zone"
          onMouseEnter={revealTopbar}
          aria-hidden="true"
        />
        <header
          className={"topbar topbar-minimal " + (topbarVisible ? "is-visible" : "is-hidden")}
          onMouseEnter={revealTopbar}
          onMouseLeave={() => scheduleTopbarHide()}
        >
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
          <HistoryDock />
          <nav className="topbar-context" aria-label="Текущее положение в курсе">
            <button
              type="button"
              onClick={() => {
                if (topic) {
                  window.location.hash = "map";
                } else {
                  openHomeAtTop();
                }
              }}
              title={topic ? "Открыть карту курса" : "На главную"}
            >
              {routeContext.section}
            </button>
            <span aria-hidden="true">/</span>
            <strong title={routeContext.current}>{routeContext.current}</strong>
          </nav>
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

        <main
          id="visualmath-main-content"
          ref={mainContentRef}
          className="main-content"
          tabIndex={-1}
        >
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
                  <RouteSkeleton
                    variant={routeSkeletonVariant}
                    label={"Загружаю: " + routeContext.current}
                  />
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
                ) : route === "account" ? (
                  <AccountPage progress={courseProgress} snapshot={learningSnapshot} />
                ) : route === "map" ? (
                  <CourseMap />
                ) : route === "academy" ? (
                  <LinearAcademyHub />
                ) : route === "review" ? (
                  <ReviewHub />
                ) : route === "marks" ? (
                  <MyMarksPage />
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
