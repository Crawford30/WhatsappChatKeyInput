import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VoiceRecordingViewProps {
  recordTime: string;
  isLocked: boolean;
  isPaused: boolean;
  slideAnim: Animated.Value;
  lockSlideAnim: Animated.Value;
  onPause: () => void;
  onDelete: () => void;
  onSend: () => void;
}

export const VoiceRecordingView: React.FC<VoiceRecordingViewProps> = ({
  recordTime,
  isLocked,
  isPaused,
  slideAnim,
  lockSlideAnim,
  onPause,
  onDelete,
  onSend,
}) => {
  if (isLocked) {
    // Locked mode - show pause, delete, and send buttons
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockedTopSection}>
          {/* Waveform placeholder */}
          <View style={styles.waveformContainer}>
            <WaveformAnimation isPaused={isPaused} />
          </View>
        </View>

        <View style={styles.lockedBottomSection}>
          {/* Timer and controls */}
          <View style={styles.timerRow}>
            <View style={styles.recordingIndicator}>
              {!isPaused && <View style={styles.recordingDot} />}
            </View>
            <Text style={styles.timerText}>{recordTime}</Text>
          </View>

          <View style={styles.controlsRow}>
            {/* Delete button */}
            <TouchableOpacity style={styles.controlButton} onPress={onDelete}>
              <DeleteIcon />
            </TouchableOpacity>

            {/* Pause/Resume button */}
            <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
              {isPaused ? <PlayIcon /> : <PauseIcon />}
            </TouchableOpacity>

            {/* Send button */}
            <TouchableOpacity style={styles.sendButton} onPress={onSend}>
              <SendIcon />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Recording mode - swipe to cancel or slide up to lock
  return (
    <Animated.View
      style={[
        styles.recordingContainer,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}>
      <View style={styles.slideToCancel}>
        <Text style={styles.slideToCancelText}>{'< Slide to cancel'}</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
        </View>
        <Text style={styles.timerText}>{recordTime}</Text>
        <WaveformAnimation isPaused={false} />
      </View>

      {/* Lock icon - slide up to lock */}
      <Animated.View
        style={[
          styles.lockContainer,
          {
            transform: [{ translateY: lockSlideAnim }],
          },
        ]}>
        <View style={styles.lockIconContainer}>
          <LockIcon />
        </View>
        <View style={styles.lockArrow} />
      </Animated.View>
    </Animated.View>
  );
};

// Animated waveform
const WaveformAnimation: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
  const waveAmplitudes = React.useRef(
    Array(30)
      .fill(0)
      .map(() => new Animated.Value(Math.random()))
  ).current;

  React.useEffect(() => {
    if (isPaused) {
      waveAmplitudes.forEach(anim => {
        anim.setValue(0.2);
      });
      return;
    }

    const animations = waveAmplitudes.map(anim =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random(),
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: Math.random(),
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [isPaused, waveAmplitudes]);

  return (
    <View style={styles.waveform}>
      {waveAmplitudes.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Icon Components
const LockIcon = () => (
  <View style={styles.lockIcon}>
    <View style={styles.lockBody} />
    <View style={styles.lockShackle} />
  </View>
);

const DeleteIcon = () => (
  <View style={styles.deleteIcon}>
    <View style={styles.deleteCan} />
    <View style={styles.deleteLid} />
  </View>
);

const PauseIcon = () => (
  <View style={styles.pauseIcon}>
    <View style={styles.pauseBar} />
    <View style={[styles.pauseBar, { marginLeft: 4 }]} />
  </View>
);

const PlayIcon = () => (
  <View style={styles.playIcon}>
    <View style={styles.playTriangle} />
  </View>
);

const SendIcon = () => (
  <View style={styles.sendIconLocked}>
    <View style={styles.sendArrowLocked} />
  </View>
);

const styles = StyleSheet.create({
  // Locked mode styles
  lockedContainer: {
    backgroundColor: '#0B141A',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  lockedTopSection: {
    backgroundColor: '#1C2C33',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  waveformContainer: {
    height: 60,
    justifyContent: 'center',
  },
  lockedBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C2C33',
    borderRadius: 12,
    padding: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374952',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374952',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Recording mode styles
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2C33',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slideToCancel: {
    flex: 1,
  },
  slideToCancelText: {
    color: '#8696A0',
    fontSize: 14,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F15C6D',
  },
  timerText: {
    color: '#E9EDEF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 2,
  },
  waveBar: {
    width: 3,
    height: 32,
    backgroundColor: '#00A884',
    borderRadius: 1.5,
  },
  lockContainer: {
    position: 'absolute',
    right: 16,
    top: -60,
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374952',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8696A0',
    marginTop: 4,
  },

  // Lock icon
  lockIcon: {
    width: 20,
    height: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  lockBody: {
    width: 12,
    height: 10,
    backgroundColor: '#8696A0',
    borderRadius: 2,
  },
  lockShackle: {
    width: 10,
    height: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8696A0',
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    position: 'absolute',
    top: 0,
  },

  // Delete icon
  deleteIcon: {
    width: 20,
    height: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteCan: {
    width: 14,
    height: 14,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8696A0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  deleteLid: {
    width: 16,
    height: 2,
    backgroundColor: '#8696A0',
    position: 'absolute',
    top: 0,
    borderRadius: 1,
  },

  // Pause icon
  pauseIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBar: {
    width: 3,
    height: 16,
    backgroundColor: '#E9EDEF',
    borderRadius: 1.5,
  },

  // Play icon
  playIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: '#E9EDEF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  // Send icon (locked)
  sendIconLocked: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrowLocked: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
});

// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// interface VoiceRecordingViewProps {
//   recordTime: string;
//   isLocked: boolean;
//   isPaused: boolean;
//   slideAnim: Animated.Value;
//   lockSlideAnim: Animated.Value;
//   onPause: () => void;
//   onDelete: () => void;
//   onSend: () => void;
// }

// export const VoiceRecordingView: React.FC<VoiceRecordingViewProps> = ({
//   recordTime,
//   isLocked,
//   isPaused,
//   slideAnim,
//   lockSlideAnim,
//   onPause,
//   onDelete,
//   onSend,
// }) => {
//   if (isLocked) {
//     // Locked mode - show pause, delete, and send buttons
//     return (
//       <View style={styles.lockedContainer}>
//         <View style={styles.lockedTopSection}>
//           {/* Waveform placeholder */}
//           <View style={styles.waveformContainer}>
//             <WaveformAnimation isPaused={isPaused} />
//           </View>
//         </View>

//         <View style={styles.lockedBottomSection}>
//           {/* Timer and controls */}
//           <View style={styles.timerRow}>
//             <View style={styles.recordingIndicator}>
//               {!isPaused && <View style={styles.recordingDot} />}
//             </View>
//             <Text style={styles.timerText}>{recordTime}</Text>
//           </View>

//           <View style={styles.controlsRow}>
//             {/* Delete button */}
//             <TouchableOpacity style={styles.controlButton} onPress={onDelete}>
//               <DeleteIcon />
//             </TouchableOpacity>

//             {/* Pause/Resume button */}
//             <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
//               {isPaused ? <PlayIcon /> : <PauseIcon />}
//             </TouchableOpacity>

//             {/* Send button */}
//             <TouchableOpacity style={styles.sendButton} onPress={onSend}>
//               <SendIcon />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   }

//   // Recording mode - swipe to cancel or slide up to lock
//   return (
//     <Animated.View
//       style={[
//         styles.recordingContainer,
//         {
//           transform: [{ translateX: slideAnim }],
//         },
//       ]}>
//       <View style={styles.slideToCancel}>
//         <Text style={styles.slideToCancelText}>{'< Slide to cancel'}</Text>
//       </View>

//       <View style={styles.timerContainer}>
//         <View style={styles.recordingIndicator}>
//           <View style={styles.recordingDot} />
//         </View>
//         <Text style={styles.timerText}>{recordTime}</Text>
//         <WaveformAnimation isPaused={false} />
//       </View>

//       {/* Lock icon - slide up to lock */}
//       <Animated.View
//         style={[
//           styles.lockContainer,
//           {
//             transform: [{ translateY: lockSlideAnim }],
//           },
//         ]}>
//         <View style={styles.lockIconContainer}>
//           <LockIcon />
//         </View>
//         <View style={styles.lockArrow} />
//       </Animated.View>
//     </Animated.View>
//   );
// };

// // Animated waveform
// const WaveformAnimation: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
//   const waveAmplitudes = React.useRef(
//     Array(30)
//       .fill(0)
//       .map(() => new Animated.Value(Math.random()))
//   ).current;

//   React.useEffect(() => {
//     if (isPaused) {
//       waveAmplitudes.forEach(anim => {
//         anim.setValue(0.2);
//       });
//       return;
//     }

//     const animations = waveAmplitudes.map(anim =>
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(anim, {
//             toValue: Math.random(),
//             duration: 300 + Math.random() * 200,
//             useNativeDriver: true,
//           }),
//           Animated.timing(anim, {
//             toValue: Math.random(),
//             duration: 300 + Math.random() * 200,
//             useNativeDriver: true,
//           }),
//         ])
//       )
//     );

//     animations.forEach(anim => anim.start());

//     return () => {
//       animations.forEach(anim => anim.stop());
//     };
//   }, [isPaused, waveAmplitudes]);

//   return (
//     <View style={styles.waveform}>
//       {waveAmplitudes.map((anim, index) => (
//         <Animated.View
//           key={index}
//           style={[
//             styles.waveBar,
//             {
//               transform: [
//                 {
//                   scaleY: anim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0.2, 1],
//                   }),
//                 },
//               ],
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );
// };

// // Icon Components
// const LockIcon = () => (
//   <View style={styles.lockIcon}>
//     <View style={styles.lockBody} />
//     <View style={styles.lockShackle} />
//   </View>
// );

// const DeleteIcon = () => (
//   <View style={styles.deleteIcon}>
//     <View style={styles.deleteCan} />
//     <View style={styles.deleteLid} />
//   </View>
// );

// const PauseIcon = () => (
//   <View style={styles.pauseIcon}>
//     <View style={styles.pauseBar} />
//     <View style={[styles.pauseBar, { marginLeft: 4 }]} />
//   </View>
// );

// const PlayIcon = () => (
//   <View style={styles.playIcon}>
//     <View style={styles.playTriangle} />
//   </View>
// );

// const SendIcon = () => (
//   <View style={styles.sendIconLocked}>
//     <View style={styles.sendArrowLocked} />
//   </View>
// );

// const styles = StyleSheet.create({
//   // Locked mode styles
//   lockedContainer: {
//     backgroundColor: '#0B141A',
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//   },
//   lockedTopSection: {
//     backgroundColor: '#1C2C33',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 8,
//   },
//   waveformContainer: {
//     height: 60,
//     justifyContent: 'center',
//   },
//   lockedBottomSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#1C2C33',
//     borderRadius: 12,
//     padding: 12,
//   },
//   timerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   controlsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   controlButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#374952',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pauseButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#374952',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#00A884',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   // Recording mode styles
//   recordingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1C2C33',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   slideToCancel: {
//     flex: 1,
//   },
//   slideToCancelText: {
//     color: '#8696A0',
//     fontSize: 14,
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   recordingIndicator: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   recordingDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#F15C6D',
//   },
//   timerText: {
//     color: '#E9EDEF',
//     fontSize: 16,
//     fontWeight: '600',
//     marginRight: 12,
//   },
//   waveform: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 32,
//     gap: 2,
//   },
//   waveBar: {
//     width: 3,
//     height: 32,
//     backgroundColor: '#00A884',
//     borderRadius: 1.5,
//   },
//   lockContainer: {
//     position: 'absolute',
//     right: 16,
//     top: -60,
//     alignItems: 'center',
//   },
//   lockIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#374952',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   lockArrow: {
//     width: 0,
//     height: 0,
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderLeftWidth: 6,
//     borderRightWidth: 6,
//     borderTopWidth: 8,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderTopColor: '#8696A0',
//     marginTop: 4,
//   },

//   // Lock icon
//   lockIcon: {
//     width: 20,
//     height: 20,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   lockBody: {
//     width: 12,
//     height: 10,
//     backgroundColor: '#8696A0',
//     borderRadius: 2,
//   },
//   lockShackle: {
//     width: 10,
//     height: 8,
//     backgroundColor: 'transparent',
//     borderWidth: 2,
//     borderColor: '#8696A0',
//     borderBottomWidth: 0,
//     borderTopLeftRadius: 5,
//     borderTopRightRadius: 5,
//     position: 'absolute',
//     top: 0,
//   },

//   // Delete icon
//   deleteIcon: {
//     width: 20,
//     height: 20,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   deleteCan: {
//     width: 14,
//     height: 14,
//     backgroundColor: 'transparent',
//     borderWidth: 2,
//     borderColor: '#8696A0',
//     borderTopWidth: 0,
//     borderBottomLeftRadius: 2,
//     borderBottomRightRadius: 2,
//   },
//   deleteLid: {
//     width: 16,
//     height: 2,
//     backgroundColor: '#8696A0',
//     position: 'absolute',
//     top: 0,
//     borderRadius: 1,
//   },

//   // Pause icon
//   pauseIcon: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pauseBar: {
//     width: 3,
//     height: 16,
//     backgroundColor: '#E9EDEF',
//     borderRadius: 1.5,
//   },

//   // Play icon
//   playIcon: {
//     width: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playTriangle: {
//     width: 0,
//     height: 0,
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderLeftWidth: 12,
//     borderRightWidth: 0,
//     borderTopWidth: 8,
//     borderBottomWidth: 8,
//     borderLeftColor: '#E9EDEF',
//     borderRightColor: 'transparent',
//     borderTopColor: 'transparent',
//     borderBottomColor: 'transparent',
//   },

//   // Send icon (locked)
//   sendIconLocked: {
//     width: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendArrowLocked: {
//     width: 0,
//     height: 0,
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderLeftWidth: 10,
//     borderRightWidth: 10,
//     borderBottomWidth: 16,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderBottomColor: '#FFFFFF',
//     transform: [{ rotate: '45deg' }],
//   },
// });

// // import React from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   Animated,
// //   TouchableOpacity,
// //   Dimensions,
// // } from 'react-native';

// // const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // interface VoiceRecordingViewProps {
// //   recordTime: string;
// //   isLocked: boolean;
// //   isPaused: boolean;
// //   slideAnim: Animated.Value;
// //   lockSlideAnim: Animated.Value;
// //   onPause: () => void;
// //   onDelete: () => void;
// //   onSend: () => void;
// // }

// // export const VoiceRecordingView: React.FC<VoiceRecordingViewProps> = ({
// //   recordTime,
// //   isLocked,
// //   isPaused,
// //   slideAnim,
// //   lockSlideAnim,
// //   onPause,
// //   onDelete,
// //   onSend,
// // }) => {
// //   if (isLocked) {
// //     // Locked mode - show pause, delete, and send buttons
// //     return (
// //       <View style={styles.lockedContainer}>
// //         <View style={styles.lockedTopSection}>
// //           {/* Waveform placeholder */}
// //           <View style={styles.waveformContainer}>
// //             <WaveformAnimation isPaused={isPaused} />
// //           </View>
// //         </View>

// //         <View style={styles.lockedBottomSection}>
// //           {/* Timer and controls */}
// //           <View style={styles.timerRow}>
// //             <View style={styles.recordingIndicator}>
// //               {!isPaused && <View style={styles.recordingDot} />}
// //             </View>
// //             <Text style={styles.timerText}>{recordTime}</Text>
// //           </View>

// //           <View style={styles.controlsRow}>
// //             {/* Delete button */}
// //             <TouchableOpacity style={styles.controlButton} onPress={onDelete}>
// //               <DeleteIcon />
// //             </TouchableOpacity>

// //             {/* Pause/Resume button */}
// //             <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
// //               {isPaused ? <PlayIcon /> : <PauseIcon />}
// //             </TouchableOpacity>

// //             {/* Send button */}
// //             <TouchableOpacity style={styles.sendButton} onPress={onSend}>
// //               <SendIcon />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     );
// //   }

// //   // Recording mode - swipe to cancel or slide up to lock
// //   return (
// //     <Animated.View
// //       style={[
// //         styles.recordingContainer,
// //         {
// //           transform: [{ translateX: slideAnim }],
// //         },
// //       ]}>
// //       <View style={styles.slideToCancel}>
// //         <Text style={styles.slideToCancelText}>{'< Slide to cancel'}</Text>
// //       </View>

// //       <View style={styles.timerContainer}>
// //         <View style={styles.recordingIndicator}>
// //           <View style={styles.recordingDot} />
// //         </View>
// //         <Text style={styles.timerText}>{recordTime}</Text>
// //         <WaveformAnimation isPaused={false} />
// //       </View>

// //       {/* Lock icon - slide up to lock */}
// //       <Animated.View
// //         style={[
// //           styles.lockContainer,
// //           {
// //             transform: [{ translateY: lockSlideAnim }],
// //           },
// //         ]}>
// //         <View style={styles.lockIconContainer}>
// //           <LockIcon />
// //         </View>
// //         <View style={styles.lockArrow} />
// //       </Animated.View>
// //     </Animated.View>
// //   );
// // };

// // // Animated waveform
// // const WaveformAnimation: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
// //   const waveAmplitudes = React.useRef(
// //     Array(30)
// //       .fill(0)
// //       .map(() => new Animated.Value(Math.random()))
// //   ).current;

// //   React.useEffect(() => {
// //     if (isPaused) {
// //       waveAmplitudes.forEach(anim => {
// //         anim.setValue(0.2);
// //       });
// //       return;
// //     }

// //     const animations = waveAmplitudes.map(anim =>
// //       Animated.loop(
// //         Animated.sequence([
// //           Animated.timing(anim, {
// //             toValue: Math.random(),
// //             duration: 300 + Math.random() * 200,
// //             useNativeDriver: true,
// //           }),
// //           Animated.timing(anim, {
// //             toValue: Math.random(),
// //             duration: 300 + Math.random() * 200,
// //             useNativeDriver: true,
// //           }),
// //         ])
// //       )
// //     );

// //     animations.forEach(anim => anim.start());

// //     return () => {
// //       animations.forEach(anim => anim.stop());
// //     };
// //   }, [isPaused, waveAmplitudes]);

// //   return (
// //     <View style={styles.waveform}>
// //       {waveAmplitudes.map((anim, index) => (
// //         <Animated.View
// //           key={index}
// //           style={[
// //             styles.waveBar,
// //             {
// //               height: anim.interpolate({
// //                 inputRange: [0, 1],
// //                 outputRange: [4, 32],
// //               }),
// //             },
// //           ]}
// //         />
// //       ))}
// //     </View>
// //   );
// // };

// // // Icon Components
// // const LockIcon = () => (
// //   <View style={styles.lockIcon}>
// //     <View style={styles.lockBody} />
// //     <View style={styles.lockShackle} />
// //   </View>
// // );

// // const DeleteIcon = () => (
// //   <View style={styles.deleteIcon}>
// //     <View style={styles.deleteCan} />
// //     <View style={styles.deleteLid} />
// //   </View>
// // );

// // const PauseIcon = () => (
// //   <View style={styles.pauseIcon}>
// //     <View style={styles.pauseBar} />
// //     <View style={[styles.pauseBar, { marginLeft: 4 }]} />
// //   </View>
// // );

// // const PlayIcon = () => (
// //   <View style={styles.playIcon}>
// //     <View style={styles.playTriangle} />
// //   </View>
// // );

// // const SendIcon = () => (
// //   <View style={styles.sendIconLocked}>
// //     <View style={styles.sendArrowLocked} />
// //   </View>
// // );

// // const styles = StyleSheet.create({
// //   // Locked mode styles
// //   lockedContainer: {
// //     backgroundColor: '#0B141A',
// //     paddingHorizontal: 8,
// //     paddingVertical: 5,
// //   },
// //   lockedTopSection: {
// //     backgroundColor: '#1C2C33',
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 8,
// //   },
// //   waveformContainer: {
// //     height: 60,
// //     justifyContent: 'center',
// //   },
// //   lockedBottomSection: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     backgroundColor: '#1C2C33',
// //     borderRadius: 12,
// //     padding: 12,
// //   },
// //   timerRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   controlsRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 12,
// //   },
// //   controlButton: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     backgroundColor: '#374952',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   pauseButton: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     backgroundColor: '#374952',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   sendButton: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: '#00A884',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },

// //   // Recording mode styles
// //   recordingContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#1C2C33',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //   },
// //   slideToCancel: {
// //     flex: 1,
// //   },
// //   slideToCancelText: {
// //     color: '#8696A0',
// //     fontSize: 14,
// //   },
// //   timerContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginRight: 16,
// //   },
// //   recordingIndicator: {
// //     width: 12,
// //     height: 12,
// //     borderRadius: 6,
// //     marginRight: 8,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   recordingDot: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     backgroundColor: '#F15C6D',
// //   },
// //   timerText: {
// //     color: '#E9EDEF',
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginRight: 12,
// //   },
// //   waveform: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     height: 32,
// //     gap: 2,
// //   },
// //   waveBar: {
// //     width: 3,
// //     backgroundColor: '#00A884',
// //     borderRadius: 1.5,
// //   },
// //   lockContainer: {
// //     position: 'absolute',
// //     right: 16,
// //     top: -60,
// //     alignItems: 'center',
// //   },
// //   lockIconContainer: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     backgroundColor: '#374952',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   lockArrow: {
// //     width: 0,
// //     height: 0,
// //     backgroundColor: 'transparent',
// //     borderStyle: 'solid',
// //     borderLeftWidth: 6,
// //     borderRightWidth: 6,
// //     borderTopWidth: 8,
// //     borderLeftColor: 'transparent',
// //     borderRightColor: 'transparent',
// //     borderTopColor: '#8696A0',
// //     marginTop: 4,
// //   },

// //   // Lock icon
// //   lockIcon: {
// //     width: 20,
// //     height: 20,
// //     justifyContent: 'flex-end',
// //     alignItems: 'center',
// //   },
// //   lockBody: {
// //     width: 12,
// //     height: 10,
// //     backgroundColor: '#8696A0',
// //     borderRadius: 2,
// //   },
// //   lockShackle: {
// //     width: 10,
// //     height: 8,
// //     backgroundColor: 'transparent',
// //     borderWidth: 2,
// //     borderColor: '#8696A0',
// //     borderBottomWidth: 0,
// //     borderTopLeftRadius: 5,
// //     borderTopRightRadius: 5,
// //     position: 'absolute',
// //     top: 0,
// //   },

// //   // Delete icon
// //   deleteIcon: {
// //     width: 20,
// //     height: 20,
// //     justifyContent: 'flex-end',
// //     alignItems: 'center',
// //   },
// //   deleteCan: {
// //     width: 14,
// //     height: 14,
// //     backgroundColor: 'transparent',
// //     borderWidth: 2,
// //     borderColor: '#8696A0',
// //     borderTopWidth: 0,
// //     borderBottomLeftRadius: 2,
// //     borderBottomRightRadius: 2,
// //   },
// //   deleteLid: {
// //     width: 16,
// //     height: 2,
// //     backgroundColor: '#8696A0',
// //     position: 'absolute',
// //     top: 0,
// //     borderRadius: 1,
// //   },

// //   // Pause icon
// //   pauseIcon: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   pauseBar: {
// //     width: 3,
// //     height: 16,
// //     backgroundColor: '#E9EDEF',
// //     borderRadius: 1.5,
// //   },

// //   // Play icon
// //   playIcon: {
// //     width: 20,
// //     height: 20,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   playTriangle: {
// //     width: 0,
// //     height: 0,
// //     backgroundColor: 'transparent',
// //     borderStyle: 'solid',
// //     borderLeftWidth: 12,
// //     borderRightWidth: 0,
// //     borderTopWidth: 8,
// //     borderBottomWidth: 8,
// //     borderLeftColor: '#E9EDEF',
// //     borderRightColor: 'transparent',
// //     borderTopColor: 'transparent',
// //     borderBottomColor: 'transparent',
// //   },

// //   // Send icon (locked)
// //   sendIconLocked: {
// //     width: 24,
// //     height: 24,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   sendArrowLocked: {
// //     width: 0,
// //     height: 0,
// //     backgroundColor: 'transparent',
// //     borderStyle: 'solid',
// //     borderLeftWidth: 10,
// //     borderRightWidth: 10,
// //     borderBottomWidth: 16,
// //     borderLeftColor: 'transparent',
// //     borderRightColor: 'transparent',
// //     borderBottomColor: '#FFFFFF',
// //     transform: [{ rotate: '45deg' }],
// //   },
// // });
