import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/model/authSession";
import { api } from "@/shared/api/client";
import { apiErrorMessage } from "@/shared/api/errorPresentation";
import { visualMathHashParam } from "@/shared/lib/blockDeepLink";

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

export function AccountAuthGate() {
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

