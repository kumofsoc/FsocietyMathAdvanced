import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { chapters } from "@/data/courseMeta";
import {
  getChapterProgress,
  isTrackedChapter,
  isTrackedTopic,
  type LearningSnapshot,
} from "@/features/learning/model/progress";
import { loadSavedTheorems } from "@/features/learning/model/learning";
import {
  loadLocalProfile,
  saveLocalProfile,
  type LocalProfile,
} from "@/features/account/model/localProfile";
import {
  lastActivityDays,
  loadAccountActivity,
  type AccountActivity,
} from "@/features/account/model/accountActivity";
import { useAuthStore } from "@/features/auth/model/authSession";
import { ApiError, isBackendConfigured } from "@/shared/api/client";
import "@/features/account-experience/styles/account-experience.css";
import "@/features/account-experience/styles/account-runtime.css";

type ProfileDraft = {
  displayName: string;
  handle: string;
  bio: string;
};

function profileErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "handle_taken") return "Этот ник уже занят.";
    if (error.code === "validation_error") return "Проверь введённые данные.";
    if (error.status === 401) return "Сессия истекла. Войди заново.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка.";
}

export function AccountPage({
  progress,
  snapshot,
}: {
  progress: number;
  snapshot: LearningSnapshot;
}) {
  const backendConfigured = isBackendConfigured();
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateServerProfile = useAuthStore((state) => state.updateProfile);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  const [localProfile, setLocalProfile] = useState<LocalProfile>(loadLocalProfile);
  const [draft, setDraft] = useState<ProfileDraft>(() => ({
    displayName: localProfile.displayName,
    handle: localProfile.handle,
    bio: localProfile.bio,
  }));
  const [editing, setEditing] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authHandle, setAuthHandle] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activity, setActivity] = useState<AccountActivity | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  const serverProfile =
    authStatus === "authenticated" && user ? user.profile : null;
  const activeProfile = serverProfile ?? localProfile;
  const savedCount = loadSavedTheorems().length;

  useEffect(() => {
    const next = serverProfile ?? localProfile;
    setDraft({
      displayName: next.displayName,
      handle: next.handle,
      bio: next.bio,
    });
    setEditing(false);
    setProfileError(null);
  }, [serverProfile, localProfile]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setActivity(null);
      setActivityError(null);
      return;
    }

    let cancelled = false;
    setActivityError(null);
    void loadAccountActivity(new Date().getUTCFullYear())
      .then((next) => {
        if (!cancelled) setActivity(next);
      })
      .catch((error) => {
        if (cancelled) return;
        setActivity(null);
        setActivityError(profileErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

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

  const recentActivity = useMemo(
    () => lastActivityDays(activity?.days ?? [], 28),
    [activity],
  );
  const maxRecentCount = Math.max(
    1,
    ...recentActivity.map((item) => item.count),
  );
  const visitPoints = recentActivity
    .map((item, index) => {
      const denominator = Math.max(1, recentActivity.length - 1);
      const x = 20 + (index / denominator) * 680;
      const y = 206 - (item.count / maxRecentCount) * 160;
      return x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");

  const saveProfile = async () => {
    setProfileBusy(true);
    setProfileError(null);
    try {
      if (serverProfile) {
        await updateServerProfile({
          displayName: draft.displayName.trim(),
          handle: draft.handle.trim().replace(/^@/, ""),
          bio: draft.bio.trim(),
        });
      } else {
        const next = saveLocalProfile({
          ...localProfile,
          displayName: draft.displayName,
          handle: draft.handle,
          bio: draft.bio,
        });
        setLocalProfile(next);
      }
      setEditing(false);
    } catch (error) {
      setProfileError(profileErrorMessage(error));
    } finally {
      setProfileBusy(false);
    }
  };

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError(null);
    try {
      if (authMode === "login") {
        await login({
          email: authEmail.trim(),
          password: authPassword,
        });
      } else {
        await register({
          email: authEmail.trim(),
          password: authPassword,
          handle: authHandle.trim().replace(/^@/, ""),
          displayName: authDisplayName.trim(),
          bio: localProfile.bio,
        });
      }
      setAuthPassword("");
    } catch (error) {
      setAuthError(profileErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    setProfileError(null);
    try {
      await logout();
    } catch (error) {
      setProfileError(profileErrorMessage(error));
    }
  };

  const initials = activeProfile.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joined = new Date(activeProfile.joinedAt).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const serverConnected = Boolean(serverProfile);
  const modeLabel = serverConnected
    ? "SERVER PROFILE"
    : backendConfigured
      ? authStatus === "unavailable"
        ? "LOCAL / BACKEND OFFLINE"
        : "LOCAL / SIGN IN"
      : "LOCAL PROFILE";

  return (
    <section className="identity-os">
      <div className="identity-grid-bg" aria-hidden="true" />
      <header className="identity-hero">
        <div className="identity-core">
          <div className="identity-orbit orbit-a" />
          <div className="identity-orbit orbit-b" />
          <div className="identity-orbit orbit-c" />
          <div className="identity-avatar">
            <span>{initials}</span>
            <small>VM.ID</small>
          </div>
          <div
            className="identity-pointer"
            style={{ "--identity-progress": progress } as CSSProperties}
            aria-hidden="true"
          />
          <em className="identity-tag tag-a">{modeLabel}</em>
          <em className="identity-tag tag-b">
            {serverConnected ? "SYNC ACTIVE" : "LOCAL-FIRST"}
          </em>
        </div>

        <div className="identity-copy">
          <div className="identity-kicker">
            <span>ПРОФИЛЬ</span>
            <i>
              {serverConnected
                ? user?.email ?? "ACCOUNT DATA"
                : "ДАННЫЕ НА ЭТОМ УСТРОЙСТВЕ"}
            </i>
          </div>
          <h1>{activeProfile.displayName}</h1>
          <div className="identity-handle">@{activeProfile.handle}</div>
          <p>{activeProfile.bio}</p>
          <div className="identity-meta">
            <span>JOINED / {joined}</span>
            <span>MASTERY / {progress}%</span>
            <span>РАЗДЕЛОВ / {chapterRows.length}</span>
          </div>
          <div className="identity-actions">
            <button
              className="identity-primary"
              onClick={() => setEditing((value) => !value)}
            >
              <small>РЕДАКТИРОВАНИЕ ПРОФИЛЯ</small>
              <strong>{editing ? "ЗАКРЫТЬ" : "ИЗМЕНИТЬ ПРОФИЛЬ"}</strong>
            </button>
            <button onClick={() => (window.location.hash = "map")}>
              <small>КАРТА КУРСА</small>
              <strong>ОТКРЫТЬ ↗</strong>
            </button>
            {serverConnected && (
              <button onClick={() => void handleLogout()}>
                <small>ACCOUNT SESSION</small>
                <strong>ВЫЙТИ</strong>
              </button>
            )}
          </div>
        </div>

        <aside className="identity-signature">
          <span>СТАТИСТИКА ОБУЧЕНИЯ</span>
          <strong>
            {String(snapshot.theory.size).padStart(2, "0")}·
            {String(snapshot.solved.size).padStart(2, "0")}
          </strong>
          <small>ТЕМЫ / ЗАДАЧИ</small>
          {recentActivity.length ? (
            <div aria-hidden="true">
              {recentActivity.map((item) => (
                <i
                  key={item.date}
                  style={{
                    height:
                      Math.max(4, (item.count / maxRecentCount) * 100) + "%",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="identity-signature-empty">NO SERVER ACTIVITY</div>
          )}
          <em>{serverConnected ? "SERVER + LOCAL CACHE" : "LOCAL DATA"}</em>
        </aside>
      </header>

      {backendConfigured && !serverConnected && (
        <section className="identity-auth">
          <header>
            <div>
              <span>ACCOUNT / BACKEND</span>
              <h2>
                {authStatus === "booting"
                  ? "Восстанавливаю сессию…"
                  : authStatus === "unavailable"
                    ? "Backend недоступен."
                    : authMode === "login"
                      ? "Войти в VisualMath."
                      : "Создать аккаунт."}
              </h2>
            </div>
            {authStatus === "unavailable" && (
              <button type="button" onClick={() => void bootstrap()}>
                Повторить соединение
              </button>
            )}
          </header>

          {authStatus === "anonymous" && (
            <>
              <div className="identity-auth-tabs">
                <button
                  className={authMode === "login" ? "active" : ""}
                  onClick={() => setAuthMode("login")}
                >
                  Вход
                </button>
                <button
                  className={authMode === "register" ? "active" : ""}
                  onClick={() => setAuthMode("register")}
                >
                  Регистрация
                </button>
              </div>

              <form onSubmit={(event) => void submitAuth(event)}>
                {authMode === "register" && (
                  <>
                    <label>
                      <span>ИМЯ</span>
                      <input
                        value={authDisplayName}
                        onChange={(event) => setAuthDisplayName(event.target.value)}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label>
                      <span>НИК</span>
                      <input
                        value={authHandle}
                        onChange={(event) => setAuthHandle(event.target.value)}
                        autoComplete="username"
                        required
                      />
                    </label>
                  </>
                )}
                <label>
                  <span>EMAIL</span>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>ПАРОЛЬ</span>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={authBusy}>
                  {authBusy
                    ? "Отправляю…"
                    : authMode === "login"
                      ? "Войти"
                      : "Создать аккаунт"}
                </button>
              </form>
            </>
          )}

          {authStatus === "unavailable" && (
            <p>
              Курс продолжает работать local-first. Прогресс и настройки не
              теряются и синхронизируются после восстановления backend.
            </p>
          )}
          {authError && <div className="identity-runtime-error">{authError}</div>}
        </section>
      )}

      {editing && (
        <section className="identity-editor">
          <header>
            <span>РЕДАКТИРОВАНИЕ ПРОФИЛЯ</span>
            <b>
              {serverConnected
                ? "ИЗМЕНЕНИЯ СОХРАНЯЮТСЯ В АККАУНТЕ"
                : "ИЗМЕНЕНИЯ СОХРАНЯЮТСЯ НА ЭТОМ УСТРОЙСТВЕ"}
            </b>
          </header>
          <div>
            <label>
              <span>ИМЯ</span>
              <input
                value={draft.displayName}
                onChange={(event) =>
                  setDraft({ ...draft, displayName: event.target.value })
                }
              />
            </label>
            <label>
              <span>НИК</span>
              <input
                value={draft.handle}
                onChange={(event) =>
                  setDraft({ ...draft, handle: event.target.value })
                }
              />
            </label>
            <label className="identity-editor-bio">
              <span>О СЕБЕ</span>
              <textarea
                value={draft.bio}
                onChange={(event) =>
                  setDraft({ ...draft, bio: event.target.value })
                }
              />
            </label>
            <button
              onClick={() => void saveProfile()}
              disabled={profileBusy}
            >
              <small>СОХРАНИТЬ</small>
              <strong>{profileBusy ? "СОХРАНЯЮ…" : "СОХРАНИТЬ ИЗМЕНЕНИЯ"}</strong>
            </button>
          </div>
          {profileError && (
            <div className="identity-runtime-error">{profileError}</div>
          )}
        </section>
      )}

      <section className="identity-stat-strip">
        {[
          ["01", progress + "%", "Освоение курса", "TRACKED MASTERY"],
          ["02", snapshot.solved.size, "Решено задач", "CANONICAL PROGRESS CACHE"],
          ["03", snapshot.theory.size, "Изучено тем", "THEORY MARKED"],
          [
            "04",
            serverConnected ? activity?.stats.activeDays ?? "—" : savedCount,
            serverConnected ? "Активных дней" : "Сохранено",
            serverConnected ? "LAST 28 DAYS" : "LOCAL LIBRARY",
          ],
        ].map(([code, value, title, copy]) => (
          <article key={code}>
            <div>
              <span>{code}</span>
              <small>ДАННЫЕ ПРОГРЕССА</small>
            </div>
            <strong>{value}</strong>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <div className="identity-dashboard">
        <section className="identity-module identity-activity">
          <header>
            <div>
              <span>АКТИВНОСТЬ</span>
              <h2>Активность по дням.</h2>
            </div>
            <b>{serverConnected ? "SERVER DATA" : "НУЖЕН АККАУНТ"}</b>
          </header>
          {activity?.days.length ? (
            <>
              <div className="identity-heatmap-frame">
                <div className="identity-heatmap" aria-label="Карта активности">
                  {activity.days.map((day) => (
                    <i
                      key={day.date}
                      className={"level-" + day.level}
                      title={day.date + " · " + day.count}
                    />
                  ))}
                </div>
              </div>
              <footer>
                <span>LOW</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <i key={level} className={"level-" + level} />
                ))}
                <span>HIGH</span>
              </footer>
            </>
          ) : (
            <div className="identity-activity-empty">
              <strong>
                {activityError
                  ? "Не удалось загрузить activity."
                  : "Серверной активности пока нет."}
              </strong>
              <p>
                {activityError ??
                  (serverConnected
                    ? "События появятся после реального изучения тем и решения задач."
                    : "Войди в аккаунт, чтобы heatmap строился по реальным server events.")}
              </p>
            </div>
          )}
        </section>

        <section className="identity-module identity-wave">
          <header>
            <div>
              <span>СОБЫТИЯ</span>
              <h2>Последние 28 дней.</h2>
            </div>
            <b>{serverConnected ? "REAL ACTIVITY" : "NO MOCK DATA"}</b>
          </header>
          {recentActivity.length ? (
            <>
              <svg viewBox="0 0 720 240" role="img" aria-label="События за последние 28 дней">
                <g>
                  {[46, 86, 126, 166, 206].map((y) => (
                    <line key={y} x1="20" x2="700" y1={y} y2={y} />
                  ))}
                </g>
                <polyline points={visitPoints} />
                {recentActivity.map((item, index) => {
                  const denominator = Math.max(1, recentActivity.length - 1);
                  const x = 20 + (index / denominator) * 680;
                  const y = 206 - (item.count / maxRecentCount) * 160;
                  return <circle key={item.date} cx={x} cy={y} r="3" />;
                })}
              </svg>
              <div className="identity-wave-axis">
                <span>−28D</span>
                <span>−14D</span>
                <span>NOW</span>
              </div>
            </>
          ) : (
            <div className="identity-activity-empty compact">
              <strong>Демонстрационные графики удалены.</strong>
              <p>Здесь отображаются только реальные данные backend.</p>
            </div>
          )}
        </section>
      </div>

      <section className="identity-module identity-sectors">
        <header>
          <div>
            <span>РАЗДЕЛЫ КУРСА</span>
            <h2>Прогресс по разделам.</h2>
          </div>
          <b>{chapterRows.length} ОТСЛЕЖИВАЕТСЯ</b>
        </header>
        <div className="identity-sector-grid">
          {chapterRows.map((row, index) => (
            <button
              key={row.id}
              onClick={() => (window.location.hash = row.topicId)}
            >
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>CH/{row.number}</small>
              </div>
              <strong>{row.title}</strong>
              <i>
                <b style={{ width: row.progress + "%" }} />
              </i>
              <em>{row.progress}%</em>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
