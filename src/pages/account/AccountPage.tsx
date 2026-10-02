import { type CSSProperties, useMemo, useState } from "react";
import { chapters } from "@/data/courseMeta";
import {
  getChapterProgress,
  isTrackedChapter,
  isTrackedTopic,
  type LearningSnapshot,
} from "@/features/learning/model/progress";
import { loadSavedTheorems } from "@/features/learning/model/learning";
import "@/features/account-experience/styles/account-experience.css";

const PROFILE_KEY = "visualmath-local-profile-v1";
const PERSONAL_VISITS = [
  2, 4, 3, 6, 8, 5, 9, 11, 7, 12, 10, 14,
  9, 16, 18, 13, 17, 21, 15, 19, 23, 20, 26, 22, 28, 25, 31, 29,
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
    () =>
      chapters
        .filter((chapter) => isTrackedChapter(chapter.id))
        .map((chapter) => ({
          id: chapter.id,
          topicId: chapter.topicIds.find(isTrackedTopic) ?? chapter.topicIds[0],
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
    () =>
      Array.from({ length: 364 }, (_, index) => {
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

  const joined = new Date(profile.joinedAt).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="identity-os">
      <div className="identity-grid-bg" aria-hidden="true" />
      <header className="identity-hero">
        <div className="identity-core">
          <div className="identity-orbit orbit-a" />
          <div className="identity-orbit orbit-b" />
          <div className="identity-orbit orbit-c" />
          <div className="identity-avatar"><span>{initials}</span><small>VM.ID</small></div>
          <div
            className="identity-pointer"
            style={{ "--identity-progress": progress } as CSSProperties}
            aria-hidden="true"
          />
          <em className="identity-tag tag-a">LOCAL ID</em>
          <em className="identity-tag tag-b">SYNC READY</em>
        </div>

        <div className="identity-copy">
          <div className="identity-kicker"><span>PERSONAL OS</span><i>IDENTITY CORE / LOCAL</i></div>
          <h1>{profile.displayName}</h1>
          <div className="identity-handle">@{profile.handle}</div>
          <p>{profile.bio}</p>
          <div className="identity-meta">
            <span>JOINED / {joined}</span>
            <span>MASTERY / {progress}%</span>
            <span>SECTORS / {chapterRows.length}</span>
          </div>
          <div className="identity-actions">
            <button className="identity-primary" onClick={() => setEditing((value) => !value)}>
              <small>IDENTITY CONSOLE</small>
              <strong>{editing ? "CLOSE EDITOR" : "EDIT PROFILE"}</strong>
            </button>
            <button onClick={() => (window.location.hash = "map")}>
              <small>KNOWLEDGE SPACE</small>
              <strong>OPEN MAP ↗</strong>
            </button>
          </div>
        </div>

        <aside className="identity-signature">
          <span>SYSTEM SIGNATURE</span>
          <strong>{String(snapshot.theory.size).padStart(2, "0")}·{String(snapshot.solved.size).padStart(2, "0")}</strong>
          <small>THEORY / SOLVED</small>
          <div aria-hidden="true">
            {Array.from({ length: 28 }, (_, index) => (
              <i key={index} style={{ height: 18 + ((index * 31 + progress) % 72) + "%" }} />
            ))}
          </div>
          <em>REAL LOCAL COUNTS</em>
        </aside>
      </header>

      {editing && (
        <section className="identity-editor">
          <header><span>IDENTITY CONSOLE</span><b>WRITE / LOCAL STORAGE</b></header>
          <div>
            <label>
              <span>DISPLAY NAME</span>
              <input value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} />
            </label>
            <label>
              <span>HANDLE</span>
              <input value={draft.handle} onChange={(event) => setDraft({ ...draft, handle: event.target.value })} />
            </label>
            <label className="identity-editor-bio">
              <span>BIO / MANIFEST</span>
              <textarea value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} />
            </label>
            <button onClick={saveProfile}><small>COMMIT</small><strong>SAVE CHANGES ↘</strong></button>
          </div>
        </section>
      )}

      <section className="identity-stat-strip">
        {[
          ["01", progress + "%", "Освоение курса", "TRACKED MASTERY"],
          ["02", snapshot.solved.size, "Решено задач", "LOCAL PROGRESS"],
          ["03", snapshot.theory.size, "Изучено тем", "THEORY MARKED"],
          ["04", savedCount, "Сохранено", "THEOREMS + NOTES"],
        ].map(([code, value, title, copy]) => (
          <article key={code}>
            <div><span>{code}</span><small>REAL DATA</small></div>
            <strong>{value}</strong>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <div className="identity-dashboard">
        <section className="identity-module identity-activity">
          <header><div><span>ACTIVITY MATRIX</span><h2>Год как сигнал.</h2></div><b>DEMO + LOCAL</b></header>
          <div className="identity-heatmap-frame">
            <div className="identity-heatmap" aria-label="Демонстрационная карта активности">
              {heatmap.map((level, index) => (
                <i key={index} className={"level-" + level} title={"День " + (index + 1)} />
              ))}
            </div>
          </div>
          <footer><span>LOW</span>{[0,1,2,3,4].map((level)=><i key={level} className={"level-"+level}/>)}<span>HIGH</span></footer>
        </section>

        <section className="identity-module identity-wave">
          <header><div><span>VISIT WAVEFORM</span><h2>28 дней движения.</h2></div><b>DEMO DATA</b></header>
          <svg viewBox="0 0 720 240" role="img" aria-label="Личный мок-график посещений">
            <g>{[46,86,126,166,206].map((y)=><line key={y} x1="20" x2="700" y1={y} y2={y}/>)}</g>
            <polyline points={visitPoints}/>
            {PERSONAL_VISITS.map((value,index)=>{
              const x=20+(index/(PERSONAL_VISITS.length-1))*680;
              const y=206-(value/maxVisits)*160;
              return <circle key={index} cx={x} cy={y} r="3"/>;
            })}
          </svg>
          <div className="identity-wave-axis"><span>−28D</span><span>−14D</span><span>NOW</span></div>
        </section>
      </div>

      <section className="identity-module identity-sectors">
        <header><div><span>KNOWLEDGE SECTORS</span><h2>Прогресс по разделам.</h2></div><b>{chapterRows.length} TRACKED</b></header>
        <div className="identity-sector-grid">
          {chapterRows.map((row,index)=>(
            <button key={row.id} onClick={() => (window.location.hash = row.topicId)}>
              <div><span>{String(index+1).padStart(2,"0")}</span><small>CH/{row.number}</small></div>
              <strong>{row.title}</strong>
              <i><b style={{width:row.progress+"%"}}/></i>
              <em>{row.progress}%</em>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
