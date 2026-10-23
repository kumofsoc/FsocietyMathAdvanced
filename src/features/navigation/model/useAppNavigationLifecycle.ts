import { useEffect, useRef, useState } from "react";
import { getHistoryHotkeyDirection } from "@/features/navigation/model/historyHotkeys";
import { parseVisualMathHash } from "@/shared/lib/blockDeepLink";

const ROUTE_SCROLL_KEY = "fsociety-route-scroll-v1";

function routeFromHash() {
  return parseVisualMathHash(window.location.hash).route;
}

/**
 * Route names come from a URL fragment and are not trusted object-property keys.
 * A Map safely supports any hash, including "__proto__" or "constructor".
 * Persist the original JSON object format for backwards compatibility.
 */
export function readPositions(): Map<string, number> {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(ROUTE_SCROLL_KEY) || "{}");
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map();
    }
    return new Map(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === "number" && Number.isFinite(value) && value >= 0) as Array<[string, number]>,
    );
  } catch {
    return new Map();
  }
}

export function writePositions(positions: Map<string, number>) {
  try {
    sessionStorage.setItem(ROUTE_SCROLL_KEY, JSON.stringify(Object.fromEntries(positions)));
  } catch {
    // Scroll restoration is optional.
  }
}

type Params = {
  readingFocusMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  setReadingFocusMode: (value: boolean) => void;
};

export function useAppNavigationLifecycle({
  readingFocusMode,
  setSidebarOpen,
  setReadingFocusMode,
}: Params) {
  const [route, setRoute] = useState(routeFromHash);
  const routeRef = useRef(route);
  const [topbarVisible, setTopbarVisible] = useState(true);
  const topbarHideTimer = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  const clearTopbarHideTimer = () => {
    if (topbarHideTimer.current === null) return;
    window.clearTimeout(topbarHideTimer.current);
    topbarHideTimer.current = null;
  };

  const revealTopbar = () => {
    clearTopbarHideTimer();
    setTopbarVisible(true);
  };

  const scheduleTopbarHide = (delay = 700) => {
    clearTopbarHideTimer();
    if (window.scrollY < 72 && routeRef.current !== "map") return;
    topbarHideTimer.current = window.setTimeout(() => {
      setTopbarVisible(false);
      topbarHideTimer.current = null;
    }, delay);
  };

  const openHomeAtTop = () => {
    const positions = readPositions();
    positions.set("home", 0);
    writePositions(positions);

    if (routeRef.current === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.location.hash = "home";
  };

  useEffect(() => {
    const onHash = () => {
      const positions = readPositions();
      positions.set(routeRef.current, window.scrollY);
      writePositions(positions);

      const next = routeFromHash();
      const routeChanged = next !== routeRef.current;
      setRoute(next);
      routeRef.current = next;
      setSidebarOpen(false);
      if (routeChanged) {
        setReadingFocusMode(false);
      }

      window.requestAnimationFrame(() => {
        const y = positions.get(next) ?? 0;
        window.scrollTo({ top: y, behavior: y > 0 ? "auto" : "smooth" });
      });
    };

    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setReadingFocusMode, setSidebarOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastScrollY.current;

      if (nextY < 32) {
        revealTopbar();
      } else if (delta > 8) {
        clearTopbarHideTimer();
        setTopbarVisible(false);
      } else if (delta < -8) {
        revealTopbar();
        scheduleTopbarHide(1100);
      }

      lastScrollY.current = nextY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTopbarHideTimer();
    };
  }, []);

  useEffect(() => {
    revealTopbar();
    if (route === "map") {
      scheduleTopbarHide(1200);
    }
  }, [route]);

  useEffect(() => {
    if (readingFocusMode) {
      setSidebarOpen(false);
      clearTopbarHideTimer();
      setTopbarVisible(false);
      return;
    }

    revealTopbar();
  }, [readingFocusMode, setSidebarOpen]);

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

  return {
    route,
    topbarVisible,
    openHomeAtTop,
    revealTopbar,
    scheduleTopbarHide,
  };
}
