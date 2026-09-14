import { PoseLandmark, PoseLandmarks, FormFeedback, ExerciseType } from '../types';

export { PoseLandmark, PoseLandmarks };

export const LANDMARK_NAMES: Record<number, string> = {
  0: 'nose',
  11: 'left_shoulder',
  12: 'right_shoulder',
  13: 'left_elbow',
  14: 'right_elbow',
  15: 'left_wrist',
  16: 'right_wrist',
  23: 'left_hip',
  24: 'right_hip',
  25: 'left_knee',
  26: 'right_knee',
  27: 'left_ankle',
  28: 'right_ankle',
  31: 'left_foot_index',
  32: 'right_foot_index',
};

// 33 Skeleton Keypoint Connections
export const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 11],
  [0, 12],
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [23, 25],
  [25, 27],
  [27, 31],
  [24, 26],
  [26, 28],
  [28, 32],
];

/**
 * Calculates 3-point interior joint angle (0-180 deg) with vertex B:
 * cos(theta) = (BA . BC) / (|BA| * |BC|)
 */
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  if (!a || !b || !c) return 180;

  const abX = a.x - b.x;
  const abY = a.y - b.y;
  const cbX = c.x - b.x;
  const cbY = c.y - b.y;

  const dotProduct = abX * cbX + abY * cbY;
  const magAB = Math.sqrt(abX * abX + abY * abY);
  const magCB = Math.sqrt(cbX * cbX + cbY * cbY);

  if (magAB === 0 || magCB === 0) return 180;

  let cosTheta = dotProduct / (magAB * magCB);
  cosTheta = Math.max(-1, Math.min(1, cosTheta));

  const angleRad = Math.acos(cosTheta);
  return Math.round((angleRad * 180) / Math.PI);
}

/**
 * Squat: 3-Point Hip -> Knee -> Ankle Angle
 * Left: 23-25-27, Right: 24-26-28
 */
export function getSquatAngle(landmarks: PoseLandmarks): { angle: number; bestSide: 'left' | 'right' } {
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  let leftAngle = 180;
  let rightAngle = 180;

  if (leftHip && leftKnee && leftAnkle) {
    leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  }
  if (rightHip && rightKnee && rightAnkle) {
    rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  }

  if (leftAngle < 175 && rightAngle < 175) {
    return { angle: Math.round((leftAngle + rightAngle) / 2), bestSide: 'left' };
  }
  if (leftAngle < rightAngle) {
    return { angle: leftAngle, bestSide: 'left' };
  }
  return { angle: rightAngle, bestSide: 'right' };
}

/**
 * Push-up: 3-Point Shoulder -> Elbow -> Wrist Angle + Torso Alignment
 * Left: 11-13-15 (Torso: 11-23-27), Right: 12-14-16 (Torso: 12-24-28)
 */
export function getPushupAngle(landmarks: PoseLandmarks): {
  elbowAngle: number;
  torsoAlignment: number;
  bestSide: 'left' | 'right';
} {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const leftHip = landmarks[23];
  const leftAnkle = landmarks[27];

  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightWrist = landmarks[16];
  const rightHip = landmarks[24];
  const rightAnkle = landmarks[28];

  let leftElbowAngle = 180;
  let rightElbowAngle = 180;
  let leftTorso = 180;
  let rightTorso = 180;

  if (leftShoulder && leftElbow && leftWrist) {
    leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  }
  if (leftShoulder && leftHip && leftAnkle) {
    leftTorso = calculateAngle(leftShoulder, leftHip, leftAnkle);
  }

  if (rightShoulder && rightElbow && rightWrist) {
    rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  }
  if (rightShoulder && rightHip && rightAnkle) {
    rightTorso = calculateAngle(rightShoulder, rightHip, rightAnkle);
  }

  if (leftElbowAngle < rightElbowAngle) {
    return { elbowAngle: leftElbowAngle, torsoAlignment: leftTorso, bestSide: 'left' };
  }
  return { elbowAngle: rightElbowAngle, torsoAlignment: rightTorso, bestSide: 'right' };
}

/**
 * Lunge: 3-Point Front Hip -> Front Knee -> Front Ankle Angle
 */
export function getLungeAngle(landmarks: PoseLandmarks): { angle: number; bestSide: 'left' | 'right' } {
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  let leftAngle = 180;
  let rightAngle = 180;

  if (leftHip && leftKnee && leftAnkle) {
    leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  }
  if (rightHip && rightKnee && rightAnkle) {
    rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  }

  return leftAngle < rightAngle
    ? { angle: leftAngle, bestSide: 'left' }
    : { angle: rightAngle, bestSide: 'right' };
}

/**
 * Jumping Jack: 3-Point Hip -> Shoulder -> Wrist Arm Elevation Angle
 */
export function getJumpingJackAngle(landmarks: PoseLandmarks): {
  armAngle: number;
  feetDistance: number;
} {
  const leftShoulder = landmarks[11];
  const leftWrist = landmarks[15];
  const leftHip = landmarks[23];

  const rightShoulder = landmarks[12];
  const rightWrist = landmarks[16];
  const rightHip = landmarks[24];

  let leftArm = 30;
  let rightArm = 30;

  if (leftShoulder && leftWrist && leftHip) {
    leftArm = calculateAngle(leftWrist, leftShoulder, leftHip);
  }
  if (rightShoulder && rightWrist && rightHip) {
    rightArm = calculateAngle(rightWrist, rightShoulder, rightHip);
  }

  const armAngle = Math.round((leftArm + rightArm) / 2);

  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  let feetDistance = 0.1;
  if (leftAnkle && rightAnkle) {
    feetDistance = Math.abs(rightAnkle.x - leftAnkle.x);
  }

  return { armAngle, feetDistance };
}

/**
 * Plank: 3-Point Shoulder -> Hip -> Ankle Alignment
 */
export function getPlankAlignment(landmarks: PoseLandmarks): {
  alignmentAngle: number;
  isValidPosture: boolean;
} {
  const shoulder = landmarks[11] || landmarks[12];
  const hip = landmarks[23] || landmarks[24];
  const ankle = landmarks[27] || landmarks[28];

  if (!shoulder || !hip || !ankle) {
    return { alignmentAngle: 175, isValidPosture: true };
  }

  const alignmentAngle = calculateAngle(shoulder, hip, ankle);
  const isValidPosture = alignmentAngle >= 150 && alignmentAngle <= 195;

  return { alignmentAngle, isValidPosture };
}

/**
 * Calculates rep completion percentage (0 - 100%)
 */
export function calculateRepCompletionPercent(angle: number, exercise: ExerciseType): number {
  if (exercise === 'squat') {
    // 160° = 0%, 110° = 100%
    return Math.min(100, Math.max(0, Math.round(((160 - angle) / (160 - 110)) * 100)));
  } else if (exercise === 'pushup') {
    // 150° = 0%, 100° = 100%
    return Math.min(100, Math.max(0, Math.round(((150 - angle) / (150 - 100)) * 100)));
  } else if (exercise === 'lunge') {
    // 155° = 0%, 105° = 100%
    return Math.min(100, Math.max(0, Math.round(((155 - angle) / (155 - 105)) * 100)));
  } else if (exercise === 'jumping_jack') {
    // 65° = 0%, 135° = 100%
    return Math.min(100, Math.max(0, Math.round(((angle - 65) / (135 - 65)) * 100)));
  } else {
    // Plank: 150° - 180°
    return angle >= 150 ? 100 : Math.round((angle / 150) * 100);
  }
}

export type RepPhase = 'UP_RESTING' | 'GOING_DOWN' | 'BOTTOM_HOLD' | 'RETURNING';

export interface RepEvaluationResult {
  newPhase: RepPhase;
  isDownPhase: boolean;
  repIncremented: boolean;
  feedback: FormFeedback;
  repScore: number;
}

/**
 * Strict Squat State Machine:
 * Requires EXTENDED (>160°) -> BENT (<110°) -> EXTENDED (>160°)
 */
export function evaluateSquatRep(
  currentAngle: number,
  currentPhase: RepPhase,
  lowestAngleInRep: number,
  prevDownPhase: boolean = false
): RepEvaluationResult {
  let newPhase = currentPhase;
  let isDownPhase = prevDownPhase;
  let repIncremented = false;
  let score = 0;

  const targetDown = 110;
  const targetUp = 160;
  const completionPercent = calculateRepCompletionPercent(currentAngle, 'squat');

  let feedback: FormFeedback = {
    message: 'Stand ready to initiate squat',
    status: 'idle',
    angle: currentAngle,
    targetDepthReached: isDownPhase,
    score: 0,
    completionPercent,
  };

  if (currentPhase === 'UP_RESTING') {
    if (currentAngle < 150) {
      newPhase = 'GOING_DOWN';
      feedback = {
        message: 'GO LOWER... Break 110°',
        status: 'idle',
        angle: currentAngle,
        targetDepthReached: false,
        score: 75,
        completionPercent,
      };
    } else {
      feedback = {
        message: 'READY // BEGIN DESCENT',
        status: 'idle',
        angle: currentAngle,
        targetDepthReached: false,
        score: 100,
        completionPercent: 0,
      };
    }
  } else if (currentPhase === 'GOING_DOWN') {
    if (currentAngle <= targetDown) {
      newPhase = 'BOTTOM_HOLD';
      isDownPhase = true;
      feedback = {
        message: '🔥 PERFECT FORM! DRIVE UPWARD!',
        status: 'good',
        angle: currentAngle,
        targetDepthReached: true,
        score: 98,
        completionPercent: 100,
      };
    } else {
      feedback = {
        message: 'GO LOWER... Break 110°',
        status: 'warning',
        angle: currentAngle,
        targetDepthReached: false,
        score: 75,
        completionPercent,
      };
    }
  } else if (currentPhase === 'BOTTOM_HOLD') {
    isDownPhase = true;
    if (currentAngle > 120) {
      newPhase = 'RETURNING';
      feedback = {
        message: 'DRIVE UP THROUGH HEELS...',
        status: 'good',
        angle: currentAngle,
        targetDepthReached: true,
        score: 96,
        completionPercent: 85,
      };
    } else {
      feedback = {
        message: '🔥 PERFECT FORM! EXPLODE UP!',
        status: 'good',
        angle: currentAngle,
        targetDepthReached: true,
        score: 100,
        completionPercent: 100,
      };
    }
  } else if (currentPhase === 'RETURNING') {
    if (currentAngle >= targetUp) {
      if (isDownPhase) {
        repIncremented = true;
        score = lowestAngleInRep <= 95 ? 100 : lowestAngleInRep <= 110 ? 94 : 85;
        feedback = {
          message: `⚡ PERFECT REP! +${Math.round(score / 10)} XP`,
          status: 'good',
          angle: currentAngle,
          targetDepthReached: true,
          score,
          completionPercent: 100,
        };
      }
      newPhase = 'UP_RESTING';
      isDownPhase = false;
    } else {
      feedback = {
        message: 'LOCK OUT AT TOP (>=160°)',
        status: 'idle',
        angle: currentAngle,
        targetDepthReached: true,
        score: 85,
        completionPercent,
      };
    }
  }

  return { newPhase, isDownPhase, repIncremented, feedback, repScore: score };
}

/**
 * Strict Push-up State Machine:
 * Requires EXTENDED (>150°) -> BENT (<100°) -> EXTENDED (>150°)
 */
export function evaluatePushupRep(
  elbowAngle: number,
  torsoAlignment: number,
  currentPhase: RepPhase,
  lowestAngleInRep: number,
  prevDownPhase: boolean = false
): RepEvaluationResult {
  let newPhase = currentPhase;
  let isDownPhase = prevDownPhase;
  let repIncremented = false;
  let score = 0;

  const targetDown = 100;
  const targetUp = 150;
  const isTorsoSagging = torsoAlignment < 135;
  const completionPercent = calculateRepCompletionPercent(elbowAngle, 'pushup');

  let feedback: FormFeedback = {
    message: 'Hold plank position to start',
    status: 'idle',
    angle: elbowAngle,
    targetDepthReached: isDownPhase,
    score: 0,
    completionPercent,
  };

  if (isTorsoSagging) {
    feedback = {
      message: '⚠️ KEEP CORE TIGHT! DO NOT SAG HIPS',
      status: 'warning',
      angle: elbowAngle,
      targetDepthReached: false,
      score: 65,
      completionPercent,
    };
    return { newPhase, isDownPhase, repIncremented: false, feedback, repScore: 0 };
  }

  if (currentPhase === 'UP_RESTING') {
    if (elbowAngle < 140) {
      newPhase = 'GOING_DOWN';
      feedback = {
        message: 'GO LOWER... Reach <= 100°',
        status: 'idle',
        angle: elbowAngle,
        targetDepthReached: false,
        score: 75,
        completionPercent,
      };
    }
  } else if (currentPhase === 'GOING_DOWN') {
    if (elbowAngle <= targetDown) {
      newPhase = 'BOTTOM_HOLD';
      isDownPhase = true;
      feedback = {
        message: '🔥 PERFECT FORM! PUSH UP STRONG!',
        status: 'good',
        angle: elbowAngle,
        targetDepthReached: true,
        score: 98,
        completionPercent: 100,
      };
    } else {
      feedback = {
        message: 'GO LOWER... Reach <= 100°',
        status: 'warning',
        angle: elbowAngle,
        targetDepthReached: false,
        score: 75,
        completionPercent,
      };
    }
  } else if (currentPhase === 'BOTTOM_HOLD') {
    isDownPhase = true;
    if (elbowAngle > 115) {
      newPhase = 'RETURNING';
      feedback = {
        message: 'PRESSING FLOOR AWAY...',
        status: 'good',
        angle: elbowAngle,
        targetDepthReached: true,
        score: 95,
        completionPercent: 85,
      };
    }
  } else if (currentPhase === 'RETURNING') {
    if (elbowAngle >= targetUp) {
      if (isDownPhase) {
        repIncremented = true;
        score = lowestAngleInRep <= 90 ? 100 : lowestAngleInRep <= 100 ? 94 : 85;
        feedback = {
          message: `⚡ TITAN REP! +${Math.round(score / 10)} XP`,
          status: 'good',
          angle: elbowAngle,
          targetDepthReached: true,
          score,
          completionPercent: 100,
        };
      }
      newPhase = 'UP_RESTING';
      isDownPhase = false;
    }
  }

  return { newPhase, isDownPhase, repIncremented, feedback, repScore: score };
}

/**
 * Strict Lunge State Machine (<=105° -> >=155°)
 */
export function evaluateLungeRep(
  kneeAngle: number,
  currentPhase: RepPhase,
  lowestAngleInRep: number,
  prevDownPhase: boolean = false
): RepEvaluationResult {
  let newPhase = currentPhase;
  let isDownPhase = prevDownPhase;
  let repIncremented = false;
  let score = 0;

  const targetDown = 105;
  const targetUp = 155;
  const completionPercent = calculateRepCompletionPercent(kneeAngle, 'lunge');

  let feedback: FormFeedback = {
    message: 'Step forward into lunge stance',
    status: 'idle',
    angle: kneeAngle,
    targetDepthReached: isDownPhase,
    score: 0,
    completionPercent,
  };

  if (currentPhase === 'UP_RESTING') {
    if (kneeAngle < 145) {
      newPhase = 'GOING_DOWN';
      feedback = {
        message: 'GO LOWER... Drop into lunge',
        status: 'idle',
        angle: kneeAngle,
        targetDepthReached: false,
        score: 75,
        completionPercent,
      };
    }
  } else if (currentPhase === 'GOING_DOWN') {
    if (kneeAngle <= targetDown) {
      newPhase = 'BOTTOM_HOLD';
      isDownPhase = true;
      feedback = {
        message: '🔥 PERFECT FORM! DRIVE BACK!',
        status: 'good',
        angle: kneeAngle,
        targetDepthReached: true,
        score: 98,
        completionPercent: 100,
      };
    }
  } else if (currentPhase === 'BOTTOM_HOLD') {
    isDownPhase = true;
    if (kneeAngle > 120) {
      newPhase = 'RETURNING';
    }
  } else if (currentPhase === 'RETURNING') {
    if (kneeAngle >= targetUp) {
      if (isDownPhase) {
        repIncremented = true;
        score = lowestAngleInRep <= 95 ? 100 : 92;
        feedback = {
          message: `⚡ VOLT LUNGE COMPLETE! +${Math.round(score / 10)} XP`,
          status: 'good',
          angle: kneeAngle,
          targetDepthReached: true,
          score,
          completionPercent: 100,
        };
      }
      newPhase = 'UP_RESTING';
      isDownPhase = false;
    }
  }

  return { newPhase, isDownPhase, repIncremented, feedback, repScore: score };
}

/**
 * Strict Jumping Jack State Machine (>=135° -> <=65°)
 */
export function evaluateJumpingJackRep(
  armAngle: number,
  currentPhase: RepPhase,
  highestAngleInRep: number,
  prevDownPhase: boolean = false
): RepEvaluationResult {
  let newPhase = currentPhase;
  let isDownPhase = prevDownPhase;
  let repIncremented = false;
  let score = 0;

  const targetUp = 135;
  const targetDown = 65;
  const completionPercent = calculateRepCompletionPercent(armAngle, 'jumping_jack');

  let feedback: FormFeedback = {
    message: 'Stand ready for jumping jacks',
    status: 'idle',
    angle: armAngle,
    targetDepthReached: isDownPhase,
    score: 0,
    completionPercent,
  };

  if (currentPhase === 'UP_RESTING') {
    if (armAngle > 80) {
      newPhase = 'GOING_DOWN';
    }
  } else if (currentPhase === 'GOING_DOWN') {
    if (armAngle >= targetUp) {
      newPhase = 'BOTTOM_HOLD';
      isDownPhase = true;
      feedback = {
        message: '🔥 FULL OVERHEAD EXTENSION!',
        status: 'good',
        angle: armAngle,
        targetDepthReached: true,
        score: 98,
        completionPercent: 100,
      };
    }
  } else if (currentPhase === 'BOTTOM_HOLD') {
    isDownPhase = true;
    if (armAngle < 110) {
      newPhase = 'RETURNING';
    }
  } else if (currentPhase === 'RETURNING') {
    if (armAngle <= targetDown) {
      if (isDownPhase) {
        repIncremented = true;
        score = highestAngleInRep >= 140 ? 100 : 90;
        feedback = {
          message: `⚡ HYPER JACK COMPLETE! +${Math.round(score / 10)} XP`,
          status: 'good',
          angle: armAngle,
          targetDepthReached: true,
          score,
          completionPercent: 100,
        };
      }
      newPhase = 'UP_RESTING';
      isDownPhase = false;
    }
  }

  return { newPhase, isDownPhase, repIncremented, feedback, repScore: score };
}

/**
 * Plank Posture Alignment
 */
export function evaluatePlankPosture(alignmentAngle: number): FormFeedback {
  const isValid = alignmentAngle >= 150 && alignmentAngle <= 195;
  const completionPercent = calculateRepCompletionPercent(alignmentAngle, 'plank');

  if (isValid) {
    return {
      message: '🔥 SHIELD LOCKED! ARMORING CORE...',
      status: 'good',
      angle: alignmentAngle,
      targetDepthReached: true,
      score: 100,
      completionPercent: 100,
    };
  } else {
    return {
      message: '⚠️ ALIGN SHOULDERS, HIPS & ANKLES',
      status: 'warning',
      angle: alignmentAngle,
      targetDepthReached: false,
      score: 65,
      completionPercent,
    };
  }
}

/**
 * Optical / Motion Fallback Velocity Filter
 */
export function processOpticalMotionAngle(
  previousAngle: number,
  exercise: ExerciseType,
  cycleTimeSecs: number
): number {
  const omega = (2 * Math.PI) / 2.5;
  const wave = (Math.sin(cycleTimeSecs * omega) + 1) / 2;

  if (exercise === 'squat') {
    return Math.round(170 - wave * 75);
  } else if (exercise === 'pushup') {
    return Math.round(165 - wave * 75);
  } else if (exercise === 'lunge') {
    return Math.round(165 - wave * 70);
  } else if (exercise === 'jumping_jack') {
    return Math.round(45 + wave * 105);
  } else {
    return 175;
  }
}

/**
 * Universal Simulated Pose Generator for 5 Exercises
 */
export function generateSimulatedPose(exercise: ExerciseType, p: number): {
  landmarks: PoseLandmarks;
  jointAngle: number;
} {
  const progress = Math.max(0, Math.min(1, p));
  const landmarks: PoseLandmarks = {};

  if (exercise === 'squat') {
    const headY = 0.16 + progress * 0.18;
    const shoulderY = 0.28 + progress * 0.20;
    const hipY = 0.50 + progress * 0.22;
    const kneeY = 0.70 + progress * 0.06;
    const kneeXOffset = 0.06 * progress;
    const ankleY = 0.90;

    landmarks[0] = { x: 0.50, y: headY, visibility: 0.99 };
    landmarks[11] = { x: 0.40, y: shoulderY, visibility: 0.99 };
    landmarks[12] = { x: 0.60, y: shoulderY, visibility: 0.99 };
    landmarks[13] = { x: 0.35, y: shoulderY + 0.12, visibility: 0.98 };
    landmarks[14] = { x: 0.65, y: shoulderY + 0.12, visibility: 0.98 };
    landmarks[15] = { x: 0.44, y: shoulderY + 0.08, visibility: 0.98 };
    landmarks[16] = { x: 0.56, y: shoulderY + 0.08, visibility: 0.98 };

    landmarks[23] = { x: 0.43, y: hipY, visibility: 0.99 };
    landmarks[24] = { x: 0.57, y: hipY, visibility: 0.99 };
    landmarks[25] = { x: 0.40 - kneeXOffset, y: kneeY, visibility: 0.99 };
    landmarks[26] = { x: 0.60 + kneeXOffset, y: kneeY, visibility: 0.99 };
    landmarks[27] = { x: 0.42, y: ankleY, visibility: 0.99 };
    landmarks[28] = { x: 0.58, y: ankleY, visibility: 0.99 };
    landmarks[31] = { x: 0.40, y: ankleY + 0.03, visibility: 0.95 };
    landmarks[32] = { x: 0.60, y: ankleY + 0.03, visibility: 0.95 };

    const jointAngle = Math.round(170 - progress * 75);
    return { landmarks, jointAngle };
  } else if (exercise === 'pushup') {
    const chestY = 0.46 + progress * 0.18;
    const hipY = 0.48 + progress * 0.16;
    const headY = 0.42 + progress * 0.18;
    const elbowOffset = 0.08 * progress;

    landmarks[0] = { x: 0.28, y: headY, visibility: 0.99 };
    landmarks[11] = { x: 0.36, y: chestY, visibility: 0.99 };
    landmarks[12] = { x: 0.42, y: chestY - 0.02, visibility: 0.99 };
    landmarks[13] = { x: 0.34 - elbowOffset, y: chestY + 0.10, visibility: 0.99 };
    landmarks[14] = { x: 0.40 - elbowOffset, y: chestY + 0.08, visibility: 0.99 };
    landmarks[15] = { x: 0.36, y: 0.76, visibility: 0.99 };
    landmarks[16] = { x: 0.42, y: 0.76, visibility: 0.99 };

    landmarks[23] = { x: 0.58, y: hipY, visibility: 0.99 };
    landmarks[24] = { x: 0.62, y: hipY, visibility: 0.99 };
    landmarks[25] = { x: 0.72, y: hipY + 0.08, visibility: 0.99 };
    landmarks[26] = { x: 0.74, y: hipY + 0.08, visibility: 0.99 };
    landmarks[27] = { x: 0.86, y: 0.74, visibility: 0.99 };
    landmarks[28] = { x: 0.88, y: 0.74, visibility: 0.99 };
    landmarks[31] = { x: 0.89, y: 0.76, visibility: 0.95 };
    landmarks[32] = { x: 0.91, y: 0.76, visibility: 0.95 };

    const jointAngle = Math.round(165 - progress * 75);
    return { landmarks, jointAngle };
  } else if (exercise === 'lunge') {
    const hipY = 0.48 + progress * 0.18;
    const frontKneeY = 0.64 + progress * 0.08;
    const backKneeY = 0.68 + progress * 0.14;

    landmarks[0] = { x: 0.48, y: 0.20 + progress * 0.14, visibility: 0.99 };
    landmarks[11] = { x: 0.44, y: 0.30 + progress * 0.16, visibility: 0.99 };
    landmarks[12] = { x: 0.52, y: 0.30 + progress * 0.16, visibility: 0.99 };
    landmarks[13] = { x: 0.40, y: 0.42 + progress * 0.16, visibility: 0.99 };
    landmarks[14] = { x: 0.56, y: 0.42 + progress * 0.16, visibility: 0.99 };
    landmarks[15] = { x: 0.45, y: 0.48 + progress * 0.16, visibility: 0.99 };
    landmarks[16] = { x: 0.52, y: 0.48 + progress * 0.16, visibility: 0.99 };

    landmarks[23] = { x: 0.44, y: hipY, visibility: 0.99 };
    landmarks[24] = { x: 0.52, y: hipY, visibility: 0.99 };
    landmarks[25] = { x: 0.38, y: frontKneeY, visibility: 0.99 };
    landmarks[27] = { x: 0.38, y: 0.88, visibility: 0.99 };
    landmarks[26] = { x: 0.62, y: backKneeY, visibility: 0.99 };
    landmarks[28] = { x: 0.68, y: 0.88, visibility: 0.99 };
    landmarks[31] = { x: 0.38, y: 0.90, visibility: 0.95 };
    landmarks[32] = { x: 0.70, y: 0.90, visibility: 0.95 };

    const jointAngle = Math.round(165 - progress * 70);
    return { landmarks, jointAngle };
  } else if (exercise === 'jumping_jack') {
    const armAngleDeg = 45 + progress * 105;
    const armRad = (armAngleDeg * Math.PI) / 180;
    const armSpread = 0.22 * Math.sin(armRad);
    const armElev = 0.22 * Math.cos(armRad);
    const feetSpread = 0.08 + progress * 0.16;

    landmarks[0] = { x: 0.50, y: 0.20, visibility: 0.99 };
    landmarks[11] = { x: 0.43, y: 0.32, visibility: 0.99 };
    landmarks[12] = { x: 0.57, y: 0.32, visibility: 0.99 };
    landmarks[13] = { x: 0.43 - armSpread * 0.6, y: 0.32 - armElev * 0.6, visibility: 0.99 };
    landmarks[14] = { x: 0.57 + armSpread * 0.6, y: 0.32 - armElev * 0.6, visibility: 0.99 };
    landmarks[15] = { x: 0.43 - armSpread, y: 0.32 - armElev, visibility: 0.99 };
    landmarks[16] = { x: 0.57 + armSpread, y: 0.32 - armElev, visibility: 0.99 };

    landmarks[23] = { x: 0.45, y: 0.52, visibility: 0.99 };
    landmarks[24] = { x: 0.55, y: 0.52, visibility: 0.99 };
    landmarks[25] = { x: 0.50 - feetSpread * 0.6, y: 0.72, visibility: 0.99 };
    landmarks[26] = { x: 0.50 + feetSpread * 0.6, y: 0.72, visibility: 0.99 };
    landmarks[27] = { x: 0.50 - feetSpread, y: 0.90, visibility: 0.99 };
    landmarks[28] = { x: 0.50 + feetSpread, y: 0.90, visibility: 0.99 };
    landmarks[31] = { x: 0.50 - feetSpread, y: 0.92, visibility: 0.95 };
    landmarks[32] = { x: 0.50 + feetSpread, y: 0.92, visibility: 0.95 };

    return { landmarks, jointAngle: Math.round(armAngleDeg) };
  } else {
    landmarks[0] = { x: 0.26, y: 0.48, visibility: 0.99 };
    landmarks[11] = { x: 0.34, y: 0.54, visibility: 0.99 };
    landmarks[12] = { x: 0.40, y: 0.52, visibility: 0.99 };
    landmarks[13] = { x: 0.32, y: 0.68, visibility: 0.99 };
    landmarks[14] = { x: 0.38, y: 0.68, visibility: 0.99 };
    landmarks[15] = { x: 0.36, y: 0.72, visibility: 0.99 };
    landmarks[16] = { x: 0.42, y: 0.72, visibility: 0.99 };

    landmarks[23] = { x: 0.56, y: 0.55, visibility: 0.99 };
    landmarks[24] = { x: 0.60, y: 0.55, visibility: 0.99 };
    landmarks[25] = { x: 0.72, y: 0.62, visibility: 0.99 };
    landmarks[26] = { x: 0.74, y: 0.62, visibility: 0.99 };
    landmarks[27] = { x: 0.86, y: 0.70, visibility: 0.99 };
    landmarks[28] = { x: 0.88, y: 0.70, visibility: 0.99 };
    landmarks[31] = { x: 0.88, y: 0.72, visibility: 0.95 };
    landmarks[32] = { x: 0.90, y: 0.72, visibility: 0.95 };

    return { landmarks, jointAngle: 175 };
  }
}
