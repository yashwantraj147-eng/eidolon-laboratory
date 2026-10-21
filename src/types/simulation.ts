export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type AnomalyClass =
  | 'TEMPORAL_DILATION'
  | 'SPATIAL_TEAR'
  | 'CAUSAL_CASCADE'
  | 'INFORMATION_CORRUPTION'
  | 'ENTROPIC_VORTEX'
  | 'ZERO_POINT_SPIKE';

export type AnomalySeverity = 'LOW' | 'MODERATE' | 'SEVERE' | 'CRITICAL' | 'REALITY_BREACH';

export type AnomalyStatus =
  | 'UNCONTAINED'
  | 'UNDER_ANALYSIS'
  | 'STABILIZING'
  | 'CONTAINED'
  | 'COLLAPSED';

export type ContainmentProtocolType =
  | 'HARMONIC_DAMPENING'
  | 'SUBSTRATE_ISOLATION'
  | 'TEMPORAL_INVERSION'
  | 'QUANTUM_PINNING';

export interface AnomalyHypothesis {
  id: string;
  label: string;
  confidence: number;
  tested: boolean;
  validated: boolean;
}

export interface Anomaly {
  id: string;
  designation: string;
  name: string;
  classification: AnomalyClass;
  severity: AnomalySeverity;
  location: Vector3D;
  radius: number;
  discoveryTick: number;
  status: AnomalyStatus;
  symptoms: string[];
  hypotheses: AnomalyHypothesis[];
  activeHypothesisId?: string;
  containmentProgress: number; // 0 - 100
  energyEmission: number;
  resonanceModulation: number;
  containmentProcedure: {
    requiredEnergy: number;
    requiredResonance: number;
    protocolType: ContainmentProtocolType;
  };
}

export type EntityArchetype =
  | 'probe'
  | 'synthet'
  | 'harvester'
  | 'archivist'
  | 'chronomancer'
  | 'anomaly-warden';

export type EntityCondition = 'optimal' | 'strained' | 'critical' | 'dormant' | 'transcendent';

export type EntityGoal =
  | 'HARVEST_SUBSTRATE'
  | 'STABILIZE_RESONANCE'
  | 'SURVEY_ANOMALY'
  | 'CONFER_WITH_PEERS'
  | 'RECHARGE'
  | 'PATROL_PERIMETER'
  | 'CHRONO_REPAIR';

export interface EntityMemory {
  tick: number;
  event: string;
  impact: number;
}

export interface Entity {
  id: string;
  name: string;
  archetype: EntityArchetype;
  position: Vector3D;
  velocity: Vector3D;
  targetPosition?: Vector3D;
  operationalCondition: EntityCondition;
  health: number; // 0 - 100
  energy: number; // 0 - 100
  currentGoal: EntityGoal;
  utilityScores: Record<string, number>;
  affiliation: string;
  inventory: {
    substrate: number;
    resonanceCrystals: number;
    chronalDust: number;
  };
  memories: EntityMemory[];
  totalDistanceTraveled: number;
  discoveriesCount: number;
}

export interface WorldZone {
  id: string;
  name: string;
  type: 'CORE_CHAMBER' | 'RESONANCE_FIELD' | 'ENTROPY_ABYSS' | 'SUBSTRATE_QUARRY' | 'NEXUS_FORGE';
  center: Vector3D;
  radius: number;
  resourceDensity: number;
  hazardLevel: number;
  color: string;
}

export interface ResourcePool {
  energy: number;
  maxEnergy: number;
  substrate: number;
  maxSubstrate: number;
  resonance: number;
  maxResonance: number;
  entropy: number;
  coherence: number; // Reality Stability Index 0.00 - 100.00%
  insightPoints: number; // Research currency
}

export type EventSeverity = 'INFO' | 'WARN' | 'CRITICAL' | 'ANOMALY' | 'SUCCESS';

export interface SimulationEvent {
  id: string;
  tick: number;
  timestamp: number;
  type: string;
  severity: EventSeverity;
  title: string;
  description: string;
  affectedEntityIds?: string[];
  affectedLocation?: Vector3D;
  causalParentId?: string;
}

export interface WorldConfig {
  id: string;
  name: string;
  seed: number;
  complexity: number; // 1 to 5
  initialEntropy: number;
  resonanceIndex: number;
  substrateCapacity: number;
  energyBaseline: number;
  anomalyFrequency: number;
  ruleset: 'standard' | 'quantum-decay' | 'hyper-resonance' | 'entropic-collapse';
}

export interface TelemetryPoint {
  tick: number;
  coherence: number;
  energy: number;
  entropy: number;
  substrate: number;
  resonance: number;
  activeEntities: number;
  activeAnomalies: number;
  tickDurationMs: number;
}

export interface TimelineBranch {
  id: string;
  parentBranchId?: string;
  name: string;
  createdTick: number;
  forkDescription: string;
  active: boolean;
  color: string;
  metricsHistory: Array<{
    tick: number;
    coherence: number;
    energy: number;
    entropy: number;
    activeEntities: number;
    activeAnomalies: number;
  }>;
}

export interface RealitySnapshot {
  id: string;
  label: string;
  tick: number;
  timestamp: number;
  branchId: string;
  stateDump: string; // JSON serialized state
}

export interface ResearchNode {
  id: string;
  title: string;
  category: 'DETECTION' | 'CONTAINMENT' | 'TEMPORAL' | 'COMPUTATION' | 'SYNTHESIS';
  cost: number;
  unlocked: boolean;
  prerequisites: string[];
  description: string;
  mechanicalBenefit: string;
  iconName: string;
}

export interface Experiment {
  id: string;
  title: string;
  targetBranchId: string;
  durationTicks: number;
  variables: {
    energyFlux: number;
    entropyInjection: number;
    resonanceDamping: number;
    containmentAssist: boolean;
  };
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'ABORTED';
  startTick: number;
  endTick?: number;
  telemetryRecords: TelemetryPoint[];
  outcomeSummary?: string;
  successScore?: number;
}

export interface ArchiveRecord {
  id: string;
  title: string;
  category: 'ANOMALY' | 'EXPERIMENT' | 'MILESTONE' | 'SECRET' | 'ARTIFACT';
  discoveredAtTick: number;
  realDate: string;
  classificationCode: string;
  summary: string;
  details: string;
  hidden: boolean;
  unlockCondition?: string;
  tags: string[];
}

export interface EntanglementLink {
  id: string;
  entityAId: string;
  entityBId: string;
  coherenceBonus: number;
  resonanceHarmonics: number;
  color: string;
}

export type DiplomaticStance = 'ALLIED' | 'NEUTRAL' | 'COLD_CONFLICT' | 'TRANSCENDENT_PACT';

export interface FactionState {
  name: string;
  motto: string;
  color: string;
  influenceScore: number;
  controlledZoneId?: string;
  territoryPercent: number; // 0 - 100
  stanceWithDirectorate: DiplomaticStance;
  synthesizedAgentsCount: number;
}

export interface ChronalStorm {
  id: string;
  name: string;
  center: Vector3D;
  radius: number;
  intensity: number; // 1 to 5
  remainingTicks: number;
  color: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  tagline: string;
  description: string;
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'OMEGA';
  variables: Experiment['variables'];
  durationTicks: number;
  rewardInsight: number;
}

