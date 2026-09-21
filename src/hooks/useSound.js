import { useCallback, useRef } from 'react';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';

/**
 * Tiny WebAudio chimes - no audio files to download, and silent when the
 * learner has turned sound off.
 */
const TONES = {
  correct: [660, 880],
  wrong: [220, 165],
  tick: [520],
  finish: [523, 659, 784],
};

export function useSound() {
  const { settings } = useSettings();
  const contextRef = useRef(null);

  return useCallback(
    (name) => {
      if (!settings.soundEnabled) return;
      const notes = TONES[name];
      if (!notes) return;

      try {
        const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
        if (!AudioContextClass) return;
        contextRef.current ??= new AudioContextClass();
        const audio = contextRef.current;

        notes.forEach((frequency, index) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          const startAt = audio.currentTime + index * 0.09;

          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, startAt);
          gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18);

          oscillator.connect(gain).connect(audio.destination);
          oscillator.start(startAt);
          oscillator.stop(startAt + 0.2);
        });
      } catch {
        /* audio is a nicety - never let it break a round */
      }
    },
    [settings.soundEnabled],
  );
}
