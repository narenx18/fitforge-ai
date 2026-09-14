import { CharacterClass, CharacterClassConfig } from '../types';

export const CHARACTER_CLASSES: Record<CharacterClass, CharacterClassConfig> = {
  titan: {
    id: 'titan',
    name: 'Cyber Titan',
    avatar: '🛡️',
    title: 'Aegis Vanguard',
    description: 'Heavy armor mech gladiator engineered with tungsten reinforced plating and hydraulic impact dampening.',
    color: '#00F0FF',
    attackMultiplier: 1.10, // +10% ATK
    defenseMultiplier: 1.25, // +25% DEF
    xpMultiplier: 1.0,
    critRateBonus: 0.05,
    specialTrait: '+25% Defense Armor // +10% Kinetic Force',
  },
  ninja: {
    id: 'ninja',
    name: 'Shadow Ninja',
    avatar: '⚡',
    title: 'Circuit Assassin',
    description: 'Agile cybernetic shinobi equipped with hyper-cadence servos and lethal plasma blades.',
    color: '#B026FF',
    attackMultiplier: 1.20, // +20% ATK
    defenseMultiplier: 1.0,
    xpMultiplier: 1.0,
    critRateBonus: 0.25, // +25% CRIT RATE
    specialTrait: '+25% Critical Hit Chance // +20% Strike Power',
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'Forge Valkyrie',
    avatar: '👑',
    title: 'Solar Sentinel',
    description: 'Elite cyber warrior armed with photovoltaic core matrices that rapidly accelerate combat progression.',
    color: '#FFE600',
    attackMultiplier: 1.15, // +15% ATK
    defenseMultiplier: 1.10,
    xpMultiplier: 1.30, // +30% XP BOOST
    critRateBonus: 0.10,
    specialTrait: '+30% XP Progression Speed // +15% Radiant Force',
  },
};
