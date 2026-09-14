import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Circle, Line } from 'react-native-svg';
import { RefreshCw, Camera as CameraIcon, AlertCircle, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { PoseLandmarks, SKELETON_CONNECTIONS } from '../../services/poseMath';
import { FormFeedback, PoseLandmark } from '../../types';
import { CyberButton } from '../common/CyberButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraViewOverlayProps {
  landmarks: PoseLandmarks;
  feedback: FormFeedback;
  facing: 'front' | 'back';
  onFlipFacing: () => void;
  onRequestSimulatedMode: () => void;
}

export const CameraViewOverlay: React.FC<CameraViewOverlayProps> = ({
  landmarks,
  feedback,
  facing,
  onFlipFacing,
  onRequestSimulatedMode,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<boolean>(false);

  // If camera throws or encountered error, show safe fallback
  if (cameraError) {
    return (
      <View style={styles.permissionContainer}>
        <AlertCircle size={44} color={THEME.colors.electricRed} style={styles.permissionIcon} />
        <Text style={[styles.permissionTitle, { color: THEME.colors.electricRed }]}>
          CAMERA FEED UNAVAILABLE
        </Text>
        <Text style={styles.permissionDescription}>
          The device camera could not be initialized. FitForge AI has activated the procedural AI Pose Simulator fallback.
        </Text>
        <CyberButton
          title="ACTIVATE AI SIMULATOR"
          variant="cyan"
          size="lg"
          icon={<Sparkles size={16} color="#002B33" />}
          onPress={onRequestSimulatedMode}
          style={styles.permButton}
        />
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>INITIALIZING OPTICAL SENSORS...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <AlertCircle size={48} color={THEME.colors.neonYellow} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>CAMERA ACCESS REQUIRED</Text>
        <Text style={styles.permissionDescription}>
          FitForge AI analyzes joint angles in real time to count reps and verify combat accuracy.
        </Text>
        <CyberButton
          title="ENABLE CAMERA PERMISSION"
          variant="cyan"
          size="lg"
          onPress={requestPermission}
          style={styles.permButton}
        />
        <CyberButton
          title="USE AI POSE SIMULATOR"
          variant="outline"
          size="md"
          icon={<Sparkles size={14} color={THEME.colors.cyan} />}
          onPress={onRequestSimulatedMode}
          style={{ marginTop: 12, width: '100%' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Try-Catch Protected Camera Component */}
      <CameraView
        style={styles.camera}
        facing={facing}
        mirror={facing === 'front'}
        onCameraReady={() => setCameraError(false)}
        onMountError={() => setCameraError(true)}
      >
        {/* Cyber Viewfinder HUD */}
        <View style={styles.viewfinderBox}>
          <View style={styles.vfCornerTL} />
          <View style={styles.vfCornerTR} />
          <View style={styles.vfCornerBL} />
          <View style={styles.vfCornerBR} />
        </View>

        {/* 33-Keypoints Skeleton SVG Layer with Neon Glow */}
        <Svg style={styles.skeletonSvg} width="100%" height="100%">
          {/* Skeleton Bone Connections */}
          {SKELETON_CONNECTIONS.map(([idx1, idx2], i) => {
            const p1 = landmarks[idx1];
            const p2 = landmarks[idx2];
            if (!p1 || !p2) return null;

            const x1 = p1.x * SCREEN_WIDTH;
            const y1 = p1.y * (SCREEN_HEIGHT * 0.75);
            const x2 = p2.x * SCREEN_WIDTH;
            const y2 = p2.y * (SCREEN_HEIGHT * 0.75);

            const isTargetMet = feedback.targetDepthReached;
            const lineColor = isTargetMet ? THEME.colors.neonGreen : THEME.colors.cyan;

            return (
              <Line
                key={`line_${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={lineColor}
                strokeWidth={3.5}
                strokeOpacity={0.9}
              />
            );
          })}

          {/* Skeleton Joint Nodes */}
          {Object.entries(landmarks).map(([key, rawLm]) => {
            const lm = rawLm as PoseLandmark | undefined;
            if (!lm) return null;
            const cx = lm.x * SCREEN_WIDTH;
            const cy = lm.y * (SCREEN_HEIGHT * 0.75);

            const isTargetMet = feedback.targetDepthReached;
            const nodeColor = isTargetMet ? THEME.colors.neonGreenLight : '#FFFFFF';

            return (
              <Circle
                key={`node_${key}`}
                cx={cx}
                cy={cy}
                r={5.5}
                fill={nodeColor}
                stroke={THEME.colors.cyan}
                strokeWidth={2}
              />
            );
          })}
        </Svg>

        {/* Camera Flip Control Button */}
        <TouchableOpacity style={styles.flipButton} onPress={onFlipFacing} activeOpacity={0.8}>
          <RefreshCw size={16} color={THEME.colors.cyan} />
          <Text style={styles.flipButtonText}>{facing.toUpperCase()}</Text>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  skeletonSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  viewfinderBox: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    pointerEvents: 'none',
  },
  vfCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 22,
    height: 22,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: THEME.colors.cyan,
  },
  vfCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: THEME.colors.cyan,
  },
  vfCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 22,
    height: 22,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: THEME.colors.cyan,
  },
  vfCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: THEME.colors.cyan,
  },
  flipButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(18, 24, 36, 0.9)',
    borderWidth: 1.5,
    borderColor: THEME.colors.cyan,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flipButtonText: {
    color: THEME.colors.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  permissionText: {
    color: THEME.colors.cyan,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  permButton: {
    width: '100%',
  },
});
