import { useEffect, useRef, useState } from "react";
import {
  clearBackgroundTracks,
  deleteBackgroundTrack,
  musicCommand,
  MUSIC_STATE_EVENT,
  saveBackgroundTracks,
  type BackgroundMusicState,
} from "../lib/backgroundAudio";

const MAX_LOCAL_TRACK_BYTES = 120 * 1024 * 1024;

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
  const [state, setState] = useState<BackgroundMusicState>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onState = (event: Event) => {
      setState((event as CustomEvent<BackgroundMusicState>).detail);
    };
    window.addEventListener(MUSIC_STATE_EVENT, onState);
    musicCommand({ type: "request-state" });
    return () => window.removeEventListener(MUSIC_STATE_EVENT, onState);
  }, []);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const accepted = [...files].filter((file) => file.type.startsWith("audio/"));
    const oversized = accepted.find((file) => file.size > MAX_LOCAL_TRACK_BYTES);
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
    await clearBackgroundTracks().catch(() => undefined);
    musicCommand({ type: "refresh" });
  };

  const current = state.tracks.find((track) => track.id === state.currentTrackId);

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
          <button onClick={() => musicCommand({ type: "previous" })} disabled={!state.tracks.length}>←</button>
          <button
            className="music-main-play"
            onClick={() => state.tracks.length ? musicCommand({ type: "toggle" }) : inputRef.current?.click()}
          >
            {state.tracks.length ? (state.playing ? "❚❚" : "▶") : "+"}
          </button>
          <button onClick={() => musicCommand({ type: "next" })} disabled={!state.tracks.length}>→</button>
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
              <small>{track.id === state.currentTrackId && state.playing ? "PLAYING" : "LOCAL"}</small>
            </button>
            <button
              className="music-track-remove"
              onClick={() => void removeTrack(track.id)}
              title="Удалить трек"
            >
              ×
            </button>
          </article>
        ))}
      </div>

      {state.tracks.length > 0 && (
        <button className="music-clear-playlist" onClick={() => void clearPlaylist()}>
          Очистить весь плейлист
        </button>
      )}

      {error && <div className="background-music-error">{error}</div>}
    </section>
  );
}
