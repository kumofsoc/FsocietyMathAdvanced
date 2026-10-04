import { chapters, topicListMeta } from "@/data/courseMeta";
import { courseSearchIndex } from "@/data/courseSearchIndex";

export function HomeGrowthScene() {
  const data = [
    { label: "РАЗДЕЛЫ", value: chapters.length },
    {
      label: "ТЕМЫ",
      value: topicListMeta.filter((topic) => !topic.isStub).length,
    },
    { label: "БЛОКИ", value: courseSearchIndex.length },
  ] as const;

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = 80 + (index / Math.max(1, data.length - 1)) * 760;
    const y = 390 - (item.value / maxValue) * 280;
    return { ...item, x, y };
  });
  const path = points
    .map(
      (point, index) =>
        (index ? "L" : "M") + point.x + " " + point.y,
    )
    .join(" ");

  const topics = data[1].value;
  const blocks = data[2].value;

  return (
    <section className="future-scene future-growth" data-home-scene="growth">
      <div className="growth-giant-year" data-parallax aria-hidden="true">
        COURSE
      </div>
      <div className="future-growth-copy" data-reveal>
        <div className="future-kicker">
          <span>CONTENT SYSTEM</span>
          <i>LIVE COURSE DATA</i>
        </div>
        <h2>
          Курс растёт
          <br />
          <em>в глубину.</em>
        </h2>
        <div className="growth-metrics">
          <div>
            <strong>{blocks.toLocaleString("ru-RU")}</strong>
            <span>индексируемых блоков</span>
          </div>
          <div>
            <strong>{topics}</strong>
            <span>реальных тем курса</span>
          </div>
          <div>
            <strong>{chapters.length}</strong>
            <span>разделов в структуре</span>
          </div>
        </div>
      </div>

      <div className="future-growth-visual" data-reveal>
        <svg
          viewBox="0 0 920 470"
          role="img"
          aria-label="Текущий объём содержимого курса VisualMath"
        >
          <g className="growth-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <line
                key={"v" + index}
                x1={70 + index * 110}
                y1="55"
                x2={70 + index * 110}
                y2="410"
              />
            ))}
            {Array.from({ length: 6 }, (_, index) => (
              <line
                key={"h" + index}
                x1="50"
                y1={70 + index * 68}
                x2="880"
                y2={70 + index * 68}
              />
            ))}
          </g>
          <path className="growth-path-shadow" d={path} />
          <path className="growth-path" d={path} />
          {points.map((point) => (
            <g key={point.label} className="growth-node">
              <circle cx={point.x} cy={point.y} r="8" />
              <circle
                cx={point.x}
                cy={point.y}
                r="24"
                className="pulse"
              />
              <text
                x={point.x}
                y={point.y - 26}
                textAnchor="middle"
              >
                {point.value.toLocaleString("ru-RU")}
              </text>
              <text
                x={point.x}
                y="438"
                textAnchor="middle"
                className="year"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="growth-demo-stamp">
          GENERATED FROM CURRENT COURSE INDEX
        </div>
      </div>
    </section>
  );
}
