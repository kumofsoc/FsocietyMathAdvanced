import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadBackgroundTracks,
  MUSIC_COMMAND_EVENT,
  MUSIC_STATE_EVENT,
  type BackgroundMusicCommand,
  type BackgroundMusicState,
  type StoredBackgroundTrack,
} from "@/lib/backgroundAudio";
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from "@/shared/lib/browserStorage";
import "@/styles/background-music.css";

const VOLUME_KEY = "fsociety-background-music-volume-v1";
const LOOP_PLAYLIST_KEY = "visualmath-background-music-loop-playlist-v1";
const CURRENT_TRACK_KEY = "visualmath-background-music-current-v1";

export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const autoPlayRef = useRef(false);
  const [tracks, setTracks] = useState<StoredBackgroundTrack[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(() =>
    readLocalStorage(CURRENT_TRACK_KEY),
  );
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(() => {
    const value = Number(readLocalStorage(VOLUME_KEY) ?? ".35");
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : .35;
  });
  const [loopPlaylist, setLoopPlaylist] = useState(
    () => readLocalStorage(LOOP_PLAYLIST_KEY) !== "0",
  );

  const currentIndex = useMemo(
    () => tracks.findIndex((track) => track.id === currentTrackId),
    [tracks, currentTrackId],
  );

  const emitState = useCallback(() => {
    const state: BackgroundMusicState = {
      tracks: tracks.map(({ id, name, type, updatedAt }) => ({ id, name, type, updatedAt })),
      currentTrackId,
      playing,
      volume,
      loopPlaylist,
      ready,
    };
    window.dispatchEvent(new CustomEvent<BackgroundMusicState>(MUSIC_STATE_EVENT, {
      detail: state,
    }));
  }, [tracks, currentTrackId, playing, volume, loopPlaylist, ready]);

  const refreshTracks = useCallback(async () => {
    const loaded = await loadBackgroundTracks().catch(() => []);
    setTracks(loaded);
    setCurrentTrackId((current) => {
      if (current && loaded.some((track) => track.id === current)) return current;
      return loaded[0]?.id ?? null;
    });
    setReady(true);
  }, []);

  useEffect(() => {
    void refreshTracks();
  }, [refreshTracks]);

  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(emitState);
    return () => cancelAnimationFrame(frame);
  }, [emitState, ready]);

  useEffect(() => {
    const track = tracks.find((item) => item.id === currentTrackId) ?? null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (!track) {
      setTrackUrl(null);
      setPlaying(false);
      removeLocalStorage(CURRENT_TRACK_KEY);
      return;
    }

    const url = URL.createObjectURL(track.blob);
    objectUrlRef.current = url;
    setTrackUrl(url);
    writeLocalStorage(CURRENT_TRACK_KEY, track.id);

    return () => {
      if (objectUrlRef.current === url) {
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
      }
    };
  }, [tracks, currentTrackId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    writeLocalStorage(VOLUME_KEY, String(volume));
    writeLocalStorage(LOOP_PLAYLIST_KEY, loopPlaylist ? "1" : "0");
  }, [volume, loopPlaylist]);

  useEffect(() => {
    if (!trackUrl || !autoPlayRef.current) return;
    autoPlayRef.current = false;
    const frame = requestAnimationFrame(() => {
      void audioRef.current?.play().catch(() => undefined);
    });
    return () => cancelAnimationFrame(frame);
  }, [trackUrl]);

  const selectByIndex = useCallback((index: number, autoplay = true) => {
    if (!tracks.length) return;
    const normalized = (index + tracks.length) % tracks.length;
    autoPlayRef.current = autoplay;
    setCurrentTrackId(tracks[normalized].id);
  }, [tracks]);

  const next = useCallback((autoplay = true) => {
    if (!tracks.length) return;
    selectByIndex(currentIndex >= 0 ? currentIndex + 1 : 0, autoplay);
  }, [currentIndex, selectByIndex, tracks.length]);

  const previous = useCallback(() => {
    if (!tracks.length) return;
    selectByIndex(currentIndex > 0 ? currentIndex - 1 : tracks.length - 1, true);
  }, [currentIndex, selectByIndex, tracks.length]);

  useEffect(() => {
    const onCommand = (event: Event) => {
      const command = (event as CustomEvent<BackgroundMusicCommand>).detail;
      if (!command) return;

      if (command.type === "request-state") {
        emitState();
      } else if (command.type === "refresh") {
        void refreshTracks();
      } else if (command.type === "toggle") {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) void audio.play().catch(() => undefined);
        else audio.pause();
      } else if (command.type === "play") {
        void audioRef.current?.play().catch(() => undefined);
      } else if (command.type === "pause") {
        audioRef.current?.pause();
      } else if (command.type === "next") {
        next(true);
      } else if (command.type === "previous") {
        previous();
      } else if (command.type === "select") {
        if (tracks.some((track) => track.id === command.trackId)) {
          autoPlayRef.current = true;
          setCurrentTrackId(command.trackId);
        }
      } else if (command.type === "volume") {
        setVolume(Math.min(1, Math.max(0, command.value)));
      } else if (command.type === "loop-playlist") {
        setLoopPlaylist(command.value);
      }
    };

    window.addEventListener(MUSIC_COMMAND_EVENT, onCommand);
    return () => window.removeEventListener(MUSIC_COMMAND_EVENT, onCommand);
  }, [emitState, next, previous, refreshTracks, tracks]);

  return (
    <audio
      ref={audioRef}
      className="background-music-engine"
      src={trackUrl ?? undefined}
      preload="metadata"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => {
        if (!tracks.length) {
          setPlaying(false);
          return;
        }
        const isLast = currentIndex === tracks.length - 1;
        if (!isLast || loopPlaylist) next(true);
        else setPlaying(false);
      }}
    />
  );
}
