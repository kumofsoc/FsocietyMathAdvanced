const modules = [
  {
    code: "01",
    title: "Понятная теория",
    copy: "Сначала интуитивная модель и смысл объекта, затем строгие определения, свойства, теоремы и доказательства.",
    action: "start",
  },
  {
    code: "02",
    title: "Академическая глубина",
    copy: "Темы раскладываются на независимые слои: формализм, доказательства, контрпримеры, связи, приложения и расширения.",
    action: "academy",
  },
  {
    code: "03",
    title: "Карта знаний",
    copy: "Prerequisites и учебный маршрут видны как единая топология курса, а не как список из десятков несвязанных страниц.",
    action: "map",
  },
  {
    code: "04",
    title: "Визуализации",
    copy: "Матрицы, векторы, поверхности, поля и преобразования можно увидеть как геометрические объекты и процессы.",
    action: "start",
  },
  {
    code: "05",
    title: "Практика",
    copy: "Задачи разделяются по типам навыков: вычисление, выбор метода, объяснение, доказательство, контрпример и сложные смешанные задачи.",
    action: "start",
  },
  {
    code: "06",
    title: "Прогресс",
    copy: "Освоение учитывает чтение смысловых блоков, завершение теории и самостоятельное решение задач, а не простой скролл.",
    action: "account",
  },
  {
    code: "07",
    title: "Краткий конспект",
    copy: "Отдельный режим для быстрого повторения определений, ключевых утверждений и формул без длинного учебного маршрута.",
    action: "review",
  },
  {
    code: "08",
    title: "Линейная математика",
    copy: "Углублённый маршрут по линейной алгебре и геометрии: доказательства, сложные задачи, визуальные лаборатории и связи между темами.",
    action: "academy",
  },
  {
    code: "09",
    title: "Платформа фундаментальных наук",
    copy: "Архитектура уже отделяет дисциплину от учебного ядра: математика — первая активная область, а физика и другие науки смогут подключать модели, законы, эксперименты и симуляции без переписывания платформы.",
    action: "map",
  },
] as const;

type Action = (typeof modules)[number]["action"];

export function HomeSiteOverview({
  onAction,
}: {
  onAction: (action: Action) => void;
}) {
  return (
    <section className="future-scene future-overview" data-home-scene="about">
      <div className="future-overview-head" data-reveal>
        <div className="future-kicker">
          <span>ЧТО ТАКОЕ VISUALMATH</span>
          <i>ОБЗОР ПРОДУКТА</i>
        </div>
        <h2>
          Вышмат,
          <br />
          который <em>можно понять.</em>
        </h2>
        <p>
          VisualMath соединяет понятное объяснение, строгую математику,
          визуализацию, практику и карту зависимостей. Глубина курса не прячется,
          но и не мешает сначала увидеть основную идею.
        </p>
      </div>

      <div className="future-overview-grid">
        {modules.map((module) => (
          <button
            key={module.code}
            className="future-overview-card"
            data-reveal
            onClick={() => onAction(module.action)}
          >
            <span>{module.code}</span>
            <div>
              <strong>{module.title}</strong>
              <p>{module.copy}</p>
            </div>
            <b>↗</b>
          </button>
        ))}
      </div>

      <div className="future-overview-footer" data-reveal>
        <span>23 РАЗДЕЛА</span>
        <span>80+ ТЕМ</span>
        <span>ТЕОРИЯ + ПРАКТИКА</span>
        <span>ИНТЕРАКТИВНАЯ КАРТА</span>
        <span>ПЕРСОНАЛЬНЫЙ ПРОГРЕСС</span>
        <span>ГОТОВО К НОВЫМ НАУКАМ</span>
      </div>
    </section>
  );
}
