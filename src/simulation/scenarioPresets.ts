import { PresetScenario } from '../types/simulation';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'scen-chaos',
    name: 'The Great Entropy Surge',
    tagline: 'Thermodynamic Collapse Stress Trial',
    description: 'Injects +35 chaotic entropy units into the manifold while dampening background energy by -30%. Evaluates whether autonomous chronomancers can restore order before reality breach.',
    difficulty: 'CHALLENGING',
    variables: {
      energyFlux: -30,
      entropyInjection: 35,
      resonanceDamping: 25,
      containmentAssist: false,
    },
    durationTicks: 50,
    rewardInsight: 80,
  },
  {
    id: 'scen-resonance-collapse',
    name: 'Zero-Point Resonance Decay',
    tagline: 'High-Frequency Harmonic Nullification',
    description: 'Artificially dampens reality resonance field to observe entity behavior under low harmonic coherence. Demands active Directorate stabilization infusions.',
    difficulty: 'MODERATE',
    variables: {
      energyFlux: 15,
      entropyInjection: 18,
      resonanceDamping: 60,
      containmentAssist: true,
    },
    durationTicks: 40,
    rewardInsight: 60,
  },
  {
    id: 'scen-hyper-flux',
    name: 'Super-Radiant Energy Overdrive',
    tagline: 'High-Power Overclock Stress Assay',
    description: 'Pumps +60% surplus quantum flux into all zones. Entities operate at maximum velocity with expanded harvest yields, but heat dissipation risks localized singularities.',
    difficulty: 'EASY',
    variables: {
      energyFlux: 60,
      entropyInjection: 10,
      resonanceDamping: 0,
      containmentAssist: true,
    },
    durationTicks: 35,
    rewardInsight: 50,
  },
  {
    id: 'scen-omega-cascade',
    name: 'Omega-Level Causal Cascade',
    tagline: 'Total Multi-Anomaly Pressure Test',
    description: 'Extreme stress test injecting maximum chaotic entropy (+50), heavy resonance suppression, and simulated radiation storms simultaneously. Highest directorate honor upon survival.',
    difficulty: 'OMEGA',
    variables: {
      energyFlux: -40,
      entropyInjection: 50,
      resonanceDamping: 80,
      containmentAssist: false,
    },
    durationTicks: 70,
    rewardInsight: 150,
  },
];
