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
import { api } from "@/shared/api/client";
import { apiErrorMessage } from "@/shared/api/errorPresentation";
import {
  readLocalStorageJson,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";
import { visualMathHashParam } from "@/shared/lib/blockDeepLink";
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
    return stored;
  }

  const profile: LocalProfile = {
    displayName: "VisualMath User",
    handle: "visual-learner",
    bio: "Изучаю математику через структуру, визуализацию и практику.",
    joinedAt: new Date().toISOString(),
  };
  writeLocalStorage(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}


function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "VM";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function PasswordRecoveryPanel({
  token,
  onClose,
}: {
  token: string | null;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <form
      className="account-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        setFormError(null);

        if (!token) {
          setBusy(true);
          void api.auth
            .requestPasswordReset(email.trim())
            .then(() => {
              setMessage(
                "Если такой активный аккаунт существует, инструкция для восстановления отправлена.",
              );
            })
            .catch((nextError) => setFormError(apiErrorMessage(nextError)))
            .finally(() => setBusy(false));
          return;
        }

        if (newPassword !== confirmPassword) {
          setFormError("Пароли не совпадают.");
          return;
        }

        setBusy(true);
        void api.auth
          .confirmPasswordReset(token, newPassword)
          .then(() => {
            setMessage("Пароль изменён. Все старые сессии отозваны.");
            window.location.replace("#account");
          })
          .catch((nextError) => setFormError(apiErrorMessage(nextError)))
          .finally(() => setBusy(false));
      }}
    >
      <div className="account-auth-recovery-heading">
        <span>PASSWORD / RECOVERY</span>
        <strong>{token ? "Новый пароль" : "Восстановление доступа"}</strong>
      </div>

      {!token ? (
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
      ) : (
        <>
          <label>
            <span>Новый пароль</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={10}
              maxLength={256}
              required
            />
          </label>
          <label>
            <span>Повтори пароль</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={10}
              maxLength={256}
              required
            />
          </label>
        </>
      )}

      {message && <div className="account-auth-notice">{message}</div>}
      {formError && <div className="account-auth-error">{formError}</div>}

      {!message && (
        <button type="submit" disabled={busy}>
          {busy
            ? "Отправляю…"
            : token
              ? "Установить новый пароль"
              : "Отправить инструкцию"}
        </button>
      )}
      <button
        type="button"
        className="account-auth-secondary"
        onClick={onClose}
        disabled={busy}
      >
        Вернуться ко входу
      </button>
    </form>
  );
}

function AccountAuthGate() {
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const resetToken =
    typeof window === "undefined"
      ? null
      : visualMathHashParam(window.location.hash, "reset");
  const [recoveryOpen, setRecoveryOpen] = useState(Boolean(resetToken));
  const [passwordResetAvailable, setPasswordResetAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.system
      .meta()
      .then((meta) => {
        if (!cancelled) {
          setPasswordResetAvailable(Boolean(meta.capabilities?.passwordReset));
        }
      })
      .catch(() => {
        if (!cancelled) setPasswordResetAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "booting") {
    return (
      <section className="account-auth-state">
        <span>AUTH / SESSION</span>
        <h1>Восстанавливаю сессию.</h1>
        <p>Проверяю защищённую refresh-cookie и состояние аккаунта.</p>
      </section>
    );
  }

  if (status === "unavailable") {
    return (
      <section className="account-auth-state error">
        <span>BACKEND / UNAVAILABLE</span>
        <h1>Сервис аккаунта недоступен.</h1>
        <p>{error ?? "Не удалось связаться с backend."}</p>
        <button type="button" onClick={() => void bootstrap()}>
          Повторить подключение
        </button>
      </section>
    );
  }

  if (recoveryOpen || resetToken) {
    return (
      <section className="account-auth-shell">
        <div className="account-auth-copy">
          <span>VISUALMATH / RECOVERY</span>
          <h1>{resetToken ? "Задай новый пароль." : "Верни доступ."}</h1>
          <p>
            Reset token хранится только во fragment URL и не отправляется в
            access logs. После смены пароля все старые сессии будут отозваны.
          </p>
        </div>
        <PasswordRecoveryPanel
          token={resetToken}
          onClose={() => {
            setRecoveryOpen(false);
            if (resetToken) window.location.replace("#account");
          }}
        />
      </section>
    );
  }

  return (
    <section className="account-auth-shell">
      <div className="account-auth-copy">
        <span>VISUALMATH / ACCOUNT</span>
        <h1>{mode === "login" ? "Продолжить обучение." : "Создать аккаунт."}</h1>
        <p>
          Прогресс остаётся local-first. После входа локальные данные объединяются
          с серверным состоянием без потери уже изученного.
        </p>
      </div>

      <form
        className="account-auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setFormError(null);

          const action =
            mode === "login"
              ? login({ email: email.trim(), password })
              : register({
                  email: email.trim(),
                  password,
                  handle: handle.trim().replace(/^@/, ""),
                  displayName: displayName.trim(),
                });

          void action
            .catch((nextError) => setFormError(apiErrorMessage(nextError)))
            .finally(() => setBusy(false));
        }}
      >
        <div className="account-auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setFormError(null);
            }}
          >
            Вход
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setFormError(null);
            }}
          >
            Регистрация
          </button>
        </div>

        {mode === "register" && (
          <>
            <label>
              <span>Имя</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                required
                minLength={1}
                maxLength={80}
              />
            </label>
            <label>
              <span>Handle</span>
              <input
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder="visual-learner"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
              />
            </label>
          </>
        )}

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "register" ? 10 : undefined}
            maxLength={256}
          />
        </label>

        {formError && <div className="account-auth-error">{formError}</div>}

        <button type="submit" disabled={busy}>
          {busy
            ? "Подключаю…"
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </button>
        {mode === "login" && passwordResetAvailable && (
          <button
            type="button"
            className="account-auth-recovery-link"
            onClick={() => {
              setFormError(null);
              setRecoveryOpen(true);
            }}
          >
            Забыли пароль?
          </button>
        )}
      </form>
    </section>
  );
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
      displayName: draft.displayName.trim() || "VisualMath User",
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
          <p>{serverProfile.bio || "Профиль VisualMath"}</p>
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
