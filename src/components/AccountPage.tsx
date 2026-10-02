import { useMemo, useState } from "react";
import { chapters } from "../data/courseMeta";
import { getChapterProgress, isTrackedChapter, type LearningSnapshot } from "../lib/progress";
import { loadSavedTheorems } from "../lib/learning";

const PROFILE_KEY = "visualmath-local-profile-v1";
const PERSONAL_VISITS = [
  2, 4, 3, 6, 8, 5, 9,
  11, 7, 12, 10, 14, 9, 16,
  18, 13, 17, 21, 15, 19, 23,
  20, 26, 22, 28, 25, 31, 29,
];

type LocalProfile = {
  displayName: string;
  handle: string;
  bio: string;
  joinedAt: string;
};

function loadProfile(): LocalProfile {
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    if (stored) return stored;
  } catch {
    // Ignore malformed local profile.
  }

  const profile: LocalProfile = {
    displayName: "VisualMath User",
    handle: "visual-learner",
    bio: "Изучаю математику через структуру, визуализацию и практику.",
    joinedAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function AccountPage({
  progress,
  snapshot,
}: {
  progress: number;
  snapshot: LearningSnapshot;
}) {
  const [profile, setProfile] = useState(loadProfile);
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);

  const savedCount = loadSavedTheorems().length;
  const chapterRows = useMemo(
    () => chapters
      .filter((chapter) => isTrackedChapter(chapter.id))
      .map((chapter) => ({
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        progress: getChapterProgress(chapter.id, snapshot),
      })),
    [snapshot],
  );

  const maxVisits = Math.max(...PERSONAL_VISITS);
  const visitPoints = PERSONAL_VISITS.map((value, index) => {
    const x = 20 + (index / (PERSONAL_VISITS.length - 1)) * 680;
    const y = 206 - (value / maxVisits) * 160;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const heatmap = useMemo(
    () => Array.from({ length: 364 }, (_, index) => {
      const wave = (index * 7 + (index % 11) * 3 + Math.floor(index / 13)) % 17;
      if (wave < 7) return 0;
      if (wave < 11) return 1;
      if (wave < 14) return 2;
      if (wave < 16) return 3;
      return 4;
    }),
    [],
  );

  const saveProfile = () => {
    const next = {
      ...draft,
      displayName: draft.displayName.trim() || "VisualMath User",
      handle: draft.handle.trim().replace(/^@/, "") || "visual-learner",
    };
    setProfile(next);
    setDraft(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    setEditing(false);
  };

  const initials = profile.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="account-page">
      <header className="account-hero">
        <div className="account-avatar">{initials}</div>
        <div className="account-identity">
          <div className="eyebrow">VISUALMATH / PERSONAL SPACE</div>
          <h1>{profile.displayName}</h1>
          <span>@{profile.handle}</span>
          <p>{profile.bio}</p>
          <small>В VisualMath с {new Date(profile.joinedAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</small>
        </div>
        <button className="account-edit" onClick={() => setEditing((value) => !value)}>
          {editing ? "Закрыть" : "Редактировать профиль"}
        </button>
      </header>

      {editing && (
        <div className="account-edit-panel">
          <label>
            <span>Имя</span>
            <input value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} />
          </label>
          <label>
            <span>Username</span>
            <input value={draft.handle} onChange={(event) => setDraft({ ...draft, handle: event.target.value })} />
          </label>
          <label className="account-edit-bio">
            <span>Bio</span>
            <textarea value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} />
          </label>
          <button onClick={saveProfile}>Сохранить</button>
        </div>
      )}

      <div className="account-stat-grid">
        <article>
          <span>{progress}%</span>
          <strong>Освоение курса</strong>
          <small>Общий tracked progress</small>
        </article>
        <article>
          <span>{snapshot.solved.size}</span>
          <strong>Решено задач</strong>
          <small>Локальный прогресс</small>
        </article>
        <article>
          <span>{snapshot.theory.size}</span>
          <strong>Изучено тем</strong>
          <small>Отмеченная теория</small>
        </article>
        <article>
          <span>{savedCount}</span>
          <strong>Сохранено</strong>
          <small>Теоремы и утверждения</small>
        </article>
      </div>

      <div className="account-dashboard-grid">
        <section className="account-panel account-heatmap-panel">
          <header>
            <div>
              <span>ACTIVITY</span>
              <h2>Активность за год</h2>
            </div>
            <b>DEMO + LOCAL</b>
          </header>
          <div className="account-heatmap-wrap">
            <div className="account-heatmap" aria-label="Демонстрационная карта активности">
              {heatmap.map((level, index) => (
                <i key={index} className={"level-" + level} title={"День " + (index + 1)} />
              ))}
            </div>
          </div>
          <footer>
            <span>Меньше</span>
            {[0,1,2,3,4].map((level) => <i key={level} className={"level-" + level} />)}
            <span>Больше</span>
          </footer>
        </section>

        <section className="account-panel account-visits-panel">
          <header>
            <div>
              <span>VISITS / DEMO DATA</span>
              <h2>Твои посещения</h2>
            </div>
            <b>28 DAYS</b>
          </header>
          <svg viewBox="0 0 720 240" role="img" aria-label="Личный мок-график посещений">
            <g>
              {[46,86,126,166,206].map((y) => (
                <line key={y} x1="20" x2="700" y1={y} y2={y} />
              ))}
            </g>
            <polyline points={visitPoints} />
            {PERSONAL_VISITS.map((value, index) => {
              const x = 20 + (index / (PERSONAL_VISITS.length - 1)) * 680;
              const y = 206 - (value / maxVisits) * 160;
              return <circle key={index} cx={x} cy={y} r="3" />;
            })}
          </svg>
          <div className="account-visits-axis">
            <span>4 недели назад</span>
            <span>2 недели</span>
            <span>сегодня</span>
          </div>
        </section>
      </div>

      <section className="account-panel account-course-panel">
        <header>
          <div>
            <span>COURSE MAP</span>
            <h2>Прогресс по разделам</h2>
          </div>
          <b>{chapterRows.length} TRACKED</b>
        </header>
        <div className="account-course-list">
          {chapterRows.map((row) => (
            <button key={row.id} onClick={() => (window.location.hash = row.id)}>
              <span>{row.number}</span>
              <div>
                <strong>{row.title}</strong>
                <i><b style={{ width: row.progress + "%" }} /></i>
              </div>
              <em>{row.progress}%</em>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
