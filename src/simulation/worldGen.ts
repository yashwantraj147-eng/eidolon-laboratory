import { SeededPRNG } from './prng';
import {
  WorldConfig,
  WorldZone,
  ResourcePool,
  Entity,
  Anomaly,
  SimulationEvent,
  EntityArchetype,
  AnomalyClass,
  AnomalySeverity,
  ContainmentProtocolType,
} from '../types/simulation';

const ENTITY_FIRST_NAMES = [
  'Aethel', 'Vael', 'Kaelen', 'Orion', 'Scylla', 'Solon', 'Nyx', 'Caelum',
  'Lyra', 'Vesper', 'Thorne', 'Icarus', 'Zephyr', 'Aurelia', 'Drakon', 'Seris',
  'Talos', 'Mira', 'Kestor', 'Vanguard', 'Helios', 'Chronos', 'Axiom', 'Nexus'
];

const FACTIONS = [
  'Directorate Core',
  'Vector Collective',
  'Obsidian Synod',
  'Independent Vanguard',
];

const ANOMALY_NAME_PREFIXES = [
  'Echo', 'Singularity', 'Fracture', 'Null-Gate', 'Resonance', 'Cascade',
  'Vortex', 'Chrono-Fold', 'Paradox', 'Entropy-Lens', 'Substrate-Weave'
];

const ANOMALY_SEVERITIES: AnomalySeverity[] = ['LOW', 'MODERATE', 'SEVERE', 'CRITICAL'];

export interface GeneratedWorld {
  config: WorldConfig;
  zones: WorldZone[];
  resources: ResourcePool;
  entities: Entity[];
  anomalies: Anomaly[];
  events: SimulationEvent[];
}

export class WorldGenerator {
  public static generate(config: WorldConfig): GeneratedWorld {
    const prng = new SeededPRNG(config.seed);

    // 1. Generate Procedural Zones
    const zones: WorldZone[] = [
      {
        id: 'zone-core',
        name: 'Nexus Core Chamber',
        type: 'CORE_CHAMBER',
        center: { x: 0, y: 0, z: 0 },
        radius: 35,
        resourceDensity: 0.95,
        hazardLevel: 0.05,
        color: '#00f0ff',
      },
      {
        id: 'zone-resonance',
        name: 'Harmonic Resonance Field',
        type: 'RESONANCE_FIELD',
        center: {
          x: prng.nextRange(45, 75) * (prng.chance(0.5) ? 1 : -1),
          y: prng.nextRange(-15, 25),
          z: prng.nextRange(45, 75) * (prng.chance(0.5) ? 1 : -1),
        },
        radius: 40,
        resourceDensity: 0.85,
        hazardLevel: 0.25,
        color: '#a855f7',
      },
      {
        id: 'zone-entropy',
        name: 'The Entropic Abyss',
        type: 'ENTROPY_ABYSS',
        center: {
          x: prng.nextRange(60, 95) * (prng.chance(0.5) ? 1 : -1),
          y: prng.nextRange(-35, -10),
          z: prng.nextRange(60, 95) * (prng.chance(0.5) ? 1 : -1),
        },
        radius: 45,
        resourceDensity: 0.3,
        hazardLevel: 0.85,
        color: '#ef4444',
      },
      {
        id: 'zone-substrate',
        name: 'Substrate Quarry Gamma',
        type: 'SUBSTRATE_QUARRY',
        center: {
          x: prng.nextRange(-85, -45),
          y: prng.nextRange(10, 35),
          z: prng.nextRange(-85, -45),
        },
        radius: 38,
        resourceDensity: 0.9,
        hazardLevel: 0.15,
        color: '#10b981',
      },
      {
        id: 'zone-forge',
        name: 'Quantum Nexus Forge',
        type: 'NEXUS_FORGE',
        center: {
          x: prng.nextRange(-60, 60),
          y: prng.nextRange(-25, 25),
          z: prng.nextRange(70, 100),
        },
        radius: 30,
        resourceDensity: 0.75,
        hazardLevel: 0.4,
        color: '#f59e0b',
      },
    ];

    // 2. Initial Resource Baseline
    const initialCoherence = Math.max(
      40,
      100 - config.initialEntropy * 0.45 - (config.complexity - 1) * 6
    );

    const resources: ResourcePool = {
      energy: Math.floor(config.energyBaseline * 0.85),
      maxEnergy: config.energyBaseline,
      substrate: Math.floor(config.substrateCapacity * 0.75),
      maxSubstrate: config.substrateCapacity,
      resonance: Math.floor(config.resonanceIndex * 15),
      maxResonance: config.resonanceIndex * 25,
      entropy: config.initialEntropy,
      coherence: Math.round(initialCoherence * 100) / 100,
      insightPoints: 120, // Initial director research allowance
    };

    // 3. Generate Autonomous Entities
    const archetypes: EntityArchetype[] = [
      'probe',
      'synthet',
      'harvester',
      'archivist',
      'chronomancer',
      'anomaly-warden',
    ];

    const entityCount = 8 + config.complexity * 3; // 11 to 23 autonomous agents
    const entities: Entity[] = [];

    for (let i = 0; i < entityCount; i++) {
      const name = `${prng.pick(ENTITY_FIRST_NAMES)}-${prng.nextInt(10, 99)}`;
      const archetype = archetypes[i % archetypes.length];
      const faction = prng.pick(FACTIONS);
      const angle = prng.nextRange(0, Math.PI * 2);
      const dist = prng.nextRange(15, 80);

      entities.push({
        id: `entity-${i + 1}`,
        name,
        archetype,
        position: {
          x: Math.cos(angle) * dist,
          y: prng.nextRange(-15, 20),
          z: Math.sin(angle) * dist,
        },
        velocity: {
          x: prng.nextRange(-0.2, 0.2),
          y: prng.nextRange(-0.05, 0.05),
          z: prng.nextRange(-0.2, 0.2),
        },
        targetPosition: {
          x: Math.cos(angle + 0.5) * (dist + 5),
          y: prng.nextRange(-10, 15),
          z: Math.sin(angle + 0.5) * (dist + 5),
        },
        operationalCondition: 'optimal',
        health: prng.nextInt(85, 100),
        energy: prng.nextInt(70, 100),
        currentGoal: 'HARVEST_SUBSTRATE',
        utilityScores: {
          harvest: prng.nextRange(0.6, 0.9),
          stabilize: prng.nextRange(0.3, 0.7),
          survey: prng.nextRange(0.4, 0.8),
          recharge: 0.2,
        },
        affiliation: faction,
        inventory: {
          substrate: prng.nextInt(5, 25),
          resonanceCrystals: prng.nextInt(1, 8),
          chronalDust: prng.nextInt(0, 3),
        },
        memories: [
          {
            tick: 0,
            event: `Synthesized into reality ${config.name} at coordinates [${Math.round(dist)}u, ${Math.round(angle * 57.3)}°]`,
            impact: 0.5,
          },
        ],
        totalDistanceTraveled: 0,
        discoveriesCount: 0,
      });
    }

    // 4. Generate Initial Anomalies
    const anomalyClasses: AnomalyClass[] = [
      'TEMPORAL_DILATION',
      'SPATIAL_TEAR',
      'CAUSAL_CASCADE',
      'INFORMATION_CORRUPTION',
      'ENTROPIC_VORTEX',
      'ZERO_POINT_SPIKE',
    ];

    const protocols: ContainmentProtocolType[] = [
      'HARMONIC_DAMPENING',
      'SUBSTRATE_ISOLATION',
      'TEMPORAL_INVERSION',
      'QUANTUM_PINNING',
    ];

    const anomalyCount = 2 + Math.min(3, Math.floor(config.anomalyFrequency * 2.5));
    const anomalies: Anomaly[] = [];

    for (let i = 0; i < anomalyCount; i++) {
      const aClass = anomalyClasses[i % anomalyClasses.length];
      const severity = ANOMALY_SEVERITIES[Math.min(i, ANOMALY_SEVERITIES.length - 1)];
      const designation = `ANOM-${prng.nextInt(100, 999)}`;
      const name = `${prng.pick(ANOMALY_NAME_PREFIXES)} ${designation}`;
      const angle = prng.nextRange(0, Math.PI * 2);
      const dist = prng.nextRange(35, 95);

      const symptoms = [
        `Distorted localized metric tensor at radius ${(15 + i * 5).toFixed(1)}u`,
        `High-frequency resonance oscillation detected (+${(prng.nextRange(12, 48)).toFixed(1)} dB)`,
        `Chronal drift observed in adjacent synthetic probes`,
      ];

      const hypotheses = [
        {
          id: `hypo-${i}-1`,
          label: 'Spontaneous Zero-Point Quantum Fluctuation',
          confidence: prng.nextRange(0.65, 0.88),
          tested: false,
          validated: false,
        },
        {
          id: `hypo-${i}-2`,
          label: 'Entropic Substrate Disintegration Feedback',
          confidence: prng.nextRange(0.35, 0.62),
          tested: false,
          validated: false,
        },
        {
          id: `hypo-${i}-3`,
          label: 'External Chronomantic Anchor Disconnect',
          confidence: prng.nextRange(0.2, 0.45),
          tested: false,
          validated: false,
        },
      ];

      anomalies.push({
        id: `anomaly-${i + 1}`,
        designation,
        name,
        classification: aClass,
        severity,
        location: {
          x: Math.cos(angle) * dist,
          y: prng.nextRange(-20, 25),
          z: Math.sin(angle) * dist,
        },
        radius: prng.nextRange(12, 28),
        discoveryTick: 0,
        status: 'UNCONTAINED',
        symptoms,
        hypotheses,
        activeHypothesisId: hypotheses[0].id,
        containmentProgress: 0,
        energyEmission: prng.nextRange(25, 80),
        resonanceModulation: prng.nextRange(15, 60),
        containmentProcedure: {
          requiredEnergy: prng.nextInt(60, 150),
          requiredResonance: prng.nextInt(30, 90),
          protocolType: prng.pick(protocols),
        },
      });
    }

    // 5. Initial Genesis Events
    const events: SimulationEvent[] = [
      {
        id: 'event-0',
        tick: 0,
        timestamp: Date.now(),
        type: 'REALITY_GENESIS',
        severity: 'INFO',
        title: `Synthetic Reality "${config.name}" Seeded`,
        description: `Reality successfully initialized from PRNG Seed #${config.seed}. Ruleset: ${config.ruleset}. Complexity rating: Level ${config.complexity}. Initial Coherence: ${resources.coherence.toFixed(1)}%.`,
      },
      {
        id: 'event-1',
        tick: 0,
        timestamp: Date.now() + 100,
        type: 'ANOMALY_SPAWN',
        severity: 'ANOMALY',
        title: `Sensors Flagged ${anomalies.length} Initial Anomalies`,
        description: `Telemetry alerted directorate to localized field distensions including ${anomalies[0].designation} (${anomalies[0].classification}).`,
        affectedLocation: anomalies[0].location,
      },
      {
        id: 'event-2',
        tick: 0,
        timestamp: Date.now() + 200,
        type: 'ENTITY_DISCOVERY',
        severity: 'SUCCESS',
        title: `${entities.length} Autonomous Entities Deployed`,
        description: `Synthetic agents across 4 distinct ideological factions synchronized their autonomous utility engines.`,
      },
    ];

    return {
      config,
      zones,
      resources,
      entities,
      anomalies,
      events,
    };
  }
}
