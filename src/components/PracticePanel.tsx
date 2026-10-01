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

function parseSimpleNumber(value: string) {
  const normalized = normalize(value).replace(/\s/g, "");

  if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/.test(normalized)) {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const fraction = normalized.match(
    /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/,
  );
  if (!fraction) return null;

  const numerator = Number(fraction[1]);
  const denominator = Number(fraction[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }
  return numerator / denominator;
}

function answersMatch(task: PracticeTask, value: string) {
  if (task.type !== "number") {
    return normalize(value) === normalize(task.answer);
  }

  const actual = parseSimpleNumber(value);
  const expected = parseSimpleNumber(task.answer);
  if (actual === null || expected === null) {
    return normalize(value) === normalize(task.answer);
  }

  const scale = Math.max(1, Math.abs(expected));
  return Math.abs(actual - expected) <= 1e-9 * scale;
}

function difficultyLabel(task: PracticeTask) {
  if (task.type === "proof") return "PROOF";
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
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const check = () => {
    if (!value.trim() || task.type === "proof") return;
    const right = answersMatch(task, value);
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
      ) : task.type === "proof" ? (
        <textarea
          className="practice-proof-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Напиши доказательство: идея → ключевые равенства → вывод. Не подглядывай в разбор до попытки."
          rows={8}
        />
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
        {task.type === "proof" ? (
          <>
            <button
              className="practice-check"
              onClick={() => setSolutionOpen((open) => !open)}
              disabled={value.trim().length < 12}
            >
              {solutionOpen ? "Скрыть эталон" : "Сверить с эталоном"}
            </button>
            {solutionOpen && !solved && status !== "right" && (
              <button
                className="practice-self-check"
                onClick={() => {
                  setStatus("right");
                  onSolved(task.id);
                }}
              >
                Мой разбор выдержал сверку ✓
              </button>
            )}
          </>
        ) : (
          <button className="practice-check" onClick={check} disabled={!value.trim()}>
            {status === "right" ? "Проверено" : "Проверить"}
          </button>
        )}
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
      {solutionOpen && task.type === "proof" && (
        <div className="practice-proof-solution">
          <div className="practice-proof-solution-head">
            <span>ACADEMY SOLUTION SKETCH</span>
            <strong>Сверь структуру доказательства, а не формулировки.</strong>
          </div>
          {task.solution && <p><RichMatrixText text={task.solution} /></p>}
          {task.rubric && (
            <ul>
              {task.rubric.map((item) => <li key={item}><RichMatrixText text={item} /></li>)}
            </ul>
          )}
        </div>
      )}
      {status === "wrong" && task.type !== "proof" && (
        <div className="practice-feedback bad">
          Пока нет. Проверь вычисления и попробуй ещё.
        </div>
      )}
      {status === "right" && (
        <div className="practice-feedback good">
          {task.type === "proof"
            ? "Proof-задача засчитана после самостоятельной сверки."
            : "Верно. Задача засчитана в практику."}
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
  const [academyOnly, setAcademyOnly] = useState(false);
  const [proofOnly, setProofOnly] = useState(false);
  const [view, setView] = useState<"grid" | "focus">("grid");
  const [focusIndex, setFocusIndex] = useState(0);

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
        if (academyOnly && !task.id.startsWith("academy-")) return false;
        if (proofOnly && task.type !== "proof") return false;
        return true;
      }),
    [tasks, solved, difficulty, hideSolved, academyOnly, proofOnly],
  );

  const counts = useMemo(() => ({
    base: tasks.filter((task) => (task.difficulty ?? "base") === "base").length,
    medium: tasks.filter((task) => task.difficulty === "medium").length,
    hard: tasks.filter((task) => task.difficulty === "hard").length,
    proof: tasks.filter((task) => task.type === "proof").length,
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

  const startAcademyExam = () => {
    setAcademyOnly(true);
    setProofOnly(false);
    setDifficulty("hard");
    setHideSolved(true);
    setView("focus");
    setFocusIndex(0);
  };

  const safeFocusIndex = Math.min(focusIndex, Math.max(0, visibleTasks.length - 1));
  const focusedTask = visibleTasks[safeFocusIndex];

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
          {tasks.some((task) => task.id.startsWith("academy-")) && (
            <button className="academy-exam-button" onClick={startAcademyExam}>
              Academy Exam
            </button>
          )}
          {counts.proof > 0 && (
            <button
              className={proofOnly ? "active proof-filter" : "proof-filter"}
              onClick={() => {
                setProofOnly((value) => !value);
                setFocusIndex(0);
              }}
              aria-pressed={proofOnly}
            >
              {proofOnly ? "Proof seminar ✓" : "Proof seminar"}
            </button>
          )}
          <button
            className={academyOnly ? "active academy-filter" : "academy-filter"}
            onClick={() => {
              setAcademyOnly((value) => !value);
              setFocusIndex(0);
            }}
            aria-pressed={academyOnly}
          >
            {academyOnly ? "Academy only ✓" : "Academy PRO"}
          </button>
          <button
            className={view === "focus" ? "active" : ""}
            onClick={() => {
              setView((current) => current === "grid" ? "focus" : "grid");
              setFocusIndex(0);
            }}
            aria-pressed={view === "focus"}
          >
            {view === "focus" ? "Сетка" : "Focus mode"}
          </button>
          <button
            className={hideSolved ? "active" : ""}
            onClick={() => {
              setHideSolved((value) => !value);
              setFocusIndex(0);
            }}
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
        {counts.proof > 0 && <span>PROOF {counts.proof}</span>}
      </div>

      {visibleTasks.length ? (
        view === "focus" && focusedTask ? (
          <div className="practice-focus">
            <header className="practice-focus-head">
              <button
                onClick={() =>
                  setFocusIndex((index) =>
                    index <= 0 ? visibleTasks.length - 1 : index - 1,
                  )
                }
                aria-label="Предыдущая задача"
              >
                ←
              </button>
              <div>
                <span>FOCUS SESSION</span>
                <strong>
                  {safeFocusIndex + 1} / {visibleTasks.length}
                </strong>
                <small>
                  {difficulty === "all" ? "все сложности" : difficulty.toUpperCase()}
                  {hideSolved ? " · только нерешённые" : ""}
                  {academyOnly ? " · ACADEMY" : ""}
                  {proofOnly ? " · PROOF" : ""}
                </small>
              </div>
              <button
                onClick={() =>
                  setFocusIndex((index) =>
                    index >= visibleTasks.length - 1 ? 0 : index + 1,
                  )
                }
                aria-label="Следующая задача"
              >
                →
              </button>
            </header>

            <div className="practice-focus-card">
              <TaskCard
                key={focusedTask.id + "-" + (solved.has(focusedTask.id) ? "solved" : "open")}
                task={focusedTask}
                solved={solved.has(focusedTask.id)}
                onSolved={markSolved}
              />
            </div>

            <div className="practice-focus-dots" aria-hidden="true">
              {visibleTasks.slice(0, 24).map((task, index) => (
                <i
                  key={task.id}
                  className={
                    (index === safeFocusIndex ? "active " : "") +
                    (solved.has(task.id) ? "solved" : "")
                  }
                />
              ))}
            </div>
          </div>
        ) : (
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
        )
      ) : (
        <div className="practice-filter-empty">
          <strong>В этом режиме задач не осталось.</strong>
          <p>Смени сложность или снова покажи решённые задачи.</p>
          <button
            onClick={() => {
              setDifficulty("all");
              setHideSolved(false);
              setAcademyOnly(false);
              setProofOnly(false);
            }}
          >
            Показать весь банк
          </button>
        </div>
      )}
    </section>
  );
}
