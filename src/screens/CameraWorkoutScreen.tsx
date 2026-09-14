import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { useApp } from '../context/AppContext';

const EXERCISES = ['SQUATS', 'PUSH-UPS', 'LUNGES', 'JACKS', 'PLANK'];

// Form Criteria & Strict Angle State Machine Thresholds per exercise
const EXERCISE_CONFIG: Record<string, { downThreshold: number; upThreshold: number; primaryJoint: string; guideText: string }> = {
  SQUATS: { downThreshold: 100, upThreshold: 160, primaryJoint: 'Knee Depth', guideText: 'Lower hips until knees bend past 100°' },
  'PUSH-UPS': { downThreshold: 90, upThreshold: 150, primaryJoint: 'Elbow Bend', guideText: 'Lower chest until elbows bend past 90°' },
  LUNGES: { downThreshold: 95, upThreshold: 155, primaryJoint: 'Front Knee', guideText: 'Step forward and drop knee toward floor' },
  JACKS: { downThreshold: 140, upThreshold: 60, primaryJoint: 'Arm Elevation', guideText: 'Raise arms up overhead and jump out' },
  PLANK: { downThreshold: 165, upThreshold: 180, primaryJoint: 'Spine Line', guideText: 'Hold flat body line without sagging hips' },
};

const ARENA_MOVES = [
  { id: '1', name: 'CYBER UPPERCUT', requiredXP: 0, power: 45, icon: '🥊' },
  { id: '2', name: 'TITAN PUNCH', requiredXP: 50, power: 85, icon: '💥' },
  { id: '3', name: 'THUNDER STRIDE', requiredXP: 100, power: 120, icon: '⚡' },
  { id: '4', name: 'PLASMA KICK', requiredXP: 200, power: 180, icon: '🦵' },
  { id: '5', name: 'OVERCLOCK BLAST', requiredXP: 350, power: 250, icon: '🔥' },
];

export const CameraWorkoutScreen: React.FC = () => {
  const context = useApp() as any;

  // Global Context State
  const currentXP = context?.userXP ?? context?.xp ?? 0;
  const setContextXP = context?.setUserXP || context?.setXp || (() => {});
  const recordCompletedRep = context?.recordCompletedRep || (() => {});

  // Local Screen State
  const [selectedExercise, setSelectedExercise] = useState<string>('SQUATS');
  const [reps, setReps] = useState<number>(0);
  const [sessionXP, setSessionXP] = useState<number>(0);
  const [currentAngle, setCurrentAngle] = useState<number>(180);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showMovesModal, setShowMovesModal] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);
  const [formFeedback, setFormFeedback] = useState<string>('Stand in full camera view');

  const totalXP = currentXP + sessionXP;

  // Refs for Web Video & MediaPipe Pose
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const repStateRef = useRef<'UP' | 'DOWN'>('UP');

  // Load MediaPipe Pose Scripts dynamically on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const loadScript = (src: string) => {
        return new Promise((resolve) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve(true);
          document.body.appendChild(script);
        });
      };

      Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
        loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'),
      ]).then(() => {
        initCameraAndPose();
      });
    }
  }, []);

  // Initialize Web Camera & MediaPipe Pose Instance
  const initCameraAndPose = () => {
    if (typeof window === 'undefined' || !(window as any).Pose) return;

    const pose = new (window as any).Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onPoseResults);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          const processVideo = async () => {
            if (videoRef.current && !isPaused) {
              await pose.send({ image: videoRef.current });
            }
            requestAnimationFrame(processVideo);
          };
          requestAnimationFrame(processVideo);
        }
      });
    }
  };

  const calculateAngle = (p1: any, p2: any, p3: any) => {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return Math.round(angle);
  };

  // Process Landmarks & Handle Accurate Rep Counting
  const onPoseResults = (results: any) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const landmarks = results.poseLandmarks;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    // Connect skeleton keypoints
    const CONNECTIONS = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28]
    ];

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;

    CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.visibility > 0.4 && p2.visibility > 0.4) {
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((lm: any) => {
      if (lm.visibility > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Calculate Exercise Angle
    let trackedAngle = 180;
    const leftHip = landmarks[23], leftKnee = landmarks[25], leftAnkle = landmarks[27];
    const leftShoulder = landmarks[11], leftElbow = landmarks[13], leftWrist = landmarks[15];

    if (selectedExercise === 'SQUATS' || selectedExercise === 'LUNGES') {
      if (leftHip && leftKnee && leftAnkle) {
        trackedAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      }
    } else if (selectedExercise === 'PUSH-UPS') {
      if (leftShoulder && leftElbow && leftWrist) {
        trackedAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      }
    } else if (selectedExercise === 'JACKS') {
      if (leftHip && leftShoulder && leftElbow) {
        trackedAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
      }
    } else if (selectedExercise === 'PLANK') {
      if (leftShoulder && leftHip && leftAnkle) {
        trackedAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
      }
    }

    setCurrentAngle(trackedAngle);

    // Dynamic State Machine with Threshold Hysteresis to prevent double counting
    const cfg = EXERCISE_CONFIG[selectedExercise] || EXERCISE_CONFIG['SQUATS'];

    if (selectedExercise === 'JACKS') {
      if (trackedAngle >= cfg.downThreshold && repStateRef.current === 'UP') {
        repStateRef.current = 'DOWN';
        setFormFeedback('🔥 ARMS ELEVATED - NOW RETURN TO START');
      } else if (trackedAngle <= cfg.upThreshold && repStateRef.current === 'DOWN') {
        repStateRef.current = 'UP';
        handleValidRepCounted();
        setFormFeedback('✓ REP COMPLETED');
      }
    } else {
      if (trackedAngle <= cfg.downThreshold && repStateRef.current === 'UP') {
        repStateRef.current = 'DOWN';
        setFormFeedback('🔥 PERFECT DEPTH - NOW EXTEND UP');
      } else if (trackedAngle >= cfg.upThreshold && repStateRef.current === 'DOWN') {
        repStateRef.current = 'UP';
        handleValidRepCounted();
        setFormFeedback('✓ REP COMPLETED');
      } else if (repStateRef.current === 'UP' && trackedAngle > cfg.downThreshold) {
        setFormFeedback(cfg.guideText);
      }
    }
  };

  const handleValidRepCounted = () => {
    setReps((prev) => prev + 1);
    const addedXP = 15;
    setSessionXP((prev) => prev + addedXP);

    try {
      // Pass both the exercise name and an accuracy score (e.g. 95) so AppContext processes lifetime counters correctly
      recordCompletedRep(selectedExercise.toLowerCase(), 95);
    } catch (e) {}

    const newTotalXP = totalXP + addedXP;
    const newlyUnlocked = ARENA_MOVES.find(
      (m) => newTotalXP >= m.requiredXP && (newTotalXP - addedXP) < m.requiredXP
    );

    if (newlyUnlocked) {
      setUnlockedToast(`UNLOCKED: ${newlyUnlocked.name}!`);
      setTimeout(() => setUnlockedToast(null), 3000);
    }
  };

  // Complete Session Handler
  const handleCompleteSession = () => {
    if (setContextXP) {
      setContextXP(totalXP);
    }
    setShowSummaryModal(true);
  };

  const unlockedCount = ARENA_MOVES.filter((m) => totalXP >= m.requiredXP).length;

  return (
    <View style={styles.container}>
      {/* Exercise Selector Bar */}
      <View style={styles.selectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
          {EXERCISES.map((item) => {
            const isActive = item === selectedExercise;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.exerciseTab, isActive && styles.exerciseTabActive]}
                onPress={() => {
                  setSelectedExercise(item);
                  repStateRef.current = 'UP';
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.exerciseTabText, isActive && styles.exerciseTabTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Subheader */}
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderText}>
          MEDIAPIPE AI TRACKING // {EXERCISE_CONFIG[selectedExercise]?.primaryJoint.toUpperCase()}
        </Text>
        <TouchableOpacity style={styles.movesTrackerBtn} onPress={() => setShowMovesModal(true)}>
          <Text style={styles.movesTrackerText}>
            ⚡ MOVES ({unlockedCount}/{ARENA_MOVES.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unlock Toast Notification */}
      {unlockedToast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>🎉 {unlockedToast}</Text>
        </View>
      )}

      {/* Camera & Skeleton Viewport */}
      <View style={styles.viewport}>
        {Platform.OS === 'web' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
            <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Top-Left Angle HUD */}
        <View style={styles.angleHUD}>
          <Text style={styles.angleValue}>{currentAngle}°</Text>
          <Text style={styles.angleTarget}>TARGET ≤{EXERCISE_CONFIG[selectedExercise]?.downThreshold}°</Text>
        </View>

        {/* Top-Right Rep & XP HUD */}
        <View style={styles.repHUD}>
          <Text style={styles.repTitle}>{selectedExercise}</Text>
          <View style={styles.repCountRow}>
            <Text style={styles.repBigNumber}>{reps}</Text>
            <Text style={styles.repUnit}>REPS</Text>
          </View>
          <Text style={styles.xpGainedText}>+{sessionXP} XP EARNED</Text>
        </View>

        {/* Viewport Bottom Bar */}
        <View style={styles.viewportBottomBar}>
          <TouchableOpacity onPress={() => setIsPaused(!isPaused)}>
            <Text style={styles.viewportControlText}>
              {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.viewportControlText}>1X SPEED</Text>
          <Text style={styles.viewportControlText}>TOTAL XP: {totalXP}</Text>
        </View>
      </View>

      {/* Form Guidance Banner */}
      <View style={styles.guidanceBanner}>
        <Text style={styles.guidanceText}>{formFeedback}</Text>
      </View>

      {/* Bottom Action Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.guideBtn} onPress={handleValidRepCounted} activeOpacity={0.8}>
          <Text style={styles.guideBtnText}>🎯 SIMULATE REP (+15 XP)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSession} activeOpacity={0.8}>
          <Text style={styles.completeBtnText}>✓ COMPLETE SESSION</Text>
        </TouchableOpacity>
      </View>

      {/* Moves Modal */}
      <Modal visible={showMovesModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI ARENA UNLOCKED MOVES</Text>
              <TouchableOpacity onPress={() => setShowMovesModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubTitle}>
              Current XP: <Text style={{ color: '#00f0ff' }}>{totalXP} XP</Text>
            </Text>

            <ScrollView style={styles.movesList}>
              {ARENA_MOVES.map((move) => {
                const isUnlocked = totalXP >= move.requiredXP;
                return (
                  <View key={move.id} style={[styles.moveCard, isUnlocked && styles.moveCardUnlocked]}>
                    <Text style={styles.moveIcon}>{move.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.moveName, isUnlocked && styles.moveNameUnlocked]}>
                        {move.name}
                      </Text>
                      <Text style={styles.moveMeta}>
                        Power: {move.power} DMG | Req: {move.requiredXP} XP
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, isUnlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                      <Text style={styles.statusBadgeText}>
                        {isUnlocked ? 'READY' : 'LOCKED'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Post-Workout Summary & Reward Modal */}
      <Modal visible={showSummaryModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#4edf75' }]}>
            <Text style={styles.summaryTitle}>🎉 WORKOUT COMPLETE!</Text>
            <Text style={styles.summarySub}>Session Rewards Breakdown</Text>

            <View style={styles.summaryStatRow}>
              <View style={styles.summaryStatBox}>
                <Text style={styles.summaryStatNum}>{reps}</Text>
                <Text style={styles.summaryStatLabel}>TOTAL REPS</Text>
              </View>
              <View style={styles.summaryStatBox}>
                <Text style={[styles.summaryStatNum, { color: '#4edf75' }]}>+{sessionXP}</Text>
                <Text style={styles.summaryStatLabel}>XP GAINED</Text>
              </View>
            </View>

            <View style={styles.summaryRewardCard}>
              <Text style={styles.rewardTitle}>TOTAL ACCOUNT XP</Text>
              <Text style={styles.rewardValue}>{totalXP} XP</Text>
            </View>

            <Text style={styles.unlockedHeader}>AVAILABLE ARENA MOVES</Text>
            <View style={styles.unlockedGrid}>
              {ARENA_MOVES.filter(m => totalXP >= m.requiredXP).map(move => (
                <View key={move.id} style={styles.unlockedChip}>
                  <Text style={{ fontSize: 12 }}>{move.icon}</Text>
                  <Text style={styles.unlockedChipText}>{move.name}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.doneBtn} 
              onPress={() => {
                setShowSummaryModal(false);
                setReps(0);
                setSessionXP(0);
              }}
            >
              <Text style={styles.doneBtnText}>CONTINUE TO DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0d14', paddingHorizontal: 12, paddingTop: 12 },
  selectorContainer: { marginBottom: 6 },
  selectorScroll: { flexDirection: 'row', gap: 6 },
  exerciseTab: { backgroundColor: '#121824', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: '#1d2636' },
  exerciseTabActive: { backgroundColor: '#00f0ff', borderColor: '#00f0ff' },
  exerciseTabText: { color: '#8a99ad', fontSize: 11, fontWeight: '800' },
  exerciseTabTextActive: { color: '#05080e' },
  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  subHeaderText: { color: '#00f0ff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  movesTrackerBtn: { backgroundColor: 'rgba(0, 240, 255, 0.15)', borderWidth: 1, borderColor: '#00f0ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  movesTrackerText: { color: '#00f0ff', fontSize: 9, fontWeight: '900' },
  toastBanner: { backgroundColor: '#4edf75', paddingVertical: 4, borderRadius: 4, alignItems: 'center', marginBottom: 6 },
  toastText: { color: '#000000', fontWeight: '900', fontSize: 10 },
  viewport: { flex: 1, backgroundColor: '#070a10', borderRadius: 8, borderWidth: 1, borderColor: '#1d2d3e', position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  angleHUD: { position: 'absolute', top: 10, left: 10, width: 65, height: 65, borderRadius: 32.5, borderWidth: 3, borderColor: '#00f0ff', backgroundColor: 'rgba(0, 240, 255, 0.08)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  angleValue: { color: '#00f0ff', fontSize: 16, fontWeight: '900' },
  angleTarget: { color: '#52718c', fontSize: 6, fontWeight: '800' },
  repHUD: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(10, 20, 32, 0.85)', borderWidth: 1, borderColor: '#00f0ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'flex-end', zIndex: 10 },
  repTitle: { color: '#00f0ff', fontSize: 8, fontWeight: '900' },
  repCountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  repBigNumber: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  repUnit: { color: '#8a99ad', fontSize: 8, fontWeight: '800' },
  xpGainedText: { color: '#4edf75', fontSize: 8, fontWeight: '900' },
  viewportBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, backgroundColor: 'rgba(5, 10, 18, 0.9)', borderTopWidth: 1, borderTopColor: '#1d2d3e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 },
  viewportControlText: { color: '#00f0ff', fontSize: 8, fontWeight: '800' },
  guidanceBanner: { paddingVertical: 6, alignItems: 'center' },
  guidanceText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  bottomControls: { flexDirection: 'row', gap: 10, paddingBottom: 14 },
  guideBtn: { flex: 1, backgroundColor: '#0e1d2a', borderWidth: 1, borderColor: '#00f0ff', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  guideBtnText: { color: '#00f0ff', fontSize: 10, fontWeight: '900' },
  completeBtn: { flex: 1, backgroundColor: '#00f0ff', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  completeBtnText: { color: '#05080e', fontSize: 10, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 420, backgroundColor: '#0e1420', borderRadius: 10, borderWidth: 1, borderColor: '#00f0ff', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: '#00f0ff', fontWeight: '900', fontSize: 14 },
  closeBtn: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  modalSubTitle: { color: '#8a99ad', fontSize: 11, marginVertical: 8, fontWeight: '700' },
  movesList: { maxHeight: 280, marginTop: 8 },
  moveCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141d2e', padding: 10, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#1d2b40' },
  moveCardUnlocked: { borderColor: '#00f0ff', backgroundColor: '#102235' },
  moveIcon: { fontSize: 22 },
  moveName: { color: '#52718c', fontSize: 11, fontWeight: '900' },
  moveNameUnlocked: { color: '#ffffff' },
  moveMeta: { color: '#8a99ad', fontSize: 9, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeUnlocked: { backgroundColor: '#00f0ff' },
  badgeLocked: { backgroundColor: '#222d3d' },
  statusBadgeText: { color: '#000000', fontSize: 8, fontWeight: '900' },
  summaryTitle: { color: '#4edf75', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  summarySub: { color: '#8a99ad', fontSize: 11, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  summaryStatRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  summaryStatBox: { flex: 1, backgroundColor: '#141d2e', padding: 12, borderRadius: 6, alignItems: 'center' },
  summaryStatNum: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  summaryStatLabel: { color: '#8a99ad', fontSize: 9, fontWeight: '800', marginTop: 2 },
  summaryRewardCard: { backgroundColor: '#102235', borderWidth: 1, borderColor: '#00f0ff', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  rewardTitle: { color: '#00f0ff', fontSize: 10, fontWeight: '800' },
  rewardValue: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 2 },
  unlockedHeader: { color: '#8a99ad', fontSize: 10, fontWeight: '800', marginBottom: 6 },
  unlockedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  unlockedChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#182538', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#00f0ff' },
  unlockedChipText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  doneBtn: { backgroundColor: '#4edf75', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  doneBtnText: { color: '#05080e', fontSize: 11, fontWeight: '900' },
});