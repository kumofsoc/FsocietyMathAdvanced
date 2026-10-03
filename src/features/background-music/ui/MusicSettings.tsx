import { useEffect, useRef, useState } from "react";
import {
  clearBackgroundTracks,
  deleteBackgroundTrack,
  musicCommand,
  MUSIC_STATE_EVENT,
  saveBackgroundTracks,
  type BackgroundMusicState,
} from "@/lib/backgroundAudio";

const MAX_LOCAL_TRACK_BYTES = 120 * 1024 * 1024;
const AUDIO_FILE_EXTENSION = /\.(?:mp3|wav|ogg|oga|m4a|aac|flac|webm|opus)$/i;

function isAudioFile(file: File) {
  return file.type.startsWith("audio/") || AUDIO_FILE_EXTENSION.test(file.name);
}

const EMPTY_STATE: BackgroundMusicState = {
  tracks: [],
  currentTrackId: null,
  playing: false,
  volume: .35,
  loopPlaylist: true,
  ready: false,
};

export function MusicSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const clearTriggerRef = useRef<HTMLButtonElement>(null);
  const clearConfirmRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<BackgroundMusicState>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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
    const accepted = [...files].filter(isAudioFile);
    const oversized = accepted.find((file) => file.size > MAX_LOCAL_TRACK_BYTES);
    if (oversized) {
      setError(`${oversized.name}: максимум 120 MB на трек.`);
      return;
    }
    if (accepted.length !== files.length) {
      setError("Часть файлов пропущена: поддерживаются аудиофайлы MP3, WAV, OGG, M4A/AAC, FLAC, WebM и Opus.");
    } else {
      setError(null);
    }

    setSaving(true);
    try {
      await saveBackgroundTracks(accepted);
      musicCommand({ type: "refresh" });
    } catch {
      setError("Не удалось сохранить плейлист в браузере.");
    } finally {
      setSaving(false);
    }
  };

  const removeTrack = async (trackId: string) => {
    await deleteBackgroundTrack(trackId).catch(() => undefined);
    musicCommand({ type: "refresh" });
  };

  const clearPlaylist = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearBackgroundTracks();
      musicCommand({ type: "refresh" });
      setClearModalOpen(false);
      setError(null);
    } catch {
      setError("Не удалось очистить локальный плейлист.");
    } finally {
      setClearing(false);
    }
  };

  const current = state.tracks.find((track) => track.id === state.currentTrackId);
  const trackWord =
    state.tracks.length % 10 === 1 && state.tracks.length % 100 !== 11
      ? "песню"
      : state.tracks.length % 10 >= 2 &&
          state.tracks.length % 10 <= 4 &&
          (state.tracks.length % 100 < 10 || state.tracks.length % 100 >= 20)
        ? "песни"
        : "песен";

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
        <p>
          Добавляй несколько песен и собирай локальный плейлист. Файлы остаются только
          в этом браузере и не отправляются на сервер.
        </p>
      </div>

      <div className="music-now-playing">
        <div>
          <span>СЕЙЧАС ИГРАЕТ</span>
          <strong>{current?.name ?? (state.ready ? "Плейлист пуст" : "Загружаю…")}</strong>
        </div>
        <div className="music-player-controls">
          <button onClick={() => musicCommand({ type: "previous" })} disabled={!state.tracks.length} aria-label="Предыдущая песня">←</button>
          <button
            className="music-main-play"
            onClick={() => state.tracks.length ? musicCommand({ type: "toggle" }) : inputRef.current?.click()}
            aria-label={state.tracks.length ? (state.playing ? "Пауза" : "Воспроизвести") : "Добавить музыку"}
          >
            {state.tracks.length ? (state.playing ? "❚❚" : "▶") : "+"}
          </button>
          <button onClick={() => musicCommand({ type: "next" })} disabled={!state.tracks.length} aria-label="Следующая песня">→</button>
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
          onChange={(event) => musicCommand({ type: "volume", value: Number(event.target.value) })}
        />
        <b>{Math.round(state.volume * 100)}%</b>
      </label>

      <label className="music-settings-loop">
        <input
          type="checkbox"
          checked={state.loopPlaylist}
          onChange={(event) => musicCommand({ type: "loop-playlist", value: event.target.checked })}
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
          <button className="music-playlist-empty" onClick={() => inputRef.current?.click()}>
            <span>♫</span>
            <strong>Добавить первые песни</strong>
            <small>Можно выбрать сразу несколько файлов.</small>
          </button>
        ) : state.tracks.map((track, index) => (
          <article
            key={track.id}
            className={track.id === state.currentTrackId ? "active" : ""}
          >
            <button
              className="music-track-select"
              onClick={() => musicCommand({ type: "select", trackId: track.id })}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{track.name}</strong>
              <small>{track.id === state.currentTrackId && state.playing ? "ИГРАЕТ" : "ЛОКАЛЬНО"}</small>
            </button>
            <button
              className="music-track-remove"
              onClick={() => void removeTrack(track.id)}
              title="Удалить трек"
              aria-label={"Удалить " + track.name}
            >
              ×
            </button>
          </article>
        ))}
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
            if (event.target === event.currentTarget) setClearModalOpen(false);
          }}
        >
          <section
            className="music-clear-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="music-clear-title"
            aria-describedby="music-clear-description"
          >
            <div className="music-clear-modal-icon" aria-hidden="true">!</div>
            <div>
              <span>ОЧИСТКА ПЛЕЙЛИСТА</span>
              <h4 id="music-clear-title">
                Удалить {state.tracks.length} {trackWord}?
              </h4>
              <p id="music-clear-description">
                Эти файлы хранятся только в этом браузере. После очистки их нужно
                будет выбрать заново, если захочешь вернуть музыку.
              </p>
            </div>
            <div className="music-clear-modal-actions">
              <button onClick={() => setClearModalOpen(false)} disabled={clearing}>
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
