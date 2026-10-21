import { Entity, WorldZone, Anomaly, ResourcePool, EntityGoal, EntityCondition } from '../types/simulation';
import { SeededPRNG } from './prng';

export class EntityEngine {
  private prng: SeededPRNG;

  constructor(prng: SeededPRNG) {
    this.prng = prng;
  }

  /**
   * Advances all autonomous entities by 1 discrete simulation tick
   */
  public updateEntities(
    entities: Entity[],
    zones: WorldZone[],
    anomalies: Anomaly[],
    resources: ResourcePool,
    currentTick: number
  ): {
    updatedEntities: Entity[];
    energyDelta: number;
    substrateDelta: number;
    resonanceDelta: number;
    entropyDelta: number;
    newMemories: Array<{ entityId: string; memory: string; impact: number }>;
  } {
    let energyDelta = 0;
    let substrateDelta = 0;
    let resonanceDelta = 0;
    let entropyDelta = 0;
    const newMemories: Array<{ entityId: string; memory: string; impact: number }> = [];

    const updatedEntities = entities.map((entity) => {
      const e = { ...entity, inventory: { ...entity.inventory } };

      // 1. Calculate Utility Scores based on internal state
      const needEnergy = (100 - e.energy) / 100;
      const needRepair = (100 - e.health) / 100;
      const substrateGreed = (100 - e.inventory.substrate) / 100;
      const uncontainedAnomalies = anomalies.filter((a) => a.status !== 'CONTAINED');

      const harvestUtility = 0.4 + substrateGreed * 0.5 + (e.archetype === 'harvester' ? 0.35 : 0);
      const surveyUtility = uncontainedAnomalies.length > 0 ? 0.3 + (e.archetype === 'probe' || e.archetype === 'anomaly-warden' ? 0.4 : 0.1) : 0.05;
      const stabilizeUtility = resources.coherence < 70 ? (100 - resources.coherence) / 100 * 0.7 : 0.2;
      const rechargeUtility = needEnergy > 0.6 ? needEnergy * 0.9 : 0.1;

      e.utilityScores = {
        harvest: Math.round(harvestUtility * 100) / 100,
        survey: Math.round(surveyUtility * 100) / 100,
        stabilize: Math.round(stabilizeUtility * 100) / 100,
        recharge: Math.round(rechargeUtility * 100) / 100,
      };

      // 2. Select Goal based on highest utility
      let chosenGoal: EntityGoal = e.currentGoal;
      if (rechargeUtility > 0.75) {
        chosenGoal = 'RECHARGE';
      } else if (needRepair > 0.6) {
        chosenGoal = 'CHRONO_REPAIR';
      } else if (surveyUtility > harvestUtility && surveyUtility > stabilizeUtility) {
        chosenGoal = 'SURVEY_ANOMALY';
      } else if (stabilizeUtility > harvestUtility) {
        chosenGoal = 'STABILIZE_RESONANCE';
      } else {
        chosenGoal = 'HARVEST_SUBSTRATE';
      }
      e.currentGoal = chosenGoal;

      // 3. Movement and Target selection
      let targetPos = e.targetPosition || { x: 0, y: 0, z: 0 };

      if (chosenGoal === 'SURVEY_ANOMALY' && uncontainedAnomalies.length > 0) {
        const closestAnomaly = uncontainedAnomalies[0];
        targetPos = closestAnomaly.location;
      } else if (chosenGoal === 'HARVEST_SUBSTRATE') {
        const subZone = zones.find((z) => z.type === 'SUBSTRATE_QUARRY') || zones[0];
        targetPos = subZone.center;
      } else if (chosenGoal === 'STABILIZE_RESONANCE') {
        const resZone = zones.find((z) => z.type === 'RESONANCE_FIELD') || zones[0];
        targetPos = resZone.center;
      } else if (chosenGoal === 'RECHARGE') {
        const coreZone = zones.find((z) => z.type === 'CORE_CHAMBER') || zones[0];
        targetPos = coreZone.center;
      }

      // Smooth steering toward targetPos with light wander jitter
      const dx = targetPos.x - e.position.x;
      const dy = targetPos.y - e.position.y;
      const dz = targetPos.z - e.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      const speed = e.operationalCondition === 'critical' ? 0.15 : 0.45;
      const vx = (dx / dist) * speed + this.prng.nextRange(-0.08, 0.08);
      const vy = (dy / dist) * (speed * 0.5) + this.prng.nextRange(-0.04, 0.04);
      const vz = (dz / dist) * speed + this.prng.nextRange(-0.08, 0.08);

      e.velocity = { x: vx, y: vy, z: vz };
      e.position = {
        x: e.position.x + vx,
        y: Math.max(-50, Math.min(50, e.position.y + vy)),
        z: e.position.z + vz,
      };
      e.totalDistanceTraveled += Math.sqrt(vx * vx + vy * vy + vz * vz);

      // 4. Action Execution
      if (dist < 20) {
        // Entity reached operational proximity
        if (chosenGoal === 'HARVEST_SUBSTRATE') {
          const harvested = this.prng.nextInt(1, 3);
          e.inventory.substrate += harvested;
          substrateDelta -= harvested * 0.5;
          e.energy = Math.max(0, e.energy - 0.8);
          entropyDelta += 0.05;

          if (this.prng.chance(0.04)) {
            const mem = `Excavated high-density substrate node (+${harvested}u)`;
            e.memories.unshift({ tick: currentTick, event: mem, impact: 0.3 });
            newMemories.push({ entityId: e.id, memory: mem, impact: 0.3 });
          }
        } else if (chosenGoal === 'STABILIZE_RESONANCE') {
          resonanceDelta += 0.8;
          entropyDelta -= 0.12;
          e.energy = Math.max(0, e.energy - 1.2);
          if (this.prng.chance(0.03)) {
            const mem = `Channeled harmonic dampening pulses through local manifold`;
            e.memories.unshift({ tick: currentTick, event: mem, impact: 0.4 });
            newMemories.push({ entityId: e.id, memory: mem, impact: 0.4 });
          }
        } else if (chosenGoal === 'SURVEY_ANOMALY' && uncontainedAnomalies.length > 0) {
          e.discoveriesCount += 1;
          e.energy = Math.max(0, e.energy - 1.5);
          entropyDelta += 0.15;
          if (this.prng.chance(0.05)) {
            const mem = `Probed radiation horizon of ${uncontainedAnomalies[0].designation}`;
            e.memories.unshift({ tick: currentTick, event: mem, impact: 0.6 });
            newMemories.push({ entityId: e.id, memory: mem, impact: 0.6 });
          }
        } else if (chosenGoal === 'RECHARGE') {
          e.energy = Math.min(100, e.energy + 6.0);
          energyDelta -= 1.0;
        } else if (chosenGoal === 'CHRONO_REPAIR') {
          e.health = Math.min(100, e.health + 4.0);
          e.inventory.chronalDust = Math.max(0, e.inventory.chronalDust - 1);
        }
      } else {
        // Cruising energy drain
        e.energy = Math.max(0, e.energy - 0.35);
      }

      // 5. Environmental hazard & operational condition update
      const distFromCenter = Math.sqrt(e.position.x * e.position.x + e.position.z * e.position.z);
      if (distFromCenter > 110) {
        // Boundary decay
        e.health = Math.max(0, e.health - 0.5);
      }

      let cond: EntityCondition = 'optimal';
      if (e.health < 25 || e.energy < 15) {
        cond = 'critical';
      } else if (e.health < 60 || e.energy < 40) {
        cond = 'strained';
      } else if (e.discoveriesCount > 15 && e.health > 85) {
        cond = 'transcendent';
      }
      e.operationalCondition = cond;

      // Limit memory stack
      if (e.memories.length > 12) {
        e.memories = e.memories.slice(0, 12);
      }

      return e;
    });

    return {
      updatedEntities,
      energyDelta,
      substrateDelta,
      resonanceDelta,
      entropyDelta,
      newMemories,
    };
  }
}
