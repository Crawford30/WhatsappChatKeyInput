import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Hold-to-record timer. Duration comes from the start time (not from
 * counting ticks), and a level is sampled every 100 ms for the waveform.
 * Levels are simulated: real capture needs a native audio recorder.
 */
export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    startedAt.current = Date.now();
    setDurationMs(0);
    setLevels([]);
    setIsRecording(true);
    timer.current = setInterval(() => {
      setDurationMs(Date.now() - startedAt.current);
      setLevels(prev => [...prev.slice(-39), 0.2 + Math.random() * 0.8]);
    }, 100);
  }, []);

  /** Stops recording and returns how long it ran, in milliseconds. */
  const stop = useCallback(() => {
    clear();
    const elapsed = startedAt.current ? Date.now() - startedAt.current : 0;
    startedAt.current = 0;
    setIsRecording(false);
    setDurationMs(0);
    setLevels([]);
    return elapsed;
  }, []);

  useEffect(() => clear, []);

  return {isRecording, durationMs, levels, start, stop};
};

/**
 * Most-recently-used items, newest first, without duplicates. Kept for the
 * session (persisting across launches would need AsyncStorage or MMKV).
 */
export const useRecentItems = <T>(initial: T[] = [], maxItems = 32) => {
  const [recentItems, setRecentItems] = useState<T[]>(initial);

  const addRecentItem = useCallback(
    (item: T) => {
      setRecentItems(prev =>
        [item, ...prev.filter(i => i !== item)].slice(0, maxItems),
      );
    },
    [maxItems],
  );

  return {recentItems, addRecentItem};
};
