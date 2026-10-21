import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  WorldConfig,
  WorldZone,
  ResourcePool,
  Entity,
  Anomaly,
  SimulationEvent,
  TelemetryPoint,
  TimelineBranch,
  RealitySnapshot,
  ResearchNode,
  Experiment,
  ArchiveRecord,
  ContainmentProtocolType,
  EntanglementLink,
  FactionState,
  ChronalStorm,
} from '../types/simulation';
import { WorldGenerator } from './worldGen';
import { EntityEngine } from './entityEngine';
import { AnomalyEngine } from './anomalyEngine';
import { EntanglementEngine } from './entanglementEngine';
import { FactionEngine, INITIAL_FACTIONS } from './factionEngine';
import { SeededPRNG } from './prng';
import { INITIAL_RESEARCH_NODES } from './researchTree';
import { INITIAL_ARCHIVE_RECORDS } from './archiveData';
import { sound } from './audioSynth';

export type WorkspaceId =
  | 'command-center'
  | 'observatory'
  | 'entity-atlas'
  | 'anomaly-lab'
  | 'temporal-lab'
  | 'experiment-workbench'
  | 'signal-room'
  | 'research-tree'
  | 'archive'
  | 'settings';

const DEFAULT_CONFIG: WorldConfig = {
  id: 'world-prime',
  name: 'Reality-Sigma-9',
  seed: 849204,
  complexity: 3,
  initialEntropy: 18,
  resonanceIndex: 4,
  substrateCapacity: 1200,
  energyBaseline: 1500,
  anomalyFrequency: 2,
  ruleset: 'standard',
};

interface SimulationContextType {
  // State
  config: WorldConfig;
  zones: WorldZone[];
  resources: ResourcePool;
  entities: Entity[];
  anomalies: Anomaly[];
  events: SimulationEvent[];
  telemetryHistory: TelemetryPoint[];
  timelineBranches: TimelineBranch[];
  currentBranchId: string;
  snapshots: RealitySnapshot[];
  researchNodes: ResearchNode[];
  experiments: Experiment[];
  activeExperiment: Experiment | null;
  archiveRecords: ArchiveRecord[];

  entanglementLinks: EntanglementLink[];
  factions: FactionState[];
  activeStorm: ChronalStorm | null;
  
  currentTick: number;
  isPaused: boolean;
  simulationSpeed: number;
  activeWorkspace: WorkspaceId;
  selectedEntityId: string | null;
  selectedAnomalyId: string | null;
  selectedZoneId: string | null;
  isConsoleOpen: boolean;
  isMuted: boolean;
  isAmbientActive: boolean;

  // Actions
  togglePause: () => void;
  stepSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  setActiveWorkspace: (ws: WorkspaceId) => void;
  setSelectedEntityId: (id: string | null) => void;
  setSelectedAnomalyId: (id: string | null) => void;
  setSelectedZoneId: (id: string | null) => void;
  setIsConsoleOpen: (open: boolean) => void;
  toggleMute: () => void;
  toggleAmbientDrone: () => void;

  // Directorate Interventions
  stabilizeField: () => void;
  purgeEntropy: () => void;
  overclockEntities: () => void;
  chronoRewindPulse: () => void;
  spawnManualAnomaly: () => void;
  triggerChronalStorm: () => void;
  forgeEntanglement: (entityAId: string, entityBId: string) => boolean;

  // Anomaly Actions
  testHypothesis: (anomalyId: string, hypothesisId: string) => void;
  deployContainmentProtocol: (anomalyId: string, protocol: ContainmentProtocolType, energy: number, resonance: number) => boolean;

  // Temporal Branching
  createBranch: (name: string, description: string) => void;
  switchBranch: (branchId: string) => void;
  captureSnapshot: (label: string) => void;
  restoreSnapshot: (snapshotId: string) => void;

  // Research
  unlockResearch: (nodeId: string) => void;

  // Experiments
  queueExperiment: (exp: Omit<Experiment, 'id' | 'status' | 'startTick' | 'telemetryRecords'>) => void;
  abortExperiment: () => void;

  // Matrix IO
  exportRealityMatrix: () => void;
  importRealityMatrix: (jsonString: string) => void;
  resetReality: (newConfig?: Partial<WorldConfig>) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WorldConfig>(DEFAULT_CONFIG);
  const prngRef = useRef<SeededPRNG>(new SeededPRNG(DEFAULT_CONFIG.seed));
  const entityEngineRef = useRef<EntityEngine>(new EntityEngine(prngRef.current));
  const anomalyEngineRef = useRef<AnomalyEngine>(new AnomalyEngine(prngRef.current));
  const entanglementEngineRef = useRef<EntanglementEngine>(new EntanglementEngine(prngRef.current));
  const factionEngineRef = useRef<FactionEngine>(new FactionEngine(prngRef.current));

  // Initialize World
  const initialWorld = WorldGenerator.generate(DEFAULT_CONFIG);
  const [zones, setZones] = useState<WorldZone[]>(initialWorld.zones);
  const [resources, setResources] = useState<ResourcePool>(initialWorld.resources);
  const [entities, setEntities] = useState<Entity[]>(initialWorld.entities);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(initialWorld.anomalies);
  const [events, setEvents] = useState<SimulationEvent[]>(initialWorld.events);
  
  const [entanglementLinks, setEntanglementLinks] = useState<EntanglementLink[]>(() =>
    entanglementEngineRef.current.createInitialPairs(initialWorld.entities)
  );
  const [factions, setFactions] = useState<FactionState[]>(INITIAL_FACTIONS);
  const [activeStorm, setActiveStorm] = useState<ChronalStorm | null>(null);

  const [currentTick, setCurrentTick] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('command-center');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(initialWorld.entities[0]?.id || null);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(initialWorld.anomalies[0]?.id || null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(initialWorld.zones[0]?.id || null);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);

  // Telemetry History
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([
    {
      tick: 0,
      coherence: initialWorld.resources.coherence,
      energy: initialWorld.resources.energy,
      entropy: initialWorld.resources.entropy,
      substrate: initialWorld.resources.substrate,
      resonance: initialWorld.resources.resonance,
      activeEntities: initialWorld.entities.length,
      activeAnomalies: initialWorld.anomalies.filter((a) => a.status !== 'CONTAINED').length,
      tickDurationMs: 16,
    },
  ]);

  // Timeline Branches
  const [currentBranchId, setCurrentBranchId] = useState<string>('branch-prime');
  const [timelineBranches, setTimelineBranches] = useState<TimelineBranch[]>([
    {
      id: 'branch-prime',
      name: 'Prime Timeline α',
      createdTick: 0,
      forkDescription: 'Original Directorate reality origin point.',
      active: true,
      color: '#00f0ff',
      metricsHistory: [],
    },
  ]);

  // Snapshots
  const [snapshots, setSnapshots] = useState<RealitySnapshot[]>([]);

  // Research
  const [researchNodes, setResearchNodes] = useState<ResearchNode[]>(INITIAL_RESEARCH_NODES);

  // Experiments
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);

  // Archives
  const [archiveRecords, setArchiveRecords] = useState<ArchiveRecord[]>(INITIAL_ARCHIVE_RECORDS);

  // Research Buff Lookups
  const isResearchUnlocked = useCallback((id: string) => {
    return researchNodes.some((n) => n.id === id && n.unlocked);
  }, [researchNodes]);

  // Audio Controls
  const toggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  const toggleAmbientDrone = useCallback(() => {
    const active = sound.toggleAmbientDrone();
    setIsAmbientActive(active);
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    sound.playWarpSweep(speed);
    setSimulationSpeed(speed);
  }, []);

  // Simulation Tick Logic
  const tickOnce = useCallback(() => {
    setCurrentTick((prevTick) => {
      const nextTick = prevTick + 1;
      const startMs = performance.now();

      // Research modifiers
      const containmentBoost = isResearchUnlocked('res-contain-1') ? 1.4 : 1.0;
      const passiveEntropySiphon = isResearchUnlocked('res-synth-1') ? 0.15 : 0.0;

      // 1. Update Entities
      const entityResult = entityEngineRef.current.updateEntities(
        entities,
        zones,
        anomalies,
        resources,
        nextTick
      );

      // 2. Update Entanglements
      const entanglementResult = entanglementEngineRef.current.updateEntanglements(
        entanglementLinks,
        entityResult.updatedEntities
      );

      // 3. Update Anomalies
      const anomalyResult = anomalyEngineRef.current.updateAnomalies(
        anomalies,
        resources,
        nextTick,
        containmentBoost
      );

      // 4. Update Faction Territorial Dominance
      const updatedFactions = factionEngineRef.current.updateFactions(
        factions,
        entanglementResult.updatedEntities,
        zones
      );
      setFactions(updatedFactions);

      // 5. Chronal Storm Effects
      let stormEntropySurge = 0;
      if (activeStorm) {
        stormEntropySurge = 0.25 * activeStorm.intensity;
        if (activeStorm.remainingTicks <= 1) {
          setActiveStorm(null);
          setEvents((prev) => [
            {
              id: `storm-dissipate-${Date.now()}`,
              tick: nextTick,
              timestamp: Date.now(),
              type: 'CHRONAL_STORM_DISSIPATED',
              severity: 'INFO',
              title: `Chronal Tempest Dissipated`,
              description: `${activeStorm.name} has receded. Local metric tensors stabilized.`,
            },
            ...prev,
          ]);
        } else {
          setActiveStorm((s) => (s ? { ...s, remainingTicks: s.remainingTicks - 1 } : null));
        }
      }

      // 6. Compute Delta Resources
      const rawEntropy =
        resources.entropy +
        entityResult.entropyDelta +
        anomalyResult.entropyLeak +
        stormEntropySurge -
        passiveEntropySiphon;
      const nextEntropy = Math.max(0, Math.min(100, rawEntropy));

      const rawEnergy =
        resources.energy +
        entityResult.energyDelta -
        anomalyResult.energyDrain +
        passiveEntropySiphon * 4;
      const nextEnergy = Math.max(0, Math.min(resources.maxEnergy, rawEnergy));

      const rawSubstrate = resources.substrate + entityResult.substrateDelta;
      const nextSubstrate = Math.max(0, Math.min(resources.maxSubstrate, rawSubstrate));

      const rawResonance =
        resources.resonance +
        entityResult.resonanceDelta +
        entanglementResult.resonanceDelta -
        anomalyResult.resonanceDrain;
      const nextResonance = Math.max(0, Math.min(resources.maxResonance, rawResonance));

      // Coherence calculation: depends on entropy, uncontained anomalies, and resonance
      const uncontainedCount = anomalyResult.updatedAnomalies.filter((a) => a.status !== 'CONTAINED').length;
      const coherenceDrain = (nextEntropy * 0.04) + (uncontainedCount * 0.12) + anomalyResult.coherenceImpact;
      const coherenceRegen = (nextResonance / resources.maxResonance) * 0.15 + entanglementResult.coherenceDelta;
      const nextCoherence = Math.max(
        0,
        Math.min(100, Math.round((resources.coherence - coherenceDrain + coherenceRegen) * 100) / 100)
      );

      // Reactively modulate ambient audio dissonance based on coherence
      sound.updateCoherenceDissonance(nextCoherence);

      const updatedResources: ResourcePool = {
        ...resources,
        energy: Math.round(nextEnergy),
        substrate: Math.round(nextSubstrate),
        resonance: Math.round(nextResonance),
        entropy: Math.round(nextEntropy * 10) / 10,
        coherence: nextCoherence,
      };

      setEntities(entanglementResult.updatedEntities);
      setEntanglementLinks(entanglementResult.updatedLinks);
      setAnomalies(anomalyResult.updatedAnomalies);
      setResources(updatedResources);

      // Events
      if (anomalyResult.newEvents.length > 0) {
        setEvents((prev) => [...anomalyResult.newEvents, ...prev].slice(0, 80));
      }

      // Check experiment progress
      if (activeExperiment && activeExperiment.status === 'RUNNING') {
        const elapsed = nextTick - activeExperiment.startTick;
        if (elapsed >= activeExperiment.durationTicks) {
          // Complete experiment
          sound.playSuccess();
          const completed: Experiment = {
            ...activeExperiment,
            status: 'COMPLETED',
            endTick: nextTick,
            outcomeSummary: `Experiment trial finished after ${activeExperiment.durationTicks} ticks. Coherence delta: ${(nextCoherence - activeExperiment.telemetryRecords[0]?.coherence || 0).toFixed(2)}%.`,
            successScore: Math.min(100, Math.round(nextCoherence * 0.9 + 10)),
          };
          setActiveExperiment(null);
          setExperiments((prev) => [completed, ...prev]);
          setResources((r) => ({ ...r, insightPoints: r.insightPoints + 60 }));
          setEvents((prev) => [
            {
              id: `exp-done-${Date.now()}`,
              tick: nextTick,
              timestamp: Date.now(),
              type: 'EXPERIMENT_COMPLETED',
              severity: 'SUCCESS',
              title: `Experiment Completed: ${completed.title}`,
              description: `Generated +60 Insight Points. Outcome score: ${completed.successScore}/100.`,
            },
            ...prev,
          ]);
        }
      }

      // Telemetry log (every tick, keeping 100 points)
      const tickDuration = performance.now() - startMs;
      const newPoint: TelemetryPoint = {
        tick: nextTick,
        coherence: nextCoherence,
        energy: updatedResources.energy,
        entropy: updatedResources.entropy,
        substrate: updatedResources.substrate,
        resonance: updatedResources.resonance,
        activeEntities: entanglementResult.updatedEntities.length,
        activeAnomalies: uncontainedCount,
        tickDurationMs: Math.round(tickDuration * 10) / 10,
      };

      setTelemetryHistory((prev) => [...prev.slice(-99), newPoint]);

      return nextTick;
    });
  }, [
    entities,
    zones,
    anomalies,
    resources,
    activeExperiment,
    isResearchUnlocked,
    entanglementLinks,
    factions,
    activeStorm,
  ]);

  // Master Clock Loop
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = Math.max(30, Math.round(600 / simulationSpeed));
    const timer = setInterval(() => {
      tickOnce();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, simulationSpeed, tickOnce]);

  // Electron IPC Listeners
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { eidolonDesktop?: {
        onMenuAction: (cb: (action: string) => void) => () => void;
        onNavWorkspace: (cb: (ws: string) => void) => () => void;
      }}).eidolonDesktop
    ) {
      const desktop = (window as unknown as { eidolonDesktop: {
        onMenuAction: (cb: (action: string) => void) => () => void;
        onNavWorkspace: (cb: (ws: string) => void) => () => void;
      }}).eidolonDesktop;

      const unsubMenu = desktop.onMenuAction((action) => {
        sound.playBlip(750);
        if (action === 'open-console') setIsConsoleOpen((prev) => !prev);
        if (action === 'toggle-pause') setIsPaused((prev) => !prev);
        if (action === 'step-simulation') tickOnce();
        if (action === 'create-snapshot') {
          captureSnapshot(`Snapshot @ Tick ${currentTick}`);
        }
      });

      const unsubNav = desktop.onNavWorkspace((ws) => {
        sound.playBlip(620);
        setActiveWorkspace(ws as WorkspaceId);
      });

      return () => {
        unsubMenu();
        unsubNav();
      };
    }
  }, [currentTick, tickOnce]);

  // Keyboard Shortcuts (Web fallback + desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sound.playBlip(900);
        setIsConsoleOpen((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        sound.playBlip(550);
        setIsPaused((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        sound.playBlip(800);
        tickOnce();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        captureSnapshot(`Snapshot @ Tick ${currentTick}`);
      } else if ((e.metaKey || e.ctrlKey) && e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        const map: Record<string, WorkspaceId> = {
          '1': 'command-center',
          '2': 'observatory',
          '3': 'entity-atlas',
          '4': 'anomaly-lab',
          '5': 'temporal-lab',
          '6': 'experiment-workbench',
          '7': 'signal-room',
          '8': 'research-tree',
          '9': 'archive',
          '0': 'settings',
        };
        if (map[e.key]) {
          sound.playBlip(600);
          setActiveWorkspace(map[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTick, tickOnce]);

  // Directorate Interventions
  const stabilizeField = useCallback(() => {
    sound.playContainmentPulse();
    setResources((prev) => {
      if (prev.energy < 40) return prev;
      return {
        ...prev,
        energy: prev.energy - 40,
        resonance: Math.min(prev.maxResonance, prev.resonance + 25),
        entropy: Math.max(0, prev.entropy - 14),
        coherence: Math.min(100, Math.round((prev.coherence + 16) * 100) / 100),
      };
    });
    setEvents((prev) => [
      {
        id: `intervene-stab-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'DIRECTORATE_INTERVENTION',
        severity: 'SUCCESS',
        title: 'Emergency Resonance Infusion Dispatched',
        description: 'Channeled 40MW quantum energy into reality core. Local coherence raised +16%. Entropy reduced.',
      },
      ...prev,
    ]);
  }, [currentTick]);

  const purgeEntropy = useCallback(() => {
    sound.playContainmentPulse();
    setResources((prev) => {
      if (prev.energy < 50) return prev;
      return {
        ...prev,
        energy: prev.energy - 50,
        entropy: Math.max(0, prev.entropy - 25),
        coherence: Math.min(100, Math.round((prev.coherence + 8) * 100) / 100),
      };
    });
    setEvents((prev) => [
      {
        id: `intervene-purge-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'DIRECTORATE_INTERVENTION',
        severity: 'SUCCESS',
        title: 'Entropic Siphon Discharge Triggered',
        description: 'Discharged -25 chaotic entropy units through containment sink. Metric stability restored.',
      },
      ...prev,
    ]);
  }, [currentTick]);

  const overclockEntities = useCallback(() => {
    sound.playBlip(1100);
    setResources((prev) => {
      if (prev.energy < 30) return prev;
      return { ...prev, energy: prev.energy - 30 };
    });
    setEntities((prev) =>
      prev.map((e) => ({
        ...e,
        energy: 100,
        inventory: {
          ...e.inventory,
          substrate: e.inventory.substrate + 10,
        },
      }))
    );
    setEvents((prev) => [
      {
        id: `intervene-overclock-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'DIRECTORATE_INTERVENTION',
        severity: 'INFO',
        title: 'Autonomous Probes Overclocked',
        description: 'Broadcasted direct inductive power recharge to all active agents (+10 substrate, 100% power).',
      },
      ...prev,
    ]);
  }, [currentTick]);

  const chronoRewindPulse = useCallback(() => {
    sound.playBranch();
    setEntities((prev) =>
      prev.map((e) => ({
        ...e,
        health: 100,
        operationalCondition: 'optimal',
      }))
    );
    setAnomalies((prev) =>
      prev.map((a) => (a.status !== 'CONTAINED' ? { ...a, radius: Math.max(10, a.radius * 0.75) } : a))
    );
    setEvents((prev) => [
      {
        id: `intervene-chrono-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'DIRECTORATE_INTERVENTION',
        severity: 'SUCCESS',
        title: 'Chrono-Restoration Wave Propagated',
        description: 'Rewound micro-structural lattice decay. All agent hulls restored to 100%. Anomaly radiuses contracted by 25%.',
      },
      ...prev,
    ]);
  }, [currentTick]);

  const spawnManualAnomaly = useCallback(() => {
    sound.playAlert();
    const prng = prngRef.current;
    const count = anomalies.length + 1;
    const newAnom: Anomaly = {
      id: `anomaly-${Date.now()}`,
      designation: `ANOM-${prng.nextInt(700, 999)}`,
      name: `Synthesized Fracture ANOM-${count}`,
      classification: prng.pick([
        'TEMPORAL_DILATION',
        'SPATIAL_TEAR',
        'CAUSAL_CASCADE',
        'ENTROPIC_VORTEX',
        'ZERO_POINT_SPIKE',
      ]),
      severity: 'SEVERE',
      location: {
        x: prng.nextRange(-60, 60),
        y: prng.nextRange(-15, 20),
        z: prng.nextRange(-60, 60),
      },
      radius: prng.nextRange(16, 32),
      discoveryTick: currentTick,
      status: 'UNCONTAINED',
      symptoms: ['Directorate test distortion injected', 'Coherence ripple registered across all sensors'],
      hypotheses: [
        {
          id: `hypo-${Date.now()}-1`,
          label: 'Controlled Directorate Perturbation Singularity',
          confidence: 0.85,
          tested: false,
          validated: false,
        },
        {
          id: `hypo-${Date.now()}-2`,
          label: 'Resonance Cavity Vacuum Breakdown',
          confidence: 0.45,
          tested: false,
          validated: false,
        },
      ],
      containmentProgress: 0,
      energyEmission: 65,
      resonanceModulation: 45,
      containmentProcedure: {
        requiredEnergy: 80,
        requiredResonance: 50,
        protocolType: 'HARMONIC_DAMPENING',
      },
    };

    setAnomalies((prev) => [newAnom, ...prev]);
    setSelectedAnomalyId(newAnom.id);
    setEvents((prev) => [
      {
        id: `anom-manual-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'ANOMALY_SPAWN',
        severity: 'ANOMALY',
        title: `Manual Anomaly Generated: ${newAnom.designation}`,
        description: `High-energy singularity manifested at [${Math.round(newAnom.location.x)}, ${Math.round(newAnom.location.y)}, ${Math.round(newAnom.location.z)}]. Containment team summoned.`,
        affectedLocation: newAnom.location,
      },
      ...prev,
    ]);
  }, [anomalies.length, currentTick]);

  const triggerChronalStorm = useCallback(() => {
    sound.playStormSiren();
    const prng = prngRef.current;
    const storm: ChronalStorm = {
      id: `storm-${Date.now()}`,
      name: `Tempest-Omega-${prng.nextInt(10, 99)}`,
      center: {
        x: prng.nextRange(-40, 40),
        y: 0,
        z: prng.nextRange(-40, 40),
      },
      radius: prng.nextRange(40, 65),
      intensity: prng.nextInt(2, 4),
      remainingTicks: 35,
      color: '#a855f7',
    };
    setActiveStorm(storm);
    setEvents((prev) => [
      {
        id: `storm-event-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'CHRONAL_STORM',
        severity: 'WARN',
        title: `Chronal Radiation Tempest Manifested: ${storm.name}`,
        description: `Atmospheric metric distortion spanning radius ${storm.radius.toFixed(1)}u. Radiation hazard alert.`,
        affectedLocation: storm.center,
      },
      ...prev,
    ]);
  }, [currentTick]);

  const forgeEntanglement = useCallback((entityAId: string, entityBId: string) => {
    sound.playEntanglementPing();
    const res = entanglementEngineRef.current.forgeEntanglement(entityAId, entityBId, entanglementLinks);
    if (res.success && res.link) {
      setEntanglementLinks((prev) => [...prev, res.link!]);
      setEvents((prev) => [
        {
          id: `entangle-${Date.now()}`,
          tick: currentTick,
          timestamp: Date.now(),
          type: 'QUANTUM_ENTANGLEMENT',
          severity: 'SUCCESS',
          title: 'Quantum Entanglement Link Forged',
          description: `Twin state synchronization established between agents. +15Hz resonance harmonics online.`,
        },
        ...prev,
      ]);
      return true;
    }
    return false;
  }, [currentTick, entanglementLinks]);

  // Anomaly Hypothesis & Protocol
  const testHypothesis = useCallback((anomalyId: string, hypothesisId: string) => {
    sound.playScan();
    const anomaly = anomalies.find((a) => a.id === anomalyId);
    if (!anomaly) return;

    const res = anomalyEngineRef.current.testHypothesis(anomaly, hypothesisId, currentTick);
    setAnomalies((prev) => prev.map((a) => (a.id === anomalyId ? res.updatedAnomaly : a)));

    const bonusMultiplier = isResearchUnlocked('res-comp-1') ? 2 : 1;
    const earned = res.insightEarned * bonusMultiplier;

    setResources((prev) => ({
      ...prev,
      insightPoints: prev.insightPoints + earned,
    }));

    if (res.event) {
      setEvents((prev) => [res.event!, ...prev]);
    }
  }, [anomalies, currentTick, isResearchUnlocked]);

  const deployContainmentProtocol = useCallback(
    (anomalyId: string, protocol: ContainmentProtocolType, energy: number, resonance: number) => {
      sound.playContainmentPulse();
      const anomaly = anomalies.find((a) => a.id === anomalyId);
      if (!anomaly) return false;

      // Check research cost reduction
      const discount = isResearchUnlocked('res-contain-2') ? 0.7 : 1.0;
      const effectiveEnergy = energy / discount;
      const effectiveResonance = resonance / discount;

      const res = anomalyEngineRef.current.deployProtocol(
        anomaly,
        protocol,
        effectiveEnergy,
        effectiveResonance,
        currentTick
      );

      setAnomalies((prev) => prev.map((a) => (a.id === anomalyId ? res.updatedAnomaly : a)));
      if (res.event) {
        setEvents((prev) => [res.event!, ...prev]);
      }
      return res.success;
    },
    [anomalies, currentTick, isResearchUnlocked]
  );

  // Temporal Branching
  const createBranch = useCallback(
    (name: string, description: string) => {
      sound.playBranch();
      const branchId = `branch-${Date.now()}`;
      const colors = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
      const color = colors[timelineBranches.length % colors.length];

      const newBranch: TimelineBranch = {
        id: branchId,
        parentBranchId: currentBranchId,
        name,
        createdTick: currentTick,
        forkDescription: description,
        active: true,
        color,
        metricsHistory: telemetryHistory.map((t) => ({
          tick: t.tick,
          coherence: t.coherence,
          energy: t.energy,
          entropy: t.entropy,
          activeEntities: t.activeEntities,
          activeAnomalies: t.activeAnomalies,
        })),
      };

      setTimelineBranches((prev) => [...prev, newBranch]);
      setCurrentBranchId(branchId);

      // Branch coherence impact
      const stabilizerDamping = isResearchUnlocked('res-time-1') ? 0.5 : 1.0;
      setResources((prev) => ({
        ...prev,
        coherence: Math.max(20, Math.round((prev.coherence - 4 * stabilizerDamping) * 100) / 100),
      }));

      setEvents((prev) => [
        {
          id: `branch-event-${Date.now()}`,
          tick: currentTick,
          timestamp: Date.now(),
          type: 'TIMELINE_BRANCH',
          severity: 'INFO',
          title: `Alternate Reality Branch Forked: ${name}`,
          description: `Timeline bifurcated at tick #${currentTick}. Parent: ${currentBranchId}. Many-worlds manifold established.`,
        },
        ...prev,
      ]);
    },
    [currentBranchId, currentTick, telemetryHistory, timelineBranches.length, isResearchUnlocked]
  );

  const switchBranch = useCallback((branchId: string) => {
    sound.playBranch();
    setCurrentBranchId(branchId);
    setTimelineBranches((prev) =>
      prev.map((b) => ({ ...b, active: b.id === branchId }))
    );
  }, []);

  const captureSnapshot = useCallback(
    (label: string) => {
      sound.playScan();
      const snapshot: RealitySnapshot = {
        id: `snap-${Date.now()}`,
        label,
        tick: currentTick,
        timestamp: Date.now(),
        branchId: currentBranchId,
        stateDump: JSON.stringify({
          config,
          zones,
          resources,
          entities,
          anomalies,
          entanglementLinks,
          currentTick,
        }),
      };
      setSnapshots((prev) => [snapshot, ...prev]);
      setEvents((prev) => [
        {
          id: `snap-event-${Date.now()}`,
          tick: currentTick,
          timestamp: Date.now(),
          type: 'SNAPSHOT_CAPTURED',
          severity: 'SUCCESS',
          title: `Reality Snapshot Recorded: ${label}`,
          description: `Full phase-space state encoded into quantum memory buffer.`,
        },
        ...prev,
      ]);
    },
    [anomalies, config, currentBranchId, currentTick, entities, entanglementLinks, resources, zones]
  );

  const restoreSnapshot = useCallback((snapshotId: string) => {
    sound.playSuccess();
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return;

    try {
      const parsed = JSON.parse(snap.stateDump);
      if (parsed.zones) setZones(parsed.zones);
      if (parsed.resources) setResources(parsed.resources);
      if (parsed.entities) setEntities(parsed.entities);
      if (parsed.anomalies) setAnomalies(parsed.anomalies);
      if (parsed.entanglementLinks) setEntanglementLinks(parsed.entanglementLinks);
      if (parsed.currentTick !== undefined) setCurrentTick(parsed.currentTick);

      setEvents((prev) => [
        {
          id: `snap-restore-${Date.now()}`,
          tick: snap.tick,
          timestamp: Date.now(),
          type: 'SNAPSHOT_RESTORED',
          severity: 'SUCCESS',
          title: `Reality State Restored: ${snap.label}`,
          description: `Timeline restored to tick #${snap.tick}. Phase-space matrix synchronized.`,
        },
        ...prev,
      ]);
    } catch {}
  }, [snapshots]);

  // Research Unlocks
  const unlockResearch = useCallback((nodeId: string) => {
    const node = researchNodes.find((n) => n.id === nodeId);
    if (!node || node.unlocked) return;
    if (resources.insightPoints < node.cost) return;

    const prereqsMet = node.prerequisites.every((pid) =>
      researchNodes.some((rn) => rn.id === pid && rn.unlocked)
    );
    if (!prereqsMet) return;

    sound.playSuccess();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#a855f7', '#10b981'],
    });

    setResources((prev) => ({
      ...prev,
      insightPoints: prev.insightPoints - node.cost,
      ...(nodeId === 'res-synth-2'
        ? {
            maxEnergy: Math.round(prev.maxEnergy * 1.5),
            maxSubstrate: Math.round(prev.maxSubstrate * 1.5),
            maxResonance: Math.round(prev.maxResonance * 1.5),
          }
        : {}),
    }));

    setResearchNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, unlocked: true } : n))
    );

    setEvents((prev) => [
      {
        id: `tech-unlock-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'TECH_UNLOCKED',
        severity: 'SUCCESS',
        title: `Directorate Advancement: ${node.title}`,
        description: `Unlocked technological capability. Benefit: ${node.mechanicalBenefit}`,
      },
      ...prev,
    ]);
  }, [currentTick, researchNodes, resources.insightPoints]);

  // Experiment Queue
  const queueExperiment = useCallback(
    (expData: Omit<Experiment, 'id' | 'status' | 'startTick' | 'telemetryRecords'>) => {
      sound.playScan();
      const exp: Experiment = {
        ...expData,
        id: `exp-${Date.now()}`,
        status: 'RUNNING',
        startTick: currentTick,
        telemetryRecords: [
          {
            tick: currentTick,
            coherence: resources.coherence,
            energy: resources.energy,
            entropy: resources.entropy,
            substrate: resources.substrate,
            resonance: resources.resonance,
            activeEntities: entities.length,
            activeAnomalies: anomalies.filter((a) => a.status !== 'CONTAINED').length,
            tickDurationMs: 16,
          },
        ],
      };

      // Apply initial perturbations
      setResources((prev) => ({
        ...prev,
        entropy: Math.min(100, prev.entropy + exp.variables.entropyInjection),
        energy: Math.max(0, Math.min(prev.maxEnergy, prev.energy * (1 + exp.variables.energyFlux / 100))),
      }));

      setActiveExperiment(exp);
      setEvents((prev) => [
        {
          id: `exp-start-${Date.now()}`,
          tick: currentTick,
          timestamp: Date.now(),
          type: 'EXPERIMENT_STARTED',
          severity: 'INFO',
          title: `Initiated Experiment: ${exp.title}`,
          description: `Scheduled perturbation trial for ${exp.durationTicks} ticks on branch ${exp.targetBranchId}.`,
        },
        ...prev,
      ]);
    },
    [anomalies, currentTick, entities.length, resources]
  );

  const abortExperiment = useCallback(() => {
    if (!activeExperiment) return;
    sound.playAlert();
    setActiveExperiment((prev) => (prev ? { ...prev, status: 'ABORTED' } : null));
    setEvents((prev) => [
      {
        id: `exp-abort-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'EXPERIMENT_ABORTED',
        severity: 'WARN',
        title: 'Experiment Aborted Manually',
        description: 'Directorate terminated active stress trial before scheduled completion.',
      },
      ...prev,
    ]);
    setActiveExperiment(null);
  }, [activeExperiment, currentTick]);

  // Matrix IO
  const exportRealityMatrix = useCallback(async () => {
    sound.playBlip(950);
    const dump = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tick: currentTick,
      config,
      zones,
      resources,
      entities,
      anomalies,
      entanglementLinks,
      factions,
      timelineBranches,
      researchNodes,
      archiveRecords,
    };
    const content = JSON.stringify(dump, null, 2);

    if (
      typeof window !== 'undefined' &&
      (window as unknown as { eidolonDesktop?: {
        exportData: (name: string, content: string) => Promise<{ success: boolean; filePath?: string }>;
      }}).eidolonDesktop
    ) {
      await (window as unknown as { eidolonDesktop: {
        exportData: (name: string, content: string) => Promise<{ success: boolean; filePath?: string }>;
      }}).eidolonDesktop.exportData(`eidolon_${config.name}_tick${currentTick}.json`, content);
    } else {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eidolon_${config.name}_tick${currentTick}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [anomalies, archiveRecords, config, currentTick, entities, entanglementLinks, factions, researchNodes, resources, timelineBranches, zones]);

  const importRealityMatrix = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.config) setConfig(data.config);
      if (data.zones) setZones(data.zones);
      if (data.resources) setResources(data.resources);
      if (data.entities) setEntities(data.entities);
      if (data.anomalies) setAnomalies(data.anomalies);
      if (data.entanglementLinks) setEntanglementLinks(data.entanglementLinks);
      if (data.factions) setFactions(data.factions);
      if (data.timelineBranches) setTimelineBranches(data.timelineBranches);
      if (data.researchNodes) setResearchNodes(data.researchNodes);
      if (data.tick !== undefined) setCurrentTick(data.tick);
      sound.playSuccess();
    } catch {
      sound.playAlert();
    }
  }, []);

  const resetReality = useCallback((newConfig?: Partial<WorldConfig>) => {
    sound.playScan();
    const finalConfig: WorldConfig = {
      ...config,
      seed: Math.floor(Math.random() * 900000) + 100000,
      ...newConfig,
    };
    setConfig(finalConfig);
    prngRef.current = new SeededPRNG(finalConfig.seed);
    entityEngineRef.current = new EntityEngine(prngRef.current);
    anomalyEngineRef.current = new AnomalyEngine(prngRef.current);
    entanglementEngineRef.current = new EntanglementEngine(prngRef.current);
    factionEngineRef.current = new FactionEngine(prngRef.current);

    const fresh = WorldGenerator.generate(finalConfig);
    setZones(fresh.zones);
    setResources(fresh.resources);
    setEntities(fresh.entities);
    setAnomalies(fresh.anomalies);
    setEvents(fresh.events);
    setEntanglementLinks(entanglementEngineRef.current.createInitialPairs(fresh.entities));
    setFactions(INITIAL_FACTIONS);
    setActiveStorm(null);

    setCurrentTick(0);
    setTelemetryHistory([
      {
        tick: 0,
        coherence: fresh.resources.coherence,
        energy: fresh.resources.energy,
        entropy: fresh.resources.entropy,
        substrate: fresh.resources.substrate,
        resonance: fresh.resources.resonance,
        activeEntities: fresh.entities.length,
        activeAnomalies: fresh.anomalies.filter((a) => a.status !== 'CONTAINED').length,
        tickDurationMs: 16,
      },
    ]);
    setSelectedEntityId(fresh.entities[0]?.id || null);
    setSelectedAnomalyId(fresh.anomalies[0]?.id || null);
    setSelectedZoneId(fresh.zones[0]?.id || null);
  }, [config]);

  const togglePause = useCallback(() => {
    sound.playBlip(550);
    setIsPaused((prev) => !prev);
  }, []);

  const stepSimulation = useCallback(() => {
    sound.playBlip(780);
    tickOnce();
  }, [tickOnce]);

  return (
    <SimulationContext.Provider
      value={{
        config,
        zones,
        resources,
        entities,
        anomalies,
        events,
        telemetryHistory,
        timelineBranches,
        currentBranchId,
        snapshots,
        researchNodes,
        experiments,
        activeExperiment,
        archiveRecords,

        entanglementLinks,
        factions,
        activeStorm,

        currentTick,
        isPaused,
        simulationSpeed,
        activeWorkspace,
        selectedEntityId,
        selectedAnomalyId,
        selectedZoneId,
        isConsoleOpen,
        isMuted,
        isAmbientActive,

        togglePause,
        stepSimulation,
        setSimulationSpeed: changeSpeed,
        setActiveWorkspace,
        setSelectedEntityId,
        setSelectedAnomalyId,
        setSelectedZoneId,
        setIsConsoleOpen,
        toggleMute,
        toggleAmbientDrone,

        stabilizeField,
        purgeEntropy,
        overclockEntities,
        chronoRewindPulse,
        spawnManualAnomaly,
        triggerChronalStorm,
        forgeEntanglement,

        testHypothesis,
        deployContainmentProtocol,

        createBranch,
        switchBranch,
        captureSnapshot,
        restoreSnapshot,

        unlockResearch,
        queueExperiment,
        abortExperiment,

        exportRealityMatrix,
        importRealityMatrix,
        resetReality,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider');
  return ctx;
};
