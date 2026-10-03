import { useEffect, useRef } from "react";
import type { SidebarTopicTocItem } from "@/app/store/useAppShellStore";
import { buildBlockHash } from "@/shared/lib/blockDeepLink";

function progressGlyph(status: SidebarTopicTocItem["status"]) {
  if (status === "complete") return "✓";
  if (status === "partial") return "◐";
  if (status === "unread") return "○";
  return "·";
}

export function SidebarTopicToc({
  topicId,
  topicNumber,
  topicTitle,
  items,
  activeKey,
}: {
  topicId: string;
  topicNumber: string;
  topicTitle: string;
  items: SidebarTopicTocItem[];
  activeKey: string | null;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!activeKey) return;
    navRef.current
      ?.querySelector<HTMLElement>('[data-toc-key="' + activeKey + '"]')
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeKey]);

  if (!items.length) return null;

  return (
    <section className="sidebar-topic-toc" aria-label={"Оглавление темы " + topicTitle}>
      <header>
        <div>
          <span>ТЕКУЩАЯ ТЕМА</span>
          <strong>§ {topicNumber} · {topicTitle}</strong>
        </div>
        <small>{items.length}</small>
      </header>

      <nav ref={navRef}>
        {items.map((item, index) => (
          <button
            key={item.key}
            data-toc-key={item.key}
            type="button"
            className={activeKey === item.key ? "active" : ""}
            onClick={() => {
              window.location.hash = buildBlockHash(topicId, item.blockIndex);
            }}
            aria-current={activeKey === item.key ? "location" : undefined}
            title={"Перейти: " + item.label}
          >
            <span className={"sidebar-topic-toc-state " + (item.status ?? "neutral")}>
              {progressGlyph(item.status)}
            </span>
            <span className="sidebar-topic-toc-copy">
              <em>{String(index + 1).padStart(2, "0")}</em>
              <strong>{item.label}</strong>
            </span>
          </button>
        ))}
      </nav>
    </section>
  );
}
