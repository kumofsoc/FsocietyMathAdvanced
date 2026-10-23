import { useEffect, useState } from "react";
import { chapters } from "@/data/courseMeta";
import {
  getChapterProgress,
  isTrackedChapter,
  type LearningSnapshot,
} from "@/features/learning/model/progress";
import { loadSavedTheorems } from "@/features/learning/model/learning";
import { useAuthStore } from "@/features/auth/model/authSession";
import { AccountSecurityControls } from "@/features/account-security/ui/AccountSecurityControls";
import { normalizeLegacyProfileDisplayName } from "@/features/account/model/localProfile";
import { AccountAuthGate } from "@/features/auth/ui/AccountAuthGate";
import { api } from "@/shared/api/client";
import { apiErrorMessage } from "@/shared/api/errorPresentation";
import {
  readLocalStorageJson,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";
import type {
  ActivityHeatmapDto,
  ActivityStatsDto,
  UserProfileDto,
} from "@/shared/api/types";
import "@/features/account-experience/styles/account-experience.css";
import "@/styles/account-production.css";

const PROFILE_KEY = "visualmath-local-profile-v1";

type LocalProfile = {
  displayName: string;
  handle: string;
  bio: string;
  joinedAt: string;
};

type EditableProfile = {
  displayName: string;
  handle: string;
  bio: string;
};

function loadLocalProfile(): LocalProfile {
  const stored = readLocalStorageJson<LocalProfile | null>(PROFILE_KEY, null);
  if (
    stored &&
    typeof stored.displayName === "string" &&
    typeof stored.handle === "string" &&
    typeof stored.bio === "string" &&
    typeof stored.joinedAt === "string"
  ) {
    const nextName = normalizeLegacyProfileDisplayName(stored.displayName);
    if (nextName !== stored.displayName) {
      const migrated = { ...stored, displayName: nextName };
      writeLocalStorage(PROFILE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return stored;
  }

  const profile: LocalProfile = {
    displayName: "MathMaMath User",
    handle: "visual-learner",
    bio: "Изучаю математику через структуру, визуализацию и практику.",
    joinedAt: new Date().toISOString(),
  };
  writeLocalStorage(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}


function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "MM";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function Heatmap({
  data,
}: {
  data: ActivityHeatmapDto | null;
}) {
  if (!data?.days.length) {
    return (
      <div className="account-activity-empty">
        Активность появится после первых серверных событий обучения.
      </div>
    );
  }

  return (
    <div className="account-heatmap-wrap">
      <div className="account-heatmap" aria-label="Активность обучения">
        {data.days.map((day) => (
          <i
            key={day.date}
            className={"level-" + Math.min(4, Math.max(0, day.level))}
            title={day.date + ": " + day.count}
          />
        ))}
      </div>
    </div>
  );
}

function CourseProgress({
  snapshot,
}: {
  snapshot: LearningSnapshot;
}) {
  const tracked = chapters.filter((chapter) => isTrackedChapter(chapter.id));
  return (
    <section className="account-panel account-course-panel">
      <header>
        <div>
          <span>COURSE / SECTORS</span>
          <h2>Прогресс по разделам</h2>
        </div>
        <b>{tracked.length} TRACKED</b>
      </header>

      <div className="account-course-list">
        {tracked.map((chapter) => {
          const progress = getChapterProgress(chapter.id, snapshot);
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => {
                window.location.hash = "map";
              }}
            >
              <span>{chapter.number}</span>
              <div>
                <strong>{chapter.title}</strong>
                <i><b style={{ width: progress + "%" }} /></i>
              </div>
              <em>{progress}%</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LocalAccount({
  progress,
  snapshot,
}: {
  progress: number;
  snapshot: LearningSnapshot;
}) {
  const [profile, setProfile] = useState(loadLocalProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableProfile>({
    displayName: profile.displayName,
    handle: profile.handle,
    bio: profile.bio,
  });

  const theoryCount = snapshot.theory.size;
  const solvedCount = snapshot.solved.size;
  const savedCount = loadSavedTheorems().length;

  const save = () => {
    const next: LocalProfile = {
      ...profile,
      displayName: draft.displayName.trim() || "MathMaMath User",
      handle: draft.handle.trim().replace(/^@/, "") || "visual-learner",
      bio: draft.bio.trim(),
    };
    setProfile(next);
    writeLocalStorage(PROFILE_KEY, JSON.stringify(next));
    setEditing(false);
  };

  return (
    <section className="account-page">
      <div className="account-local-banner">
        <span>LOCAL MODE</span>
        <strong>Backend не настроен.</strong>
        <p>
          Профиль и прогресс работают локально. Здесь намеренно нет фальшивой
          серверной активности или выдуманных посещений.
        </p>
      </div>

      <section className="account-hero">
        <div className="account-avatar">{initials(profile.displayName)}</div>
        <div className="account-identity">
          <div className="eyebrow">LOCAL PROFILE</div>
          <h1>{profile.displayName}</h1>
          <span>@{profile.handle}</span>
          <p>{profile.bio}</p>
          <small>
            Локальный профиль создан {new Date(profile.joinedAt).toLocaleDateString("ru-RU")}
          </small>
        </div>
        <button
          className="account-edit"
          type="button"
          onClick={() => setEditing((value) => !value)}
        >
          {editing ? "Закрыть" : "Редактировать"}
        </button>
      </section>

      {editing && (
        <section className="account-edit-panel">
          <label>
            <span>Имя</span>
            <input
              value={draft.displayName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>Handle</span>
            <input
              value={draft.handle}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  handle: event.target.value,
                }))
              }
            />
          </label>
          <label className="account-edit-bio">
            <span>О себе</span>
            <textarea
              value={draft.bio}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
            />
          </label>
          <button type="button" onClick={save}>Сохранить</button>
        </section>
      )}

      <div className="account-stat-grid">
        <article><span>{progress}%</span><strong>Прогресс курса</strong><small>локально</small></article>
        <article><span>{theoryCount}</span><strong>Теория</strong><small>завершённых тем</small></article>
        <article><span>{solvedCount}</span><strong>Задачи</strong><small>решено</small></article>
        <article><span>{savedCount}</span><strong>Теоремы</strong><small>сохранено</small></article>
      </div>

      <CourseProgress snapshot={snapshot} />

    </section>
  );
}

function BackendAccount({
  progress,
  snapshot,
}: {
  progress: number;
  snapshot: LearningSnapshot;
}) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableProfile>({
    displayName: user?.profile.displayName ?? "",
    handle: user?.profile.handle ?? "",
    bio: user?.profile.bio ?? "",
  });
  const [heatmap, setHeatmap] = useState<ActivityHeatmapDto | null>(null);
  const [stats, setStats] = useState<ActivityStatsDto | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDraft({
      displayName: user.profile.displayName,
      handle: user.profile.handle,
      bio: user.profile.bio,
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.activity.heatmap(new Date().getFullYear()),
      api.activity.stats(28),
    ])
      .then(([nextHeatmap, nextStats]) => {
        if (cancelled) return;
        setHeatmap(nextHeatmap);
        setStats(nextStats);
        setActivityError(null);
      })
      .catch((error) => {
        if (!cancelled) setActivityError(apiErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const serverProfile: UserProfileDto | null = user?.profile ?? null;
  if (!user || !serverProfile) return null;

  const saveProfile = async () => {
    if (saving) return;
    setSaving(true);
    setProfileError(null);
    try {
      await updateProfile({
        displayName: draft.displayName.trim(),
        handle: draft.handle.trim().replace(/^@/, ""),
        bio: draft.bio.trim(),
      });
      setEditing(false);
    } catch (error) {
      setProfileError(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const savedCount = loadSavedTheorems().length;

  return (
    <section className="account-page">
      <section className="account-hero">
        <div className="account-avatar">{initials(serverProfile.displayName)}</div>
        <div className="account-identity">
          <div className="eyebrow">SYNCED PROFILE</div>
          <h1>{serverProfile.displayName}</h1>
          <span>@{serverProfile.handle}</span>
          <p>{serverProfile.bio || "Профиль MathMaMath"}</p>
          <small>{user.email}</small>
        </div>
        <div className="account-hero-actions">
          <button
            className="account-edit"
            type="button"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? "Закрыть" : "Редактировать"}
          </button>
          <button
            className="account-logout"
            type="button"
            onClick={() => void logout()}
          >
            Выйти
          </button>
        </div>
      </section>

      {editing && (
        <section className="account-edit-panel">
          <label>
            <span>Имя</span>
            <input
              value={draft.displayName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              minLength={2}
              maxLength={80}
            />
          </label>
          <label>
            <span>Handle</span>
            <input
              value={draft.handle}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  handle: event.target.value,
                }))
              }
              minLength={3}
              maxLength={32}
            />
          </label>
          <label className="account-edit-bio">
            <span>О себе</span>
            <textarea
              value={draft.bio}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              maxLength={500}
            />
          </label>
          <button type="button" onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
          {profileError && <div className="account-profile-error">{profileError}</div>}
        </section>
      )}

      <div className="account-stat-grid">
        <article><span>{progress}%</span><strong>Прогресс курса</strong><small>синхронизирован</small></article>
        <article><span>{stats?.activeDays ?? 0}</span><strong>Активные дни</strong><small>последние 28 дней</small></article>
        <article><span>{stats?.currentStreak ?? 0}</span><strong>Текущая серия</strong><small>дней подряд</small></article>
        <article><span>{savedCount}</span><strong>Теоремы</strong><small>сохранено</small></article>
      </div>

      <div className="account-dashboard-grid">
        <section className="account-panel account-heatmap-panel">
          <header>
            <div>
              <span>SERVER ACTIVITY</span>
              <h2>Активность</h2>
            </div>
            <b>{stats ? stats.totalEvents + " EVENTS" : "SYNC"}</b>
          </header>
          {activityError ? (
            <div className="account-activity-empty error">{activityError}</div>
          ) : (
            <Heatmap data={heatmap} />
          )}
          <footer>
            <span>меньше</span>
            <i />
            <i className="level-1" />
            <i className="level-2" />
            <i className="level-3" />
            <i className="level-4" />
            <span>больше</span>
          </footer>
        </section>

        <section className="account-panel account-server-state">
          <header>
            <div>
              <span>SYNC / STATUS</span>
              <h2>Аккаунт подключён</h2>
            </div>
            <b>ONLINE</b>
          </header>
          <div className="account-server-state-copy">
            <p>
              Refresh-token хранится в HttpOnly cookie, access-token — только
              в памяти вкладки. Локальное состояние автоматически объединяется
              с сервером после входа.
            </p>
            <dl>
              <div><dt>Пользователь</dt><dd>{user.id}</dd></div>
              <div><dt>Longest streak</dt><dd>{stats?.longestStreak ?? 0}</dd></div>
              <div><dt>Обновлён</dt><dd>{new Date(serverProfile.updatedAt).toLocaleString("ru-RU")}</dd></div>
            </dl>
          </div>
        </section>
      </div>

      <CourseProgress snapshot={snapshot} />

      <AccountSecurityControls />

    </section>
  );
}

export function AccountPage({
  progress,
  snapshot,
}: {
  progress: number;
  snapshot: LearningSnapshot;
}) {
  const status = useAuthStore((state) => state.status);

  if (status === "local") {
    return <LocalAccount progress={progress} snapshot={snapshot} />;
  }

  if (status !== "authenticated") {
    return <AccountAuthGate />;
  }

  return <BackendAccount progress={progress} snapshot={snapshot} />;
}
