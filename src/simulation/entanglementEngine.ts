import { EntanglementLink, Entity } from '../types/simulation';
import { SeededPRNG } from './prng';

export class EntanglementEngine {
  private prng: SeededPRNG;

  constructor(prng: SeededPRNG) {
    this.prng = prng;
  }

  /**
   * Initializes initial quantum entanglement pairs among agents
   */
  public createInitialPairs(entities: Entity[]): EntanglementLink[] {
    const pairs: EntanglementLink[] = [];
    if (entities.length < 2) return pairs;

    const colors = ['#00f0ff', '#a855f7', '#ec4899', '#10b981'];

    // Entangle up to 3 pairs
    for (let i = 0; i < Math.min(3, Math.floor(entities.length / 2)); i++) {
      const eA = entities[i * 2];
      const eB = entities[i * 2 + 1];

      pairs.push({
        id: `entangle-${i + 1}`,
        entityAId: eA.id,
        entityBId: eB.id,
        coherenceBonus: 3.5,
        resonanceHarmonics: 12.0,
        color: colors[i % colors.length],
      });
    }

    return pairs;
  }

  /**
   * Updates entanglement states: transmits quantum state echoes between paired agents
   */
  public updateEntanglements(
    links: EntanglementLink[],
    entities: Entity[]
  ): {
    updatedLinks: EntanglementLink[];
    updatedEntities: Entity[];
    coherenceDelta: number;
    resonanceDelta: number;
  } {
    let coherenceDelta = 0;
    let resonanceDelta = 0;

    const entityMap = new Map<string, Entity>(entities.map((e) => [e.id, { ...e }]));

    const validLinks = links.filter((link) => {
      const a = entityMap.get(link.entityAId);
      const b = entityMap.get(link.entityBId);
      if (!a || !b) return false;

      // Distance check: if entities are within reasonable space, link is stable
      const dx = a.position.x - b.position.x;
      const dy = a.position.y - b.position.y;
      const dz = a.position.z - b.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Quantum harmonic synchronization
      coherenceDelta += link.coherenceBonus * 0.05;
      resonanceDelta += link.resonanceHarmonics * 0.02;

      // Echo effect: if one entity is low on energy but the other has surplus, quantum equalization occurs
      if (a.energy > 60 && b.energy < 30) {
        a.energy -= 0.5;
        b.energy += 0.5;
      } else if (b.energy > 60 && a.energy < 30) {
        b.energy -= 0.5;
        a.energy += 0.5;
      }

      // If one entity discovers something, the entangled twin gains discovery points
      if (a.discoveriesCount > b.discoveriesCount && this.prng.chance(0.02)) {
        b.discoveriesCount += 1;
      } else if (b.discoveriesCount > a.discoveriesCount && this.prng.chance(0.02)) {
        a.discoveriesCount += 1;
      }

      return true;
    });

    return {
      updatedLinks: validLinks,
      updatedEntities: Array.from(entityMap.values()),
      coherenceDelta,
      resonanceDelta,
    };
  }

  /**
   * Forges a new quantum entanglement bond between two selected entities
   */
  public forgeEntanglement(
    entityAId: string,
    entityBId: string,
    existingLinks: EntanglementLink[]
  ): { success: boolean; link?: EntanglementLink; message: string } {
    if (entityAId === entityBId) {
      return { success: false, message: 'Cannot entangle an entity with itself.' };
    }

    const alreadyLinked = existingLinks.some(
      (l) =>
        (l.entityAId === entityAId && l.entityBId === entityBId) ||
        (l.entityAId === entityBId && l.entityBId === entityAId)
    );
    if (alreadyLinked) {
      return { success: false, message: 'Entities are already quantum entangled.' };
    }

    const newLink: EntanglementLink = {
      id: `entangle-${Date.now()}`,
      entityAId,
      entityBId,
      coherenceBonus: 4.0,
      resonanceHarmonics: 15.0,
      color: '#00f0ff',
    };

    return { success: true, link: newLink, message: 'Quantum entanglement established.' };
  }
}
