import { useMemo, useState } from "react";
import { practiceByTopic } from "../data/practice";
import { loadSet, saveSet, SOLVED_KEY } from "../lib/learning";
import type { PracticeTask } from "../types/course";
import { RichMatrixText } from "./MatrixNotation";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ");
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
  const [status, setStatus] = useState<"idle" | "wrong" | "right">(solved ? "right" : "idle");
  const [hint, setHint] = useState(false);

  const check = () => {
    const right = normalize(value) === normalize(task.answer);
    setStatus(right ? "right" : "wrong");
    if (right) onSolved(task.id);
  };

  return (
    <article className={"practice-card " + status}>
      <div className="practice-card-head">
        <div>
          <span>{task.difficulty === "hard" ? "HARD" : task.difficulty === "medium" ? "MEDIUM" : "BASE"}</span>
          <h3>{task.title}</h3>
        </div>
        <b>{solved || status === "right" ? "✓" : "○"}</b>
      </div>

      <p><RichMatrixText text={task.prompt} /></p>

      {task.type === "choice" && task.options ? (
        <div className="practice-options">
          {task.options.map((option) => (
            <button
              key={option}
              className={value === option ? "selected" : ""}
              onClick={() => setValue(option)}
            >
              <RichMatrixText text={option} />
            </button>
          ))}
        </div>
      ) : (
        <input
          className="practice-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ответ"
          onKeyDown={(event) => event.key === "Enter" && check()}
        />
      )}

      <div className="practice-actions">
        <button className="practice-check" onClick={check} disabled={!value.trim()}>
          Проверить
        </button>
        {task.hint && (
          <button className="practice-hint-button" onClick={() => setHint((state) => !state)}>
            {hint ? "Скрыть подсказку" : "Подсказка"}
          </button>
        )}
      </div>

      {hint && task.hint && <div className="practice-hint">{task.hint}</div>}
      {status === "wrong" && <div className="practice-feedback bad">Пока нет. Проверь вычисления и попробуй ещё.</div>}
      {status === "right" && <div className="practice-feedback good">Верно. Задача засчитана в практику.</div>}
    </article>
  );
}

export function PracticePanel({ topicId }: { topicId: string }) {
  const tasks = practiceByTopic[topicId] ?? [];
  const [solved, setSolved] = useState<Set<string>>(() => loadSet(SOLVED_KEY));

  const completed = useMemo(
    () => tasks.filter((task) => solved.has(task.id)).length,
    [tasks, solved],
  );

  if (tasks.length === 0) {
    return (
      <section className="practice-panel practice-empty">
        <div className="eyebrow">ПРАКТИКА</div>
        <h2>Задачи добавляются</h2>
        <p>Для этой темы банк задач ещё не подключён. Теория уже учитывается отдельно и не выдаёт полное освоение темы без практики.</p>
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

  return (
    <section className="practice-panel">
      <header className="practice-header">
        <div>
          <div className="eyebrow">ПРАКТИКА / ПРОВЕРКА ОСВОЕНИЯ</div>
          <h2>Проверь, превратились ли формулы в рабочий инструмент.</h2>
          <p>
            Теоретический проход фиксирует знакомство с материалом. Практический прогресс
            растёт только после правильных решений — он показывает, можешь ли ты применить
            определения, свойства и методы без готового хода решения перед глазами.
          </p>
        </div>
        <div className="practice-score">
          <strong>{completed}/{tasks.length}</strong>
          <span>решено</span>
        </div>
      </header>

      <div className="practice-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            solved={solved.has(task.id)}
            onSolved={markSolved}
          />
        ))}
      </div>
    </section>
  );
}
