import { useMemo, useState } from "react";
import { practiceByTopic } from "../data/practice";
import { loadSet, saveSet, SOLVED_KEY } from "../lib/learning";
import type { PracticeTask } from "../types/course";
import { RichMatrixText } from "./MatrixNotation";

type DifficultyFilter = "all" | "base" | "medium" | "hard";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ");
}

function difficultyLabel(task: PracticeTask) {
  if (task.difficulty === "hard") return "HARD";
  if (task.difficulty === "medium") return "MEDIUM";
  return "BASE";
}

function TaskCard({
  task,
  solved,
  onSolved,
}: {
  task: PracticeTask;
  solved: boolean;
  onSolved: (id: string) => void;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong" | "right">(
    solved ? "right" : "idle",
  );
  const [hint, setHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const check = () => {
    if (!value.trim()) return;
    const right = normalize(value) === normalize(task.answer);
    setAttempts((count) => count + 1);
    setStatus(right ? "right" : "wrong");
    if (right) onSolved(task.id);
  };

  const choose = (option: string) => {
    setValue(option);
    if (status !== "right") setStatus("idle");
  };

  return (
    <article
      className={
        "practice-card " +
        status +
        (solved ? " solved" : "") +
        " difficulty-" +
        (task.difficulty ?? "base")
      }
    >
      <div className="practice-card-head">
        <div>
          <span>{difficultyLabel(task)}</span>
          <h3>{task.title}</h3>
        </div>
        <b aria-label={solved || status === "right" ? "Решено" : "Не решено"}>
          {solved || status === "right" ? "✓" : "○"}
        </b>
      </div>

      <p><RichMatrixText text={task.prompt} /></p>

      {task.type === "choice" && task.options ? (
        <div className="practice-options">
          {task.options.map((option, index) => (
            <button
              key={option}
              className={value === option ? "selected" : ""}
              onClick={() => choose(option)}
              aria-pressed={value === option}
            >
              <kbd>{index + 1}</kbd>
              <span><RichMatrixText text={option} /></span>
            </button>
          ))}
        </div>
      ) : (
        <input
          className="practice-input"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (status !== "right") setStatus("idle");
          }}
          placeholder="Ответ"
          onKeyDown={(event) => event.key === "Enter" && check()}
          inputMode={task.type === "number" ? "decimal" : "text"}
        />
      )}

      <div className="practice-actions">
        <button className="practice-check" onClick={check} disabled={!value.trim()}>
          {status === "right" ? "Проверено" : "Проверить"}
        </button>
        {task.hint && (
          <button
            className="practice-hint-button"
            onClick={() => setHint((state) => !state)}
            aria-expanded={hint}
          >
            {hint ? "Скрыть подсказку" : "Подсказка"}
          </button>
        )}
        {attempts > 0 && (
          <span className="practice-attempts">
            попыток: {attempts}
          </span>
        )}
      </div>

      {hint && task.hint && <div className="practice-hint">{task.hint}</div>}
      {status === "wrong" && (
        <div className="practice-feedback bad">
          Пока нет. Проверь вычисления и попробуй ещё.
        </div>
      )}
      {status === "right" && (
        <div className="practice-feedback good">
          Верно. Задача засчитана в практику.
        </div>
      )}
    </article>
  );
}

export function PracticePanel({ topicId }: { topicId: string }) {
  const tasks = practiceByTopic[topicId] ?? [];
  const [solved, setSolved] = useState<Set<string>>(() => loadSet(SOLVED_KEY));
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [hideSolved, setHideSolved] = useState(false);

  const completed = useMemo(
    () => tasks.filter((task) => solved.has(task.id)).length,
    [tasks, solved],
  );

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const taskDifficulty = task.difficulty ?? "base";
        if (difficulty !== "all" && taskDifficulty !== difficulty) return false;
        if (hideSolved && solved.has(task.id)) return false;
        return true;
      }),
    [tasks, solved, difficulty, hideSolved],
  );

  const counts = useMemo(() => ({
    base: tasks.filter((task) => (task.difficulty ?? "base") === "base").length,
    medium: tasks.filter((task) => task.difficulty === "medium").length,
    hard: tasks.filter((task) => task.difficulty === "hard").length,
  }), [tasks]);

  if (tasks.length === 0) {
    return (
      <section className="practice-panel practice-empty">
        <div className="eyebrow">ПРАКТИКА</div>
        <h2>Практика для этой темы ещё готовится.</h2>
        <p>
          Теоретический материал уже доступен. Когда банк задач будет подключён,
          практический прогресс начнёт отражать самостоятельное применение методов
          этой темы.
        </p>
      </section>
    );
  }

  const markSolved = (id: string) => {
    setSolved((current) => {
      const next = new Set(current);
      next.add(id);
      saveSet(SOLVED_KEY, next);
      return next;
    });
  };

  const resetTopicProgress = () => {
    const ids = new Set(tasks.map((task) => task.id));
    setSolved((current) => {
      const next = new Set([...current].filter((id) => !ids.has(id)));
      saveSet(SOLVED_KEY, next);
      return next;
    });
  };

  const percent = Math.round((completed / tasks.length) * 100);

  return (
    <section className="practice-panel">
      <header className="practice-header">
        <div>
          <div className="eyebrow">ПРАКТИКА / ПРОВЕРКА ОСВОЕНИЯ</div>
          <h2>Проверь, превратились ли формулы в рабочий инструмент.</h2>
          <p>
            Теоретический проход фиксирует знакомство с материалом. Практический
            прогресс растёт только после правильных решений — он показывает, можешь
            ли ты применить определения, свойства и методы без готового хода решения.
          </p>
        </div>
        <div className="practice-score">
          <strong>{completed}/{tasks.length}</strong>
          <span>решено · {percent}%</span>
        </div>
      </header>

      <div className="practice-progress-line" aria-label={"Практика " + percent + "%"}>
        <i style={{ width: percent + "%" }} />
      </div>

      <div className="practice-toolbar">
        <div className="practice-filters" aria-label="Сложность">
          {([
            ["all", "Все", tasks.length],
            ["base", "Base", counts.base],
            ["medium", "Medium", counts.medium],
            ["hard", "Hard", counts.hard],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              className={difficulty === id ? "active" : ""}
              onClick={() => setDifficulty(id)}
            >
              {label}
              <b>{count}</b>
            </button>
          ))}
        </div>

        <div className="practice-toolbar-actions">
          <button
            className={hideSolved ? "active" : ""}
            onClick={() => setHideSolved((value) => !value)}
            aria-pressed={hideSolved}
          >
            {hideSolved ? "Показать решённые" : "Только нерешённые"}
          </button>
          {completed > 0 && (
            <button className="practice-reset" onClick={resetTopicProgress}>
              Сбросить тему
            </button>
          )}
        </div>
      </div>

      <div className="practice-bank-meta">
        <span>Показано {visibleTasks.length} из {tasks.length}</span>
        <span>BASE {counts.base}</span>
        <span>MEDIUM {counts.medium}</span>
        <span>HARD {counts.hard}</span>
      </div>

      {visibleTasks.length ? (
        <div className="practice-grid">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id + "-" + (solved.has(task.id) ? "solved" : "open")}
              task={task}
              solved={solved.has(task.id)}
              onSolved={markSolved}
            />
          ))}
        </div>
      ) : (
        <div className="practice-filter-empty">
          <strong>В этом режиме задач не осталось.</strong>
          <p>Смени сложность или снова покажи решённые задачи.</p>
          <button
            onClick={() => {
              setDifficulty("all");
              setHideSolved(false);
            }}
          >
            Показать весь банк
          </button>
        </div>
      )}
    </section>
  );
}
