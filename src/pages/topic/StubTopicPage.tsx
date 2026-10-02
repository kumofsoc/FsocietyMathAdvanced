import { chapters, topicMeta } from "@/data/courseMeta";
import { isTrackedTopic } from "@/lib/progress";

export function StubTopicPage({ topicId }: { topicId: string }) {
  const topic = topicMeta[topicId];
  const chapter = chapters.find((item) => item.id === topic.chapterId);
  const sequence = chapters.flatMap((item) => item.topicIds);
  const position = sequence.indexOf(topicId);
  const previous = position > 0 ? topicMeta[sequence[position - 1]] : undefined;
  const next =
    position >= 0 && position < sequence.length - 1
      ? topicMeta[sequence[position + 1]]
      : undefined;

  return (
    <div className="stub-topic-page">
      <header className="stub-topic-hero">
        <div className="eyebrow">
          ROADMAP / ГЛАВА {chapter?.number} / § {topic.number}
        </div>
        <div className="stub-topic-title-row">
          <div>
            <span className="stub-topic-status">PLANNED</span>
            <h1>{topic.title}</h1>
            <p>{topic.summary}</p>
          </div>
          <div className="stub-topic-index">
            <strong>{topic.number}</strong>
            <span>следующий слой курса</span>
          </div>
        </div>
      </header>

      <section className="stub-topic-grid">
        <article>
          <span>01 / СТАТУС</span>
          <h2>Каркас уже встроен в граф курса.</h2>
          <p>
            Маршрут, зависимости и место в программе существуют. Полная теория,
            доказательства, визуализации и практика ещё не считаются готовыми,
            поэтому эта тема не увеличивает процент освоения.
          </p>
        </article>

        <article>
          <span>02 / БУДУЩАЯ СТРУКТУРА</span>
          <h2>Не заглушка из двух абзацев, а полноценная тема.</h2>
          <div className="stub-pipeline">
            {[
              "Определения",
              "Свойства",
              "Теоремы",
              "Доказательства",
              "Примеры",
              "Визуализации",
              "Практика",
            ].map((item, index) => (
              <div key={item}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="stub-prerequisites">
        <div>
          <span>PREREQUISITES</span>
          <h2>Что должно быть под ногами.</h2>
        </div>
        <div className="stub-prerequisite-list">
          {topic.prerequisites.length ? (
            topic.prerequisites.map((id) => {
              const prerequisite = topicMeta[id];
              if (!prerequisite) return null;
              return (
                <button key={id} onClick={() => (window.location.hash = id)}>
                  <span>{isTrackedTopic(id) ? "READY" : "PLANNED"}</span>
                  <strong>{prerequisite.title}</strong>
                  <small>§ {prerequisite.number}</small>
                </button>
              );
            })
          ) : (
            <div className="stub-no-prerequisites">Прямых prerequisites нет.</div>
          )}
        </div>
      </section>

      <nav className="stub-neighbor-nav">
        <button
          disabled={!previous}
          onClick={() => previous && (window.location.hash = previous.id)}
        >
          <span>← Назад</span>
          <strong>{previous?.title ?? "Начало курса"}</strong>
        </button>
        <button
          disabled={!next}
          onClick={() => next && (window.location.hash = next.id)}
        >
          <span>Дальше →</span>
          <strong>{next?.title ?? "Конец курса"}</strong>
        </button>
      </nav>
    </div>
  );
}
