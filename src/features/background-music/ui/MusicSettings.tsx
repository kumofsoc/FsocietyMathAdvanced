import { useEffect, useRef, useState } from "react";
import {
  clearBackgroundTracks,
  deleteBackgroundTrack,
  importLocalBackgroundTracksToServer,
  musicCommand,
  MUSIC_STATE_EVENT,
  renameBackgroundTrack,
  reorderBackgroundTracks,
  saveBackgroundTracks,
  type BackgroundMusicState,
} from "@/lib/backgroundAudio";

const MAX_TRACK_BYTES = 120 * 1024 * 1024;

const EMPTY_STATE: BackgroundMusicState = {
  tracks: [],
  currentTrackId: null,
  playing: false,
  volume: .35,
  loopPlaylist: true,
  ready: false,
  storageMode: "local",
  localImportCount: 0,
};

export function MusicSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const clearTriggerRef = useRef<HTMLButtonElement>(null);
  const clearConfirmRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<BackgroundMusicState>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const onState = (event: Event) => {
      setState((event as CustomEvent<BackgroundMusicState>).detail);
    };
    window.addEventListener(MUSIC_STATE_EVENT, onState);
    musicCommand({ type: "request-state" });
    return () => window.removeEventListener(MUSIC_STATE_EVENT, onState);
  }, []);

  useEffect(() => {
    if (!clearModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => clearConfirmRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setClearModalOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => clearTriggerRef.current?.focus());
    };
  }, [clearModalOpen]);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const accepted = [...files].filter((file) => file.type.startsWith("audio/"));
    const oversized = accepted.find((file) => file.size > MAX_TRACK_BYTES);
    if (oversized) {
      setError(`${oversized.name}: максимум 120 MB на трек.`);
      return;
    }
    if (accepted.length !== files.length) {
      setError("Часть файлов пропущена: поддерживаются только аудиофайлы.");
    } else {
      setError(null);
    }

    setSaving(true);
    try {
      await saveBackgroundTracks(accepted);
      musicCommand({ type: "refresh" });
    } catch {
      setError("Не удалось сохранить аудио.");
    } finally {
      setSaving(false);
    }
  };

  const removeTrack = async (
    track: BackgroundMusicState["tracks"][number],
  ) => {
    try {
      await deleteBackgroundTrack(track.id, track.source);
      musicCommand({ type: "refresh" });
    } catch {
      setError("Не удалось удалить трек.");
    }
  };

  const renameTrack = async (
    track: BackgroundMusicState["tracks"][number],
  ) => {
    const nextName = window.prompt("Новое название трека", track.name);
    if (!nextName || nextName.trim() === track.name) return;
    try {
      await renameBackgroundTrack(track.id, nextName, track.source);
      musicCommand({ type: "refresh" });
    } catch {
      setError("Не удалось переименовать трек.");
    }
  };

  const moveTrack = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.tracks.length) return;
    const next = [...state.tracks];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderBackgroundTracks(next);
      musicCommand({ type: "refresh" });
    } catch {
      setError("Плейлист изменился на сервере. Обнови и повтори.");
      musicCommand({ type: "refresh" });
    }
  };

  const importLocal = async () => {
    if (importing) return;
    setImporting(true);
    setError(null);
    try {
      const result = await importLocalBackgroundTracksToServer();
      if (result.failed) {
        setError(
          `Импортировано: ${result.imported}. Не удалось: ${result.failed}. Локальные файлы сохранены.`,
        );
      }
      musicCommand({ type: "refresh" });
    } catch {
      setError("Не удалось импортировать локальный плейлист.");
    } finally {
      setImporting(false);
    }
  };

  const clearPlaylist = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearBackgroundTracks(state.tracks);
      musicCommand({ type: "refresh" });
      setClearModalOpen(false);
      setError(null);
    } catch {
      setError("Не удалось очистить плейлист.");
    } finally {
      setClearing(false);
    }
  };

  const current = state.tracks.find(
    (track) => track.id === state.currentTrackId,
  );
  const trackWord =
    state.tracks.length % 10 === 1 && state.tracks.length % 100 !== 11
      ? "песню"
      : state.tracks.length % 10 >= 2 &&
          state.tracks.length % 10 <= 4 &&
          (state.tracks.length % 100 < 10 || state.tracks.length % 100 >= 20)
        ? "песни"
        : "песен";

  const storageCopy =
    state.storageMode === "server"
      ? "Плейлист хранится в аккаунте VisualMath. Контент загружается авторизованным запросом, без токена в URL."
      : state.storageMode === "local-fallback"
        ? "Server media временно недоступен. VisualMath продолжает работать с локальным IndexedDB плейлистом."
        : "Плейлист хранится только в IndexedDB этого браузера.";

  return (
    <section className="music-settings">
      <input
        ref={inputRef}
        className="background-music-file"
        type="file"
        accept="audio/*"
        multiple
        onChange={(event) => {
          void addFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />

      <div className="settings-section-copy">
        <h3>Фоновая музыка</h3>
        <p>{storageCopy}</p>
      </div>

      {state.storageMode === "server" && state.localImportCount > 0 && (
        <div className="music-import-local">
          <div>
            <strong>Локальный плейлист найден</strong>
            <span>
              {state.localImportCount} треков можно явно импортировать в аккаунт.
              Исходные IndexedDB-файлы не удалятся.
            </span>
          </div>
          <button
            type="button"
            disabled={importing}
            onClick={() => void importLocal()}
          >
            {importing ? "Импортирую…" : "Импортировать"}
          </button>
        </div>
      )}

      <div className="music-now-playing">
        <div>
          <span>СЕЙЧАС ИГРАЕТ</span>
          <strong>
            {current?.name ?? (state.ready ? "Плейлист пуст" : "Загружаю…")}
          </strong>
        </div>
        <div className="music-player-controls">
          <button
            onClick={() => musicCommand({ type: "previous" })}
            disabled={!state.tracks.length}
            aria-label="Предыдущая песня"
          >
            ←
          </button>
          <button
            className="music-main-play"
            onClick={() =>
              state.tracks.length
                ? musicCommand({ type: "toggle" })
                : inputRef.current?.click()
            }
            aria-label={
              state.tracks.length
                ? state.playing
                  ? "Пауза"
                  : "Воспроизвести"
                : "Добавить музыку"
            }
          >
            {state.tracks.length ? (state.playing ? "❚❚" : "▶") : "+"}
          </button>
          <button
            onClick={() => musicCommand({ type: "next" })}
            disabled={!state.tracks.length}
            aria-label="Следующая песня"
          >
            →
          </button>
        </div>
      </div>

      <label className="music-settings-volume">
        <span>Громкость</span>
        <input
          type="range"
          min="0"
          max="1"
          step=".01"
          value={state.volume}
          onChange={(event) =>
            musicCommand({
              type: "volume",
              value: Number(event.target.value),
            })
          }
        />
        <b>{Math.round(state.volume * 100)}%</b>
      </label>

      <label className="music-settings-loop">
        <input
          type="checkbox"
          checked={state.loopPlaylist}
          onChange={(event) =>
            musicCommand({
              type: "loop-playlist",
              value: event.target.checked,
            })
          }
        />
        <span>Повторять плейлист после последней песни</span>
      </label>

      <div className="music-playlist-head">
        <div>
          <strong>Плейлист</strong>
          <span>{state.tracks.length} треков</span>
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={saving}>
          {saving ? "Добавляю…" : "+ Добавить песни"}
        </button>
      </div>

      <div className="music-playlist">
        {state.tracks.length === 0 ? (
          <button
            className="music-playlist-empty"
            onClick={() => inputRef.current?.click()}
          >
            <span>♫</span>
            <strong>Добавить первые песни</strong>
            <small>Можно выбрать сразу несколько файлов.</small>
          </button>
        ) : (
          state.tracks.map((track, index) => (
            <article
              key={track.source + ":" + track.id}
              className={
                track.id === state.currentTrackId ? "active" : ""
              }
            >
              <button
                className="music-track-select"
                onClick={() =>
                  musicCommand({ type: "select", trackId: track.id })
                }
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{track.name}</strong>
                <small>
                  {track.id === state.currentTrackId && state.playing
                    ? "ИГРАЕТ"
                    : track.source === "server"
                      ? "ACCOUNT"
                      : "ЛОКАЛЬНО"}
                </small>
              </button>
              <div className="music-track-actions">
                <button
                  type="button"
                  onClick={() => void moveTrack(index, -1)}
                  disabled={index === 0}
                  aria-label={"Переместить выше " + track.name}
                  title="Выше"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => void moveTrack(index, 1)}
                  disabled={index === state.tracks.length - 1}
                  aria-label={"Переместить ниже " + track.name}
                  title="Ниже"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => void renameTrack(track)}
                  aria-label={"Переименовать " + track.name}
                  title="Переименовать"
                >
                  ✎
                </button>
                <button
                  className="music-track-remove"
                  onClick={() => void removeTrack(track)}
                  title="Удалить трек"
                  aria-label={"Удалить " + track.name}
                >
                  ×
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {state.tracks.length > 0 && (
        <button
          ref={clearTriggerRef}
          className="music-clear-playlist"
          onClick={() => setClearModalOpen(true)}
        >
          Очистить весь плейлист
        </button>
      )}

      {error && <div className="background-music-error">{error}</div>}

      {clearModalOpen && (
        <div
          className="music-clear-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setClearModalOpen(false);
            }
          }}
        >
          <section
            className="music-clear-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="music-clear-title"
            aria-describedby="music-clear-description"
          >
            <div className="music-clear-modal-icon" aria-hidden="true">
              !
            </div>
            <div>
              <span>ОЧИСТКА ПЛЕЙЛИСТА</span>
              <h4 id="music-clear-title">
                Удалить {state.tracks.length} {trackWord}?
              </h4>
              <p id="music-clear-description">
                {state.storageMode === "server"
                  ? "Будет очищен серверный плейлист аккаунта. Локальные IndexedDB-файлы останутся в браузере."
                  : "Локальные файлы будут удалены из IndexedDB этого браузера."}
              </p>
            </div>
            <div className="music-clear-modal-actions">
              <button
                onClick={() => setClearModalOpen(false)}
                disabled={clearing}
              >
                Отмена
              </button>
              <button
                ref={clearConfirmRef}
                className="danger"
                onClick={() => void clearPlaylist()}
                disabled={clearing}
              >
                {clearing ? "Удаляю…" : "Удалить все песни"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
