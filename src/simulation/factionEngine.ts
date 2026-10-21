import { FactionState, WorldZone, Entity, DiplomaticStance } from '../types/simulation';
import { SeededPRNG } from './prng';

export const INITIAL_FACTIONS: FactionState[] = [
  {
    name: 'Directorate Core',
    motto: 'Order Through Metric Preservation',
    color: '#00f0ff',
    influenceScore: 42,
    controlledZoneId: 'zone-core',
    territoryPercent: 35,
    stanceWithDirectorate: 'ALLIED',
    synthesizedAgentsCount: 5,
  },
  {
    name: 'Vector Collective',
    motto: 'Autonomous Velocity and Boundless Expansion',
    color: '#a855f7',
    influenceScore: 28,
    controlledZoneId: 'zone-resonance',
    territoryPercent: 25,
    stanceWithDirectorate: 'NEUTRAL',
    synthesizedAgentsCount: 4,
  },
  {
    name: 'Obsidian Synod',
    motto: 'Embrace the Void; Transcend the Observers',
    color: '#ef4444',
    influenceScore: 18,
    controlledZoneId: 'zone-entropy',
    territoryPercent: 20,
    stanceWithDirectorate: 'COLD_CONFLICT',
    synthesizedAgentsCount: 3,
  },
  {
    name: 'Independent Vanguard',
    motto: 'Substrate Sovereignty & Free Exploration',
    color: '#10b981',
    influenceScore: 22,
    controlledZoneId: 'zone-substrate',
    territoryPercent: 20,
    stanceWithDirectorate: 'NEUTRAL',
    synthesizedAgentsCount: 4,
  },
];

export class FactionEngine {
  private prng: SeededPRNG;

  constructor(prng: SeededPRNG) {
    this.prng = prng;
  }

  /**
   * Recalculates territorial dominance and influence scores based on entity activities in zones
   */
  public updateFactions(
    factions: FactionState[],
    entities: Entity[],
    zones: WorldZone[]
  ): FactionState[] {
    const totalEntities = Math.max(1, entities.length);

    return factions.map((faction) => {
      const f = { ...faction };
      const affiliatedEntities = entities.filter((e) => e.affiliation === f.name);
      f.synthesizedAgentsCount = affiliatedEntities.length;

      // Calculate total substrate gathered by faction agents
      const totalSubstrate = affiliatedEntities.reduce((sum, e) => sum + e.inventory.substrate, 0);

      // Presence in zones
      let maxZonePresence = 0;
      let dominantZoneId = f.controlledZoneId;

      zones.forEach((zone) => {
        let presenceCount = 0;
        affiliatedEntities.forEach((e) => {
          const dx = e.position.x - zone.center.x;
          const dz = e.position.z - zone.center.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= zone.radius * 1.2) {
            presenceCount++;
          }
        });

        if (presenceCount > maxZonePresence) {
          maxZonePresence = presenceCount;
          dominantZoneId = zone.id;
        }
      });

      f.controlledZoneId = dominantZoneId;

      // Influence score formula: entities count + gathered resources + random drift
      const baseInfluence = (affiliatedEntities.length / totalEntities) * 50 + (totalSubstrate * 0.15);
      f.influenceScore = Math.max(5, Math.min(100, Math.round(baseInfluence * 10) / 10));

      // Territory percentage estimate
      f.territoryPercent = Math.max(10, Math.min(60, Math.round((f.influenceScore / 100) * 80)));

      return f;
    });
  }

  /**
   * Intervenes diplomatically to alter Directorate stance with a faction
   */
  public negotiateStance(
    faction: FactionState,
    newStance: DiplomaticStance
  ): FactionState {
    return {
      ...faction,
      stanceWithDirectorate: newStance,
    };
  }
}
