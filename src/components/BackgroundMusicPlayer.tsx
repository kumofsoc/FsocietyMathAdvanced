import { useEffect, useRef, useState } from "react";
import {
  deleteBackgroundTrack,
  loadBackgroundTrack,
  saveBackgroundTrack,
} from "../lib/backgroundAudio";
import "../styles/background-music.css";

const VOLUME_KEY = "fsociety-background-music-volume-v1";
const LOOP_KEY = "fsociety-background-music-loop-v1";
const MAX_LOCAL_TRACK_BYTES = 120 * 1024 * 1024;

export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [trackName, setTrackName] = useState<string | null>(null);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(() => {
    const value = Number(localStorage.getItem(VOLUME_KEY) ?? ".35");
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : .35;
  });
  const [loop, setLoop] = useState(() => localStorage.getItem(LOOP_KEY) !== "0");
  const autoPlayAfterLoad = useRef(false);

  const setObjectUrl = (blob: Blob, name: string) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setTrackName(name);
    setTrackUrl(url);
  };

  useEffect(() => {
    let cancelled = false;
    void loadBackgroundTrack()
      .then((track) => {
        if (cancelled || !track) return;
        setObjectUrl(track.blob, track.name);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось восстановить локальный трек.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.loop = loop;
    localStorage.setItem(VOLUME_KEY, String(volume));
    localStorage.setItem(LOOP_KEY, loop ? "1" : "0");
  }, [volume, loop]);

  useEffect(() => {
    if (!trackUrl || !autoPlayAfterLoad.current) return;
    autoPlayAfterLoad.current = false;
    const frame = requestAnimationFrame(() => {
      void audioRef.current?.play().catch(() => {
        setError("Браузер заблокировал autoplay — нажми Play.");
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [trackUrl]);

  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Нужен аудиофайл.");
      return;
    }
    if (file.size > MAX_LOCAL_TRACK_BYTES) {
      setError("Локальный трек ограничен 120 MB.");
      return;
    }

    setError(null);
    autoPlayAfterLoad.current = true;
    setObjectUrl(file, file.name);
    try {
      await saveBackgroundTrack(file);
    } catch {
      setError("Трек играет, но браузер не смог сохранить его между перезапусками.");
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !trackUrl) {
      fileRef.current?.click();
      return;
    }
    if (audio.paused) {
      setError(null);
      await audio.play().catch(() => setError("Не удалось запустить аудио."));
    } else {
      audio.pause();
    }
  };

  const clearTrack = async () => {
    audioRef.current?.pause();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setTrackUrl(null);
    setTrackName(null);
    setPlaying(false);
    setError(null);
    await deleteBackgroundTrack().catch(() => undefined);
  };

  return (
    <div className={"background-music " + (open ? "open" : "")}>
      <audio
        ref={audioRef}
        src={trackUrl ?? undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <input
        ref={fileRef}
        className="background-music-file"
        type="file"
        accept="audio/*"
        onChange={(event) => {
          void chooseFile(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />

      <button
        className="background-music-orb"
        onClick={() => setOpen((value) => !value)}
        title="Фоновая музыка"
        aria-label="Фоновая музыка"
      >
        <span>{playing ? "♫" : "♪"}</span>
        {playing && <i />}
      </button>

      {open && (
        <section className="background-music-panel">
          <header>
            <div>
              <span>BACKGROUND AUDIO / LOCAL</span>
              <strong>{trackName ?? (loading ? "Загружаю…" : "Трек не выбран")}</strong>
            </div>
            <button onClick={() => setOpen(false)}>×</button>
          </header>

          <div className="background-music-controls">
            <button className="music-play" onClick={() => void togglePlayback()}>
              {trackUrl ? (playing ? "❚❚ Pause" : "▶ Play") : "+ Загрузить песню"}
            </button>
            <button onClick={() => fileRef.current?.click()}>Заменить</button>
          </div>

          <label className="background-music-volume">
            <span>VOLUME</span>
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
            <b>{Math.round(volume * 100)}%</b>
          </label>

          <label className="background-music-loop">
            <input
              type="checkbox"
              checked={loop}
              onChange={(event) => setLoop(event.target.checked)}
            />
            <span>Loop</span>
          </label>

          {trackName && (
            <button className="background-music-remove" onClick={() => void clearTrack()}>
              Удалить локальный трек
            </button>
          )}

          <p>
            Файл хранится только в браузере через IndexedDB и не отправляется на сервер.
            После подключения backend этот player уже изолирован от transport-слоя.
          </p>
          {error && <div className="background-music-error">{error}</div>}
        </section>
      )}
    </div>
  );
}
