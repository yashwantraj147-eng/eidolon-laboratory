/**
 * Deterministic Seeded Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% reproducible world generation and deterministic simulation runs.
 */
export class SeededPRNG {
  private initialSeed: number;
  private currentSeed: number;

  constructor(seed: number = 133742) {
    this.initialSeed = Math.floor(Math.abs(seed)) || 1;
    this.currentSeed = this.initialSeed;
  }

  public reset(): void {
    this.currentSeed = this.initialSeed;
  }

  public setSeed(seed: number): void {
    this.initialSeed = Math.floor(Math.abs(seed)) || 1;
    this.currentSeed = this.initialSeed;
  }

  public getSeed(): number {
    return this.initialSeed;
  }

  public getState(): number {
    return this.currentSeed;
  }

  public setState(state: number): void {
    this.currentSeed = state;
  }

  /**
   * Generates a floating point number in [0, 1)
   */
  public nextFloat(): number {
    let t = (this.currentSeed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in range [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    const f = this.nextFloat();
    return Math.floor(f * (max - min + 1)) + min;
  }

  /**
   * Generates a float in range [min, max]
   */
  public nextRange(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  /**
   * Picks a random element from an array deterministically
   */
  public pick<T>(items: T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    const idx = this.nextInt(0, items.length - 1);
    return items[idx];
  }

  /**
   * Shuffles an array in place deterministically (Fisher-Yates)
   */
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Boolean chance (probability between 0.0 and 1.0)
   */
  public chance(probability: number): boolean {
    return this.nextFloat() < probability;
  }
}
