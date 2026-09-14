import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface ArenaFightCanvasProps {
  battle?: {
    selectedMoveId?: string;
    playerFighter?: {
      name?: string;
      avatar?: string;
      currentHp?: number;
      maxHp?: number;
    };
    rivalFighter?: {
      name?: string;
      avatar?: string;
      currentHp?: number;
      maxHp?: number;
    };
    isAttackingAnimation?: boolean;
    slashEffect?: boolean;
    shakeEffect?: boolean;
    floatingDamages?: Array<{ id: string; text: string; isPlayerTarget: boolean; isCritical?: boolean }>;
  };
}

export function ArenaFightCanvas({ battle }: ArenaFightCanvasProps) {
  const selectedMoveId = battle?.selectedMoveId || '';
  const playerFighter = battle?.playerFighter || { name: 'CYBER GLADIATOR', currentHp: 53, maxHp: 100 };
  const rivalFighter = battle?.rivalFighter || { name: 'A.E.G.I.S-X', currentHp: 130, maxHp: 130 };
  const isAttackingAnimation = battle?.isAttackingAnimation || false;
  const slashEffect = battle?.slashEffect || false;
  const shakeEffect = battle?.shakeEffect || false;
  const floatingDamages = battle?.floatingDamages || [];

  const playerHpPercent = Math.max(0, Math.min(100, ((playerFighter.currentHp || 0) / (playerFighter.maxHp || 100)) * 100));
  const rivalHpPercent = Math.max(0, Math.min(100, ((rivalFighter.currentHp || 0) / (rivalFighter.maxHp || 130)) * 100));

  const [breathTick, setBreathTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setBreathTick((prev) => (prev + 1) % 100), 40);
    return () => clearInterval(timer);
  }, []);

  const moveLower = selectedMoveId.toLowerCase();
  const isKick = moveLower.includes('kick') || moveLower.includes('stride') || moveLower.includes('thunder');
  const isHeavy = moveLower.includes('annihilator') || moveLower.includes('blast') || moveLower.includes('forge') || moveLower.includes('upper');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'fitforge-contact-battle-v6';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          /* Lunge across screen so strike connects directly with rival */
          @keyframes connectStrike {
            0% { transform: translateX(0px) rotate(0deg); }
            30% { transform: translateX(230px) rotate(8deg) scale(1.1); filter: drop-shadow(0 0 25px #00ffcc); }
            45% { transform: translateX(250px) rotate(12deg) scale(1.15); filter: drop-shadow(0 0 35px #ffffff); }
            100% { transform: translateX(0px) rotate(0deg); }
          }
          @keyframes connectKick {
            0% { transform: translateX(0px) rotate(0deg); }
            35% { transform: translateX(240px) translateY(-10px) rotate(-15deg) scale(1.1); filter: drop-shadow(0 0 30px #00ffcc); }
            50% { transform: translateX(265px) translateY(-15px) rotate(-22deg) scale(1.2); filter: drop-shadow(0 0 40px #00ffcc); }
            100% { transform: translateX(0px) rotate(0deg); }
          }
          @keyframes connectHeavy {
            0% { transform: translateX(0px) scale(1); }
            35% { transform: translateX(220px) scale(0.9, 1.1) rotate(-10deg); }
            55% { transform: translateX(275px) scale(1.25, 0.95) rotate(15deg); filter: drop-shadow(0 0 45px #ffd700); }
            100% { transform: translateX(0px) scale(1); }
          }
          @keyframes impactStagger {
            0% { transform: translateX(0px) rotate(0deg); filter: brightness(1); }
            15% { transform: translateX(-80px) rotate(-18deg) scale(0.9); filter: brightness(5) contrast(2.5) hue-rotate(-20deg); }
            40% { transform: translateX(-35px) rotate(-8deg); filter: brightness(2); }
            100% { transform: translateX(0px) rotate(0deg); filter: brightness(1); }
          }
          @keyframes hitFlashSparks {
            0% { transform: scale(0.2) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.8) rotate(180deg); opacity: 1; }
            100% { transform: scale(2.4) rotate(360deg); opacity: 0; }
          }
          @keyframes floatDmg {
            0% { transform: translateY(0px) scale(0.4); opacity: 0; }
            20% { transform: translateY(-30px) scale(1.3); opacity: 1; }
            100% { transform: translateY(-80px) scale(1); opacity: 0; }
          }
          .anim-strike { animation: connectStrike 0.45s cubic-bezier(0.1, 0.85, 0.25, 1) forwards; }
          .anim-kick { animation: connectKick 0.5s cubic-bezier(0.1, 0.85, 0.25, 1) forwards; }
          .anim-heavy { animation: connectHeavy 0.55s cubic-bezier(0.1, 0.85, 0.25, 1) forwards; }
          .anim-stagger { animation: impactStagger 0.45s ease-out forwards; }
          .anim-sparks { animation: hitFlashSparks 0.4s ease-out forwards; }
          .anim-dmg { animation: floatDmg 0.8s ease-out forwards; }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const actionClass = isHeavy ? 'anim-heavy' : isKick ? 'anim-kick' : 'anim-strike';
  const stanceShift = Math.sin(breathTick * 0.1) * 2.5;

  return (
    <View style={[styles.canvasContainer, shakeEffect && styles.screenShakeContainer]}>
      {/* Grid Floor */}
      <View style={styles.floorLine} />

      {/* PLAYER FIGHTER (Cyber Gladiator) */}
      <View style={[styles.fighterColumn, isAttackingAnimation && (Platform.OS === 'web' ? ({ className: actionClass } as any) : styles.fallbackLunge)]}>
        <View style={styles.hpBlock}>
          <View style={styles.hpTrackBar}>
            <View style={[styles.hpFillPlayer, { width: `${playerHpPercent}%` }]} />
          </View>
          <Text style={styles.hpTextLabel}>{playerFighter.currentHp}/{playerFighter.maxHp} HP</Text>
        </View>

        {/* Detailed Armored Rig */}
        <View style={[styles.characterRigBox, { transform: [{ translateY: stanceShift }] }]}>
          {/* Cyber Helmet */}
          <View style={styles.playerHead}>
            <View style={styles.playerVisor} />
            <View style={styles.headCrest} />
          </View>

          {/* Armored Chest & Shoulders */}
          <View style={styles.playerTorsoRow}>
            <View style={styles.playerShoulderPadLeft} />
            <View style={styles.playerChest}>
              <View style={styles.coreReactorCyan} />
            </View>
            {/* Extended Punch Arm */}
            <View style={[styles.playerArmRight, isAttackingAnimation && styles.playerExtendedPunchArm]}>
              {isAttackingAnimation && <View style={styles.fistEnergyGlow} />}
            </View>
          </View>

          {/* Belt & Legs */}
          <View style={styles.playerPelvis} />
          <View style={styles.legsRow}>
            <View style={styles.legColumn}>
              <View style={styles.playerArmorThigh} />
              <View style={styles.playerArmorShin} />
            </View>
            <View style={[styles.legColumn, isAttackingAnimation && isKick && styles.playerKickLegPose]}>
              <View style={styles.playerArmorThigh} />
              <View style={styles.playerArmorShin} />
            </View>
          </View>

          <View style={styles.shadowBaseCyan} />
        </View>

        <Text style={styles.fighterNameText} numberOfLines={1}>{playerFighter.name}</Text>
      </View>

      {/* CONTACT IMPACT SPARK ZONE */}
      <View style={styles.centerClashZone}>
        {slashEffect && (
          <View style={[styles.impactSparkBurst, Platform.OS === 'web' && ({ className: 'anim-sparks' } as any)]} />
        )}
        <View style={styles.vsBadgeBox}>
          <Text style={styles.vsTextNeon}>VS</Text>
        </View>
      </View>

      {/* RIVAL FIGHTER (A.E.G.I.S-X) */}
      <View style={[styles.fighterColumn, slashEffect && (Platform.OS === 'web' ? ({ className: 'anim-stagger' } as any) : styles.fallbackRecoil)]}>
        <View style={styles.hpBlock}>
          <View style={styles.hpTrackBar}>
            <View style={[styles.hpFillRival, { width: `${rivalHpPercent}%` }]} />
          </View>
          <Text style={styles.hpTextLabel}>{rivalFighter.currentHp}/{rivalFighter.maxHp} HP</Text>
        </View>

        {/* Detailed Rival Rig */}
        <View style={[styles.characterRigBox, { transform: [{ translateY: -stanceShift }] }]}>
          {/* Cyber Helmet */}
          <View style={styles.rivalHead}>
            <View style={styles.rivalVisor} />
            <View style={styles.rivalHornRight} />
          </View>

          {/* Armored Chest & Guard */}
          <View style={styles.rivalTorsoRow}>
            <View style={[styles.rivalArmLeft, slashEffect && styles.rivalFlinchArm]}>
              <View style={styles.rivalGuardShield} />
            </View>
            <View style={styles.rivalChest}>
              <View style={styles.coreReactorRed} />
            </View>
            <View style={styles.rivalShoulderPadRight} />
          </View>

          {/* Belt & Legs */}
          <View style={styles.rivalPelvis} />
          <View style={styles.legsRow}>
            <View style={styles.legColumn}>
              <View style={styles.rivalArmorThigh} />
              <View style={styles.rivalArmorShin} />
            </View>
            <View style={styles.legColumn}>
              <View style={styles.rivalArmorThigh} />
              <View style={styles.rivalArmorShin} />
            </View>
          </View>

          <View style={styles.shadowBaseRed} />
        </View>

        <Text style={styles.fighterNameText} numberOfLines={1}>{rivalFighter.name}</Text>
      </View>

      {/* Floating Damage Numbers */}
      {floatingDamages.map((dmg) => (
        <View
          key={dmg.id}
          style={[
            styles.floatingDmgContainer,
            dmg.isPlayerTarget ? styles.dmgCoordPlayer : styles.dmgCoordRival,
            Platform.OS === 'web' && ({ className: 'anim-dmg' } as any),
          ]}
        >
          <Text style={[styles.dmgTextValue, dmg.isCritical && styles.criticalDmgStyle]}>
            {dmg.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020408',
    paddingHorizontal: 45,
    paddingVertical: 10,
    position: 'relative',
  },
  screenShakeContainer: {
    transform: [{ translateX: -18 }, { translateY: 6 }],
  },
  floorLine: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowRadius: 15,
    shadowOpacity: 0.9,
  },
  fighterColumn: {
    alignItems: 'center',
    width: 130,
    zIndex: 3,
  },
  hpBlock: {
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  hpTrackBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#0a0e17',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  hpFillPlayer: {
    height: '100%',
    backgroundColor: '#00ffcc',
  },
  hpFillRival: {
    height: '100%',
    backgroundColor: '#ff2a5f',
  },
  hpTextLabel: {
    color: '#9ca3af',
    fontSize: 9,
    marginTop: 3,
    fontWeight: 'bold',
  },
  characterRigBox: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },

  /* CYBER GLADIATOR DESIGN */
  playerHead: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ffcc',
    shadowRadius: 12,
    shadowOpacity: 0.9,
    position: 'relative',
  },
  playerVisor: {
    width: 14,
    height: 5,
    backgroundColor: '#00ffcc',
    borderRadius: 2,
    alignSelf: 'flex-end',
    marginRight: 2,
  },
  headCrest: {
    position: 'absolute',
    top: -5,
    width: 6,
    height: 6,
    backgroundColor: '#00ffcc',
    transform: [{ rotate: '45deg' }],
  },
  playerTorsoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  playerShoulderPadLeft: {
    width: 10,
    height: 12,
    backgroundColor: '#00ffcc',
    borderRadius: 3,
    marginRight: -2,
  },
  playerChest: {
    width: 22,
    height: 42,
    backgroundColor: '#1f2937',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreReactorCyan: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  playerArmRight: {
    width: 12,
    height: 30,
    backgroundColor: '#00ffcc',
    borderRadius: 4,
    marginLeft: -2,
  },
  playerExtendedPunchArm: {
    width: 65,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    transform: [{ translateX: 20 }, { translateY: -10 }],
    shadowColor: '#00ffcc',
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  fistEnergyGlow: {
    position: 'absolute',
    right: -10,
    top: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00ffcc',
    shadowColor: '#ffffff',
    shadowRadius: 15,
    shadowOpacity: 1,
  },
  playerPelvis: {
    width: 20,
    height: 6,
    backgroundColor: '#00ffcc',
    borderRadius: 2,
    marginTop: 1,
  },
  legsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 32,
    marginTop: 1,
  },
  legColumn: {
    alignItems: 'center',
  },
  playerArmorThigh: {
    width: 8,
    height: 22,
    backgroundColor: '#1f2937',
    borderColor: '#00ffcc',
    borderWidth: 1,
    borderRadius: 3,
  },
  playerArmorShin: {
    width: 7,
    height: 22,
    backgroundColor: '#00ffcc',
    borderRadius: 3,
    marginTop: 1,
  },
  playerKickLegPose: {
    transform: [{ rotate: '-75deg' }, { translateY: -15 }, { translateX: 25 }],
  },

  /* RIVAL (A.E.G.I.S-X) DESIGN */
  rivalHead: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#ff2a5f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff2a5f',
    shadowRadius: 12,
    shadowOpacity: 0.9,
    position: 'relative',
  },
  rivalVisor: {
    width: 14,
    height: 5,
    backgroundColor: '#ff2a5f',
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginLeft: 2,
  },
  rivalHornRight: {
    position: 'absolute',
    top: -6,
    right: -2,
    width: 6,
    height: 10,
    backgroundColor: '#ff2a5f',
    transform: [{ rotate: '25deg' }],
  },
  rivalTorsoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  rivalArmLeft: {
    width: 12,
    height: 30,
    backgroundColor: '#ff2a5f',
    borderRadius: 4,
    marginRight: -2,
    alignItems: 'center',
  },
  rivalGuardShield: {
    width: 14,
    height: 18,
    backgroundColor: '#ffd700',
    borderRadius: 3,
    marginTop: 4,
  },
  rivalFlinchArm: {
    transform: [{ rotate: '80deg' }, { translateX: -10 }],
  },
  rivalChest: {
    width: 22,
    height: 42,
    backgroundColor: '#1f2937',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ff2a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreReactorRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff2a5f',
    shadowColor: '#ff2a5f',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  rivalShoulderPadRight: {
    width: 10,
    height: 12,
    backgroundColor: '#ff2a5f',
    borderRadius: 3,
    marginLeft: -2,
  },
  rivalPelvis: {
    width: 20,
    height: 6,
    backgroundColor: '#ff2a5f',
    borderRadius: 2,
    marginTop: 1,
  },
  rivalArmorThigh: {
    width: 8,
    height: 22,
    backgroundColor: '#1f2937',
    borderColor: '#ff2a5f',
    borderWidth: 1,
    borderRadius: 3,
  },
  rivalArmorShin: {
    width: 7,
    height: 22,
    backgroundColor: '#ff2a5f',
    borderRadius: 3,
    marginTop: 1,
  },

  /* SHADOWS & IMPACTS */
  shadowBaseCyan: {
    width: 55,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 255, 204, 0.4)',
    marginTop: 6,
  },
  shadowBaseRed: {
    width: 55,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 42, 95, 0.4)',
    marginTop: 6,
  },
  fighterNameText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  centerClashZone: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  impactSparkBurst: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    shadowColor: '#00ffcc',
    shadowRadius: 25,
    shadowOpacity: 1,
  },
  vsBadgeBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0a0e17',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  vsTextNeon: {
    color: '#ff2a5f',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  fallbackLunge: {
    transform: [{ translateX: 180 }],
  },
  fallbackRecoil: {
    transform: [{ translateX: -50 }],
  },
  floatingDmgContainer: {
    position: 'absolute',
    top: '10%',
    zIndex: 40,
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ff2a5f',
  },
  dmgCoordPlayer: {
    left: '16%',
  },
  dmgCoordRival: {
    right: '16%',
  },
  dmgTextValue: {
    color: '#ff2a5f',
    fontWeight: '900',
    fontSize: 16,
  },
  criticalDmgStyle: {
    color: '#ffd700',
    fontSize: 19,
    letterSpacing: 1,
  },
});