import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { useVoiceRecorder } from '../common/VoiceRecorderContext';
import { RecordingState, AudioData } from '../types/inputTypes';
import {
  TrashIcon,
  LockIcon,
  PauseIcon,
  PlayIcon,
  CheckIcon,
} from '../svg/svgIcons';
import { triggerHaptic } from '../utils/hapticUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const CANCEL_THRESHOLD = SCREEN_W * 0.35;
const LOCK_THRESHOLD = 70; // px upward slide

interface Props {
  onComplete: (audioData: AudioData) => void;
  onCancel: () => void;
}

/**
 * VoiceRecordingUI
 *
 * Two-phase UI mirroring WhatsApp voice recording:
 *
 * Phase 1 — "Hold to record":
 *   • Red pulsing dot + timer + waveform bars
 *   • "< Slide to cancel" hint
 *   • Swipe LEFT   → cancel (fade out left)
 *   • Swipe UP (≥LOCK_THRESHOLD) → lock into Phase 2
 *   • Release without gesture → send
 *
 * Phase 2 — "Locked mode":
 *   • Trash (delete) / Pause-Resume / Send buttons
 *   • Full keyboard-safe height
 */
export const VoiceRecordingUI: React.FC<Props> = ({ onComplete, onCancel }) => {
  const {
    recordingState,
    recordTime,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const [isLocked, setIsLocked] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);

  // Animations
  const slideX = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(0)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;
  const cancelAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cancellingRef = useRef(false);
  const lockedRef = useRef(false);

  // ── Waveform simulation ──────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setWaveform(prev => [...prev.slice(-28), Math.random() * 0.85 + 0.15]);
    }, 80);
    return () => clearInterval(id);
  }, []);

  // ── Pulse animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const resetGestureAnims = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(lockAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cancelAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideX, slideY, lockAnim, cancelAnim]);

  const doCancel = useCallback(async () => {
    if (cancellingRef.current) return;
    cancellingRef.current = true;
    triggerHaptic('medium');
    Animated.timing(slideX, {
      toValue: -SCREEN_W,
      duration: 220,
      useNativeDriver: true,
    }).start(async () => {
      await cancelRecording();
      onCancel();
    });
  }, [slideX, cancelRecording, onCancel]);

  const doLock = useCallback(() => {
    lockedRef.current = true;
    setIsLocked(true);
    triggerHaptic('light');
    resetGestureAnims();
  }, [resetGestureAnims]);

  const doSend = useCallback(async () => {
    const data = await stopRecording();
    if (data) onComplete(data);
    else onCancel();
  }, [stopRecording, onComplete, onCancel]);

  // ── PanResponder ─────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !lockedRef.current,
      onMoveShouldSetPanResponder: (_e, gs) =>
        !lockedRef.current && (Math.abs(gs.dx) > 5 || gs.dy < -5),

      onPanResponderMove: (_e, gs) => {
        if (lockedRef.current || cancellingRef.current) return;

        // Horizontal: slide to cancel
        const clampedX = Math.min(0, gs.dx);
        slideX.setValue(clampedX);
        const cancelProgress = Math.min(
          1,
          Math.abs(clampedX) / CANCEL_THRESHOLD
        );
        cancelAnim.setValue(cancelProgress > 0.3 ? cancelProgress : 0);

        // Vertical: lock
        const clampedY = Math.min(0, gs.dy);
        slideY.setValue(clampedY);
        const lockProgress = Math.min(1, Math.abs(clampedY) / LOCK_THRESHOLD);
        lockAnim.setValue(lockProgress > 0.3 ? lockProgress : 0);

        // Auto-cancel if slid far enough
        if (Math.abs(gs.dx) >= CANCEL_THRESHOLD && gs.dx < 0) doCancel();
      },

      onPanResponderRelease: (_e, gs) => {
        if (lockedRef.current || cancellingRef.current) return;

        if (gs.dx <= -CANCEL_THRESHOLD) {
          doCancel();
          return;
        }

        if (gs.dy <= -LOCK_THRESHOLD) {
          doLock();
          return;
        }

        // Normal release → send
        resetGestureAnims();
        doSend();
      },

      onPanResponderTerminate: () => {
        if (!lockedRef.current && !cancellingRef.current) doCancel();
      },
    })
  ).current;

  // ── Locked-mode handlers ─────────────────────────────────────────────────
  const handlePauseResume = useCallback(async () => {
    if (recordingState === RecordingState.RECORDING) await pauseRecording();
    else if (recordingState === RecordingState.PAUSED) await resumeRecording();
  }, [recordingState, pauseRecording, resumeRecording]);

  const handleLockedCancel = useCallback(async () => {
    triggerHaptic('medium');
    await cancelRecording();
    onCancel();
  }, [cancelRecording, onCancel]);

  // ── Locked mode UI ───────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <View style={styles.lockedContainer}>
        {/* Recording info */}
        <View style={styles.lockedInfo}>
          <Animated.View
            style={[styles.recDot, { transform: [{ scale: pulseAnim }] }]}
          />
          <Text style={styles.lockedTime}>{recordTime}</Text>
          <View style={styles.lockedWaveform}>
            {waveform.slice(-20).map((amp, i) => (
              <View
                key={i}
                style={[styles.wBar, { height: Math.max(4, amp * 26) }]}
              />
            ))}
          </View>
          <LockIcon size={16} color="#00A884" />
        </View>

        {/* Controls */}
        <View style={styles.lockedControls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.deleteBtn]}
            onPress={handleLockedCancel}
            activeOpacity={0.7}>
            <TrashIcon size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.pauseBtn]}
            onPress={handlePauseResume}
            activeOpacity={0.7}>
            {recordingState === RecordingState.PAUSED ? (
              <PlayIcon size={20} color="#fff" />
            ) : (
              <PauseIcon size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.sendBtn]}
            onPress={doSend}
            activeOpacity={0.7}>
            <CheckIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Slide-to-cancel mode UI ──────────────────────────────────────────────
  return (
    <Animated.View
      style={[styles.slidingContainer, { transform: [{ translateX: slideX }] }]}
      {...panResponder.panHandlers}>
      {/* Lock hint (fades in as user slides up) */}
      <Animated.View
        style={[
          styles.lockHint,
          {
            opacity: lockAnim,
            transform: [
              {
                translateY: lockAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}>
        <LockIcon size={18} color="#00A884" />
        <Text style={styles.lockHintText}>Slide up to lock</Text>
      </Animated.View>

      {/* Main row */}
      <View style={styles.row}>
        {/* Recording dot */}
        <Animated.View
          style={[styles.recDotWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.recDot} />
        </Animated.View>

        {/* Timer */}
        <Text style={styles.timer}>{recordTime}</Text>

        {/* Waveform */}
        <View style={styles.waveform}>
          {waveform.map((amp, i) => (
            <View
              key={i}
              style={[styles.wBar, { height: Math.max(3, amp * 22) }]}
            />
          ))}
        </View>

        {/* Slide to cancel */}
        <Animated.View
          style={[
            styles.cancelHint,
            {
              opacity: cancelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}>
          <Text style={styles.cancelText}>{'< Slide to cancel'}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slidingContainer: {
    backgroundColor: '#1F2C34',
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
  },
  lockHint: {
    position: 'absolute',
    top: -52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,168,132,0.12)',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 40,
  },
  lockHintText: { color: '#00A884', fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  recDotWrap: { marginRight: 10 },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  timer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E9EDEF',
    marginRight: 10,
    minWidth: 38,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 2,
    overflow: 'hidden',
  },
  wBar: { width: 3, backgroundColor: '#00A884', borderRadius: 1.5 },
  cancelHint: { marginLeft: 8 },
  cancelText: { fontSize: 13, color: '#8696A0' },

  // Locked
  lockedContainer: {
    backgroundColor: '#1F2C34',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  lockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  lockedTime: { fontSize: 15, fontWeight: '700', color: '#E9EDEF' },
  lockedWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 2,
    overflow: 'hidden',
  },
  lockedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  deleteBtn: { backgroundColor: '#FF3B30' },
  pauseBtn: { backgroundColor: '#FFA726' },
  sendBtn: { backgroundColor: '#00A884' },
});
