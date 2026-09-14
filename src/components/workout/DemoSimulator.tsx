import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Play, Pause, FastForward, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import {
  PoseLandmarks,
  SKELETON_CONNECTIONS,
  generateSimulatedPose,
} from '../../services/poseMath';
import { ExerciseType, FormFeedback } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DemoSimulatorProps {
  exercise: ExerciseType;
  feedback: FormFeedback;
  currentAngle: number;
  onPoseUpdate: (landmarks: PoseLandmarks, angle: number) => void;
}

export const DemoSimulator: React.FC<DemoSimulatorProps> = ({
  exercise,
  feedback,
  currentAngle,
  onPoseUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [speed, setSpeed] = useState<number>(1);

  const simHeight = 350;

  // Animation loop
  useEffect(() => {
    let frameId: any;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setProgress((prev) => {
          // Plank is static hold
          if (exercise === 'plank') {
            return 0.5;
          }

          const rate = exercise === 'jumping_jack' ? 1.2 : 0.75;
          const step = dt * rate * speed;
          let next = direction === 'down' ? prev + step : prev - step;

          if (next >= 1.0) {
            next = 1.0;
            setDirection('up');
          } else if (next <= 0.0) {
            next = 0.0;
            setDirection('down');
          }
          return next;
        });
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, direction, speed, exercise]);

  useEffect(() => {
    const { landmarks, jointAngle } = generateSimulatedPose(exercise, progress);
    onPoseUpdate(landmarks, jointAngle);
  }, [progress, exercise]);

  const togglePlay = () => setIsPlaying((p) => !p);
  const toggleSpeed = () => setSpeed((s) => (s === 1 ? 1.5 : 1));

  const { landmarks } = generateSimulatedPose(exercise, progress);

  const getPhaseText = () => {
    if (exercise === 'plank') return 'ISOMETRIC SHIELD HOLD';
    if (exercise === 'jumping_jack') {
      return direction === 'down' ? 'OVERHEAD EXTENSION' : 'RETURNING TO BASE';
    }
    return direction === 'down' ? 'DESCENDING (ECCENTRIC)' : 'ASCENDING (CONCENTRIC)';
  };

  return (
    <View style={styles.container}>
      {/* Simulation Header Banner */}
      <View style={styles.simBanner}>
        <Sparkles size={13} color={THEME.colors.cyan} />
        <Text style={styles.simBannerText}>
          AI POSE SIMULATOR ACTIVE // 33-POINT SKELETON
        </Text>
      </View>

      {/* Cyber Grid Canvas with Skeleton */}
      <View style={[styles.canvasArea, { height: simHeight }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#0B1220" stopOpacity="0.95" />
              <Stop offset="1" stopColor="#121824" stopOpacity="0.95" />
            </LinearGradient>
          </Defs>

          <Rect width="100%" height="100%" fill="url(#bgGrad)" />

          {/* Grid Horizon Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((y, idx) => (
            <Line
              key={`grid_y_${idx}`}
              x1="0"
              y1={y * simHeight}
              x2="100%"
              y2={y * simHeight}
              stroke="rgba(0, 240, 255, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Floor Platform */}
          <Line
            x1="10%"
            y1={simHeight * 0.9}
            x2="90%"
            y2={simHeight * 0.9}
            stroke={THEME.colors.cyan}
            strokeWidth="2"
          />

          {/* Skeleton Bones with Glowing Cyber Effect */}
          {SKELETON_CONNECTIONS.map(([idx1, idx2], i) => {
            const p1 = landmarks[idx1];
            const p2 = landmarks[idx2];
            if (!p1 || !p2) return null;

            const x1 = p1.x * (SCREEN_WIDTH - 32);
            const y1 = p1.y * simHeight;
            const x2 = p2.x * (SCREEN_WIDTH - 32);
            const y2 = p2.y * simHeight;

            const isTargetMet = feedback.targetDepthReached;
            const lineColor = isTargetMet ? THEME.colors.neonGreen : THEME.colors.cyan;

            return (
              <Line
                key={`sim_line_${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={lineColor}
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })}

          {/* Skeleton Joint Nodes */}
          {Object.entries(landmarks).map(([key, lm]) => {
            if (!lm) return null;
            const cx = lm.x * (SCREEN_WIDTH - 32);
            const cy = lm.y * simHeight;

            const isTargetMet = feedback.targetDepthReached;
            const nodeColor = isTargetMet ? THEME.colors.neonGreenLight : '#FFFFFF';

            return (
              <Circle
                key={`sim_node_${key}`}
                cx={cx}
                cy={cy}
                r={6}
                fill={nodeColor}
                stroke={THEME.colors.cyan}
                strokeWidth={2}
              />
            );
          })}
        </Svg>

        {/* Phase Pill */}
        <View style={styles.phasePill}>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
        </View>
      </View>

      {/* Simulator Controls Bar */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlBtn} onPress={togglePlay} activeOpacity={0.7}>
          {isPlaying ? (
            <Pause size={16} color={THEME.colors.cyan} />
          ) : (
            <Play size={16} color={THEME.colors.cyan} />
          )}
          <Text style={styles.controlBtnText}>{isPlaying ? 'PAUSE' : 'RESUME'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeed} activeOpacity={0.7}>
          <FastForward size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.controlBtnText}>{speed}X SPEED</Text>
        </TouchableOpacity>

        <View style={styles.progressDisplay}>
          <Text style={styles.progressLabel}>
            {exercise === 'plank' ? 'POSTURE' : 'DEPTH'}
          </Text>
          <Text style={styles.progressVal}>
            {exercise === 'plank' ? 'LOCKED' : `${Math.round(progress * 100)}%`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.bgCardBorder,
    overflow: 'hidden',
  },
  simBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.25)',
  },
  simBannerText: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.cyan,
    letterSpacing: 0.8,
  },
  canvasArea: {
    width: '100%',
    position: 'relative',
  },
  phasePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(18, 24, 36, 0.85)',
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.sm,
    backgroundColor: THEME.colors.bgCardElevated,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.bgCardBorder,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  progressDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  progressVal: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.cyan,
  },
});
