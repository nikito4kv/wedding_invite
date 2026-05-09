'use client';

import { EnvelopeIntro } from '@/components/intro';
import { useLocaleUi } from '@/lib/i18n/locale-context';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './music-experience.module.css';

type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'blocked' | 'unavailable';

type MusicExperienceProps = {
  audioPath: string;
  audioTitle: string;
  children: ReactNode;
};

const getPlaybackErrorName = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return null;
  }

  return typeof error.name === 'string' ? error.name : null;
};

const isUnavailablePlaybackError = (audio: HTMLAudioElement, error: unknown): boolean => {
  return (
    audio.error !== null ||
    audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE ||
    getPlaybackErrorName(error) === 'NotSupportedError'
  );
};

export function MusicExperience({
  audioPath,
  audioTitle,
  children
}: MusicExperienceProps) {
  const ui = useLocaleUi();
  const audioRef = useRef<HTMLAudioElement>(null);
  const statusId = useId();
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.28;
    }
  }, []);

  const attemptPlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      setPlaybackStatus('blocked');
      return false;
    }

    try {
      await audio.play();
      setPlaybackStatus('playing');
      return true;
    } catch (error) {
      setPlaybackStatus(isUnavailablePlaybackError(audio, error) ? 'unavailable' : 'blocked');
      return false;
    }
  }, []);

  const handleToggle = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || playbackStatus === 'unavailable') {
      return;
    }

    if (playbackStatus === 'playing') {
      audio.pause();
      setPlaybackStatus('paused');
      return;
    }

    await attemptPlayback();
  }, [attemptPlayback, playbackStatus]);

  const handleAudioPause = useCallback(() => {
    setPlaybackStatus((currentStatus) => (currentStatus === 'playing' ? 'paused' : currentStatus));
  }, []);

  const handleAudioPlay = useCallback(() => {
    setPlaybackStatus('playing');
  }, []);

  const handleAudioError = useCallback(() => {
    setPlaybackStatus('unavailable');
  }, []);

  const statusLine = useMemo(() => {
    switch (playbackStatus) {
      case 'playing':
        return ui.musicPlaying(audioTitle);
      case 'blocked':
        return ui.musicBlocked;
      case 'unavailable':
        return ui.musicMissing;
      case 'paused':
        return ui.musicPaused(audioTitle);
      case 'idle':
      default:
        return ui.musicReady(audioTitle);
    }
  }, [audioTitle, playbackStatus, ui]);
  const isPlaying = playbackStatus === 'playing';
  const isUnavailable = playbackStatus === 'unavailable';

  return (
    <>
      <audio
        aria-hidden="true"
        loop
        onError={handleAudioError}
        onPause={handleAudioPause}
        onPlay={handleAudioPlay}
        preload="none"
        ref={audioRef}
        src={audioPath}
      />

      <div
        aria-label={ui.musicControlAria}
        className={styles.controlShell}
        data-testid="music-control"
      >
        <button
          aria-describedby={statusId}
          aria-label={isPlaying ? ui.musicOff : ui.musicOn}
          aria-pressed={isPlaying}
          className={styles.toggleButton}
          data-testid="music-toggle"
          data-status={playbackStatus}
          disabled={isUnavailable}
          onClick={() => {
            void handleToggle();
          }}
          title={isPlaying ? ui.musicOff : ui.musicOn}
          type="button"
        >
          <svg aria-hidden="true" className={styles.soundIcon} focusable="false" viewBox="0 0 28 28">
            <path className={styles.speakerShape} d="M4 11.1v5.8h4.4l5.2 4.15V6.95L8.4 11.1H4Z" />
            <path className={styles.soundWave} d="M17.2 10.1c1.1 1 1.72 2.4 1.72 3.9s-.62 2.9-1.72 3.9" />
            <path className={styles.soundWave} d="M20 7.25A9.1 9.1 0 0 1 22.7 14 9.1 9.1 0 0 1 20 20.75" />
            <path className={styles.soundSlash} d="M5.6 5.9 22.2 22.5" />
          </svg>
          <span className={styles.visuallyHidden}>{statusLine}</span>
        </button>

        <p className={styles.visuallyHidden} data-testid="music-status" id={statusId}>
          {statusLine}
        </p>
      </div>

      <EnvelopeIntro>
        {children}
      </EnvelopeIntro>
    </>
  );
}
