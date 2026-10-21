import { describe, it, expect } from 'vitest';
import { SeededPRNG } from './prng';
import { WorldGenerator } from './worldGen';
import { EntityEngine } from './entityEngine';
import { AnomalyEngine } from './anomalyEngine';
import { EntanglementEngine } from './entanglementEngine';
import { FactionEngine, INITIAL_FACTIONS } from './factionEngine';
import { WorldConfig } from '../types/simulation';

describe('SeededPRNG', () => {
  it('generates deterministic sequences from identical seeds', () => {
    const prng1 = new SeededPRNG(424242);
    const prng2 = new SeededPRNG(424242);

    for (let i = 0; i < 20; i++) {
      expect(prng1.nextFloat()).toBe(prng2.nextFloat());
    }
  });

  it('generates integers within specified bounds', () => {
    const prng = new SeededPRNG(999);
    for (let i = 0; i < 50; i++) {
      const val = prng.nextInt(5, 15);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(15);
    }
  });
});

describe('WorldGenerator', () => {
  const config: WorldConfig = {
    id: 'test-world',
    name: 'Genesis-Test',
    seed: 12345,
    complexity: 3,
    initialEntropy: 20,
    resonanceIndex: 4,
    substrateCapacity: 1000,
    energyBaseline: 1200,
    anomalyFrequency: 2,
    ruleset: 'standard',
  };

  it('generates complete world dataset', () => {
    const world = WorldGenerator.generate(config);
    expect(world.zones.length).toBeGreaterThanOrEqual(4);
    expect(world.entities.length).toBeGreaterThanOrEqual(10);
    expect(world.anomalies.length).toBeGreaterThanOrEqual(2);
    expect(world.resources.energy).toBeGreaterThan(0);
    expect(world.resources.coherence).toBeGreaterThanOrEqual(50);
  });
});

describe('EntityEngine', () => {
  it('updates entity positions and executes goals', () => {
    const prng = new SeededPRNG(777);
    const engine = new EntityEngine(prng);
    const config: WorldConfig = {
      id: 'test-world',
      name: 'Genesis-Test',
      seed: 777,
      complexity: 2,
      initialEntropy: 10,
      resonanceIndex: 3,
      substrateCapacity: 1000,
      energyBaseline: 1000,
      anomalyFrequency: 1,
      ruleset: 'standard',
    };
    const world = WorldGenerator.generate(config);

    const result = engine.updateEntities(
      world.entities,
      world.zones,
      world.anomalies,
      world.resources,
      1
    );

    expect(result.updatedEntities.length).toBe(world.entities.length);
    expect(result.updatedEntities[0].totalDistanceTraveled).toBeGreaterThan(0);
  });
});

describe('AnomalyEngine', () => {
  it('correctly handles hypothesis validation and protocol deployment', () => {
    const prng = new SeededPRNG(555);
    const engine = new AnomalyEngine(prng);
    const config: WorldConfig = {
      id: 'test-world',
      name: 'Genesis-Test',
      seed: 555,
      complexity: 2,
      initialEntropy: 10,
      resonanceIndex: 3,
      substrateCapacity: 1000,
      energyBaseline: 1000,
      anomalyFrequency: 1,
      ruleset: 'standard',
    };
    const world = WorldGenerator.generate(config);
    const anomaly = world.anomalies[0];

    const hypResult = engine.testHypothesis(anomaly, anomaly.hypotheses[0].id, 1);
    expect(hypResult.updatedAnomaly.hypotheses[0].tested).toBe(true);

    const protoResult = engine.deployProtocol(
      anomaly,
      anomaly.containmentProcedure.protocolType,
      anomaly.containmentProcedure.requiredEnergy,
      anomaly.containmentProcedure.requiredResonance,
      1
    );
    expect(protoResult.success).toBe(true);
    expect(protoResult.updatedAnomaly.status).toBe('STABILIZING');
  });
});

describe('EntanglementEngine', () => {
  it('forges quantum pairs and computes resonance synchronicity', () => {
    const prng = new SeededPRNG(1234);
    const engine = new EntanglementEngine(prng);
    const config: WorldConfig = {
      id: 'test-world',
      name: 'Genesis-Test',
      seed: 1234,
      complexity: 2,
      initialEntropy: 10,
      resonanceIndex: 3,
      substrateCapacity: 1000,
      energyBaseline: 1000,
      anomalyFrequency: 1,
      ruleset: 'standard',
    };
    const world = WorldGenerator.generate(config);

    const initialPairs = engine.createInitialPairs(world.entities);
    expect(initialPairs.length).toBeGreaterThan(0);

    const update = engine.updateEntanglements(initialPairs, world.entities);
    expect(update.updatedLinks.length).toBe(initialPairs.length);
    expect(update.resonanceDelta).toBeGreaterThan(0);
  });
});

describe('FactionEngine', () => {
  it('calculates territorial dominance and influence scores', () => {
    const prng = new SeededPRNG(4321);
    const engine = new FactionEngine(prng);
    const config: WorldConfig = {
      id: 'test-world',
      name: 'Genesis-Test',
      seed: 4321,
      complexity: 2,
      initialEntropy: 10,
      resonanceIndex: 3,
      substrateCapacity: 1000,
      energyBaseline: 1000,
      anomalyFrequency: 1,
      ruleset: 'standard',
    };
    const world = WorldGenerator.generate(config);
    const updated = engine.updateFactions(INITIAL_FACTIONS, world.entities, world.zones);
    expect(updated.length).toBe(4);
    expect(updated[0].influenceScore).toBeGreaterThan(0);
  });
});

