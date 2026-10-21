import { Anomaly, ResourcePool, SimulationEvent, ContainmentProtocolType } from '../types/simulation';
import { SeededPRNG } from './prng';

export class AnomalyEngine {
  private prng: SeededPRNG;

  constructor(prng: SeededPRNG) {
    this.prng = prng;
  }

  /**
   * Ticks all anomalies, computing radiation leak, containment advancement, and breach risk.
   */
  public updateAnomalies(
    anomalies: Anomaly[],
    resources: ResourcePool,
    currentTick: number,
    containmentBoostMultiplier: number = 1.0
  ): {
    updatedAnomalies: Anomaly[];
    energyDrain: number;
    resonanceDrain: number;
    entropyLeak: number;
    coherenceImpact: number;
    newEvents: SimulationEvent[];
  } {
    let energyDrain = 0;
    let resonanceDrain = 0;
    let entropyLeak = 0;
    let coherenceImpact = 0;
    const newEvents: SimulationEvent[] = [];

    const updatedAnomalies = anomalies.map((anomaly) => {
      const a = { ...anomaly };

      if (a.status === 'COLLAPSED') {
        return a;
      }

      if (a.status === 'CONTAINED') {
        // Contained anomalies emit minimal manageable resonance
        resonanceDrain -= 0.1;
        return a;
      }

      if (a.status === 'STABILIZING') {
        // Active containment beam in progress
        const boost = 1.5 * containmentBoostMultiplier;
        a.containmentProgress = Math.min(100, a.containmentProgress + boost);

        energyDrain += 1.8;
        resonanceDrain += 0.8;

        if (a.containmentProgress >= 100) {
          a.status = 'CONTAINED';
          newEvents.push({
            id: `event-${Date.now()}-${this.prng.nextInt(100, 999)}`,
            tick: currentTick,
            timestamp: Date.now(),
            type: 'ANOMALY_CONTAINED',
            severity: 'SUCCESS',
            title: `Containment Achieved: ${a.designation}`,
            description: `Field distortion stabilized through protocol ${a.containmentProcedure.protocolType}. Reality local metric restored.`,
            affectedLocation: a.location,
          });
        }
        return a;
      }

      // Uncontained or under analysis
      // Emit entropy & drain coherence
      const severityMultiplier =
        a.severity === 'CRITICAL' ? 3.0 : a.severity === 'SEVERE' ? 2.0 : a.severity === 'MODERATE' ? 1.2 : 0.6;

      entropyLeak += 0.18 * severityMultiplier;
      coherenceImpact += 0.08 * severityMultiplier;

      // Random flare-up / symptom expansion
      if (this.prng.chance(0.015)) {
        a.radius = Math.min(65, a.radius + this.prng.nextRange(1.5, 4.0));
        newEvents.push({
          id: `event-flare-${Date.now()}-${this.prng.nextInt(100, 999)}`,
          tick: currentTick,
          timestamp: Date.now(),
          type: 'ANOMALY_ESCALATION',
          severity: 'WARN',
          title: `Radiation Flare in ${a.designation}`,
          description: `Localized distortion perimeter expanded to ${a.radius.toFixed(1)}u. Radiation output surged.`,
          affectedLocation: a.location,
        });
      }

      return a;
    });

    return {
      updatedAnomalies,
      energyDrain,
      resonanceDrain,
      entropyLeak,
      coherenceImpact,
      newEvents,
    };
  }

  /**
   * Tests an anomaly hypothesis to uncover its fundamental nature
   */
  public testHypothesis(
    anomaly: Anomaly,
    hypothesisId: string,
    currentTick: number
  ): {
    updatedAnomaly: Anomaly;
    success: boolean;
    insightEarned: number;
    event?: SimulationEvent;
  } {
    const updated = { ...anomaly };
    const hyp = updated.hypotheses.find((h) => h.id === hypothesisId);
    if (!hyp) return { updatedAnomaly: anomaly, success: false, insightEarned: 0 };

    hyp.tested = true;
    const isCorrect = this.prng.chance(hyp.confidence);
    hyp.validated = isCorrect;

    const insightEarned = isCorrect ? 45 : 10;
    const event: SimulationEvent = {
      id: `hypo-test-${Date.now()}`,
      tick: currentTick,
      timestamp: Date.now(),
      type: 'HYPOTHESIS_TEST',
      severity: isCorrect ? 'SUCCESS' : 'INFO',
      title: isCorrect
        ? `Hypothesis Confirmed: ${hyp.label}`
        : `Hypothesis Refuted: ${hyp.label}`,
      description: isCorrect
        ? `Quantum analysis verified the theoretical model for ${anomaly.designation}. Protocol efficiency maximized.`
        : `Empirical sensors disproved the hypothesis for ${anomaly.designation}. Further telemetry needed.`,
      affectedLocation: anomaly.location,
    };

    return {
      updatedAnomaly: updated,
      success: isCorrect,
      insightEarned,
      event,
    };
  }

  /**
   * Deploys a containment protocol
   */
  public deployProtocol(
    anomaly: Anomaly,
    protocol: ContainmentProtocolType,
    allocatedEnergy: number,
    allocatedResonance: number,
    currentTick: number
  ): {
    updatedAnomaly: Anomaly;
    success: boolean;
    message: string;
    event?: SimulationEvent;
  } {
    const updated = { ...anomaly };
    const req = anomaly.containmentProcedure;

    const matchesProtocol = req.protocolType === protocol;
    const meetsEnergy = allocatedEnergy >= req.requiredEnergy;
    const meetsResonance = allocatedResonance >= req.requiredResonance;

    if (matchesProtocol && meetsEnergy && meetsResonance) {
      updated.status = 'STABILIZING';
      const event: SimulationEvent = {
        id: `protocol-deploy-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'CONTAINMENT_ENGAGED',
        severity: 'SUCCESS',
        title: `Containment Lattice Engaged: ${anomaly.designation}`,
        description: `Deployed ${protocol} with ${allocatedEnergy}MW energy and ${allocatedResonance}Hz resonance dampener. Harmonic stabilization in progress.`,
        affectedLocation: anomaly.location,
      };
      return {
        updatedAnomaly: updated,
        success: true,
        message: 'Harmonic dampening lattice successfully established.',
        event,
      };
    } else {
      let failReason = '';
      if (!matchesProtocol) failReason = `Incompatible protocol (${protocol} vs required ${req.protocolType}).`;
      else if (!meetsEnergy) failReason = `Insufficient energy injection (${allocatedEnergy} < ${req.requiredEnergy} MW).`;
      else failReason = `Insufficient resonance tuning (${allocatedResonance} < ${req.requiredResonance} Hz).`;

      const event: SimulationEvent = {
        id: `protocol-fail-${Date.now()}`,
        tick: currentTick,
        timestamp: Date.now(),
        type: 'CONTAINMENT_FAILED',
        severity: 'WARN',
        title: `Containment Failed: ${anomaly.designation}`,
        description: failReason,
        affectedLocation: anomaly.location,
      };

      return {
        updatedAnomaly: updated,
        success: false,
        message: failReason,
        event,
      };
    }
  }
}
