import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/model/authSession";
import { api, ApiError } from "@/shared/api/client";
import type { AccountSessionDto } from "@/shared/api/types";

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "network_error") return "Backend сейчас недоступен.";
    if (error.code === "request_timeout") return "Backend не ответил вовремя.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка.";
}

export function AccountSecurityControls() {
  const userId = useAuthStore((state) => state.user?.id);
  const revokeSession = useAuthStore((state) => state.revokeSession);
  const changePassword = useAuthStore((state) => state.changePassword);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [sessions, setSessions] = useState<AccountSessionDto[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      setSessionsLoading(false);
      return;
    }

    let cancelled = false;
    setSessionsLoading(true);
    api.me
      .sessions()
      .then((response) => {
        if (cancelled) return;
        setSessions(response.sessions);
        setSessionsError(null);
        setSessionsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setSessionsError(errorMessage(error));
        setSessionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const revokeAccountSession = async (session: AccountSessionDto) => {
    if (revokingSessionId) return;
    setRevokingSessionId(session.id);
    setSessionsError(null);
    try {
      await revokeSession(session.id, session.current);
      if (!session.current) {
        setSessions((current) =>
          current.filter((item) => item.id !== session.id),
        );
        setRevokingSessionId(null);
      }
    } catch (error) {
      setSessionsError(errorMessage(error));
      setRevokingSessionId(null);
    }
  };

  const changeCurrentPassword = async () => {
    if (changingPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("Новые пароли не совпадают.");
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError("Новый пароль должен содержать минимум 10 символов.");
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (error) {
      setPasswordError(errorMessage(error));
      setChangingPassword(false);
    }
  };

  const exportCurrentAccount = async () => {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const blob = await api.me.exportAccount();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        "visualmath-account-" +
        new Date().toISOString().slice(0, 10) +
        ".json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(errorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const deleteCurrentAccount = async () => {
    if (
      deleting ||
      !deletePassword ||
      deletePhrase.trim().toUpperCase() !== "УДАЛИТЬ"
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
    } catch (error) {
      setDeleteError(errorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="account-sessions-zone">
        <header>
          <div>
            <span>ACCOUNT / SESSIONS</span>
            <h2>Активные устройства</h2>
          </div>
          <b>{sessions.length} ACTIVE</b>
        </header>
        <p>
          Здесь только metadata активных backend-сессий. Токены не показываются.
          Можно завершить отдельную сессию; завершение текущей сразу вернёт экран
          входа.
        </p>

        {sessionsLoading ? (
          <div className="account-session-empty">Загружаю активные сессии…</div>
        ) : sessions.length === 0 ? (
          <div className="account-session-empty">Активные сессии не найдены.</div>
        ) : (
          <div className="account-session-list">
            {sessions.map((session) => (
              <article
                key={session.id}
                className={
                  "account-session-row" + (session.current ? " current" : "")
                }
              >
                <div>
                  <div className="account-session-title">
                    <strong>
                      {session.current
                        ? "Это устройство"
                        : session.userAgent || "Неизвестное устройство"}
                    </strong>
                    {session.current && <span>CURRENT</span>}
                  </div>
                  {session.current && session.userAgent && (
                    <em>{session.userAgent}</em>
                  )}
                  <small>
                    IP {session.ipAddress || "—"} · активность{" "}
                    {new Date(session.lastSeenAt).toLocaleString("ru-RU")} ·
                    истекает{" "}
                    {new Date(session.expiresAt).toLocaleString("ru-RU")}
                  </small>
                </div>
                <button
                  type="button"
                  disabled={Boolean(revokingSessionId)}
                  onClick={() => void revokeAccountSession(session)}
                >
                  {revokingSessionId === session.id
                    ? "Завершаю…"
                    : session.current
                      ? "Выйти здесь"
                      : "Завершить"}
                </button>
              </article>
            ))}
          </div>
        )}
        {sessionsError && (
          <div className="account-auth-error">{sessionsError}</div>
        )}
      </section>

      <section className="account-security-zone">
        <header>
          <div>
            <span>ACCOUNT / SECURITY</span>
            <h2>Сменить пароль</h2>
          </div>
          <b>REVOKE ALL</b>
        </header>
        <p>
          После смены пароля backend отзовёт все активные сессии и refresh
          tokens, включая эту вкладку. Затем нужно будет войти снова уже с новым
          паролем.
        </p>

        {!passwordOpen ? (
          <button
            type="button"
            className="account-security-button"
            onClick={() => {
              setPasswordOpen(true);
              setPasswordError(null);
            }}
          >
            Сменить пароль
          </button>
        ) : (
          <div className="account-password-form">
            <label>
              <span>Текущий пароль</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                disabled={changingPassword}
              />
            </label>
            <label>
              <span>Новый пароль</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={10}
                maxLength={256}
                disabled={changingPassword}
              />
            </label>
            <label>
              <span>Повтори новый пароль</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={10}
                maxLength={256}
                disabled={changingPassword}
              />
            </label>
            {passwordError && (
              <div className="account-auth-error">{passwordError}</div>
            )}
            <div className="account-password-actions">
              <button
                type="button"
                onClick={() => {
                  setPasswordOpen(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError(null);
                }}
                disabled={changingPassword}
              >
                Отмена
              </button>
              <button
                type="button"
                className="security"
                disabled={
                  changingPassword ||
                  !currentPassword ||
                  newPassword.length < 10 ||
                  newPassword !== confirmPassword
                }
                onClick={() => void changeCurrentPassword()}
              >
                {changingPassword ? "Меняю…" : "Сменить и выйти"}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="account-export-zone">
        <header>
          <div>
            <span>ACCOUNT / PORTABILITY</span>
            <h2>Экспорт данных</h2>
          </div>
          <b>JSON</b>
        </header>
        <p>
          Скачай канонический серверный snapshot аккаунта перед удалением:
          профиль, настройки, workspace, прогресс, заметки, важные блоки,
          закладки, историю активности и metadata загруженного аудио.
          Пароль, session/refresh secrets и внутренние storage keys в экспорт
          не входят.
        </p>
        <button
          type="button"
          className="account-export-button"
          onClick={() => void exportCurrentAccount()}
          disabled={exporting}
        >
          {exporting ? "Готовлю экспорт…" : "Скачать данные аккаунта"}
        </button>
        {exportError && (
          <div className="account-auth-error">{exportError}</div>
        )}
      </section>

      <section className="account-danger-zone">
        <header>
          <div>
            <span>ACCOUNT / DANGER ZONE</span>
            <h2>Удалить аккаунт</h2>
          </div>
          <b>НЕОБРАТИМО</b>
        </header>
        <p>
          Сервер удалит профиль, прогресс, заметки, отметки, сессии и загруженное
          account-аудио. Локальные anonymous-файлы в IndexedDB не удаляются.
        </p>

        {!deleteOpen ? (
          <button
            type="button"
            className="account-delete-open"
            onClick={() => {
              setDeleteOpen(true);
              setDeleteError(null);
            }}
          >
            Открыть удаление аккаунта
          </button>
        ) : (
          <div className="account-delete-confirm">
            <label>
              <span>Текущий пароль</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                autoComplete="current-password"
                disabled={deleting}
              />
            </label>
            <label>
              <span>Напиши УДАЛИТЬ</span>
              <input
                value={deletePhrase}
                onChange={(event) => setDeletePhrase(event.target.value)}
                autoComplete="off"
                disabled={deleting}
              />
            </label>
            {deleteError && (
              <div className="account-auth-error">{deleteError}</div>
            )}
            <div className="account-delete-actions">
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeletePassword("");
                  setDeletePhrase("");
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Отмена
              </button>
              <button
                type="button"
                className="danger"
                disabled={
                  deleting ||
                  !deletePassword ||
                  deletePhrase.trim().toUpperCase() !== "УДАЛИТЬ"
                }
                onClick={() => void deleteCurrentAccount()}
              >
                {deleting ? "Удаляю…" : "Удалить навсегда"}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
