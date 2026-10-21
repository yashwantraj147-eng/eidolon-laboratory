/**
 * Procedural Web Audio API sound synthesizer for EIDOLON Laboratory.
 * Generates rich sci-fi sound effects, reactive dissonance, and a continuous
 * generative dark-ambient drone without requiring any external audio files.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private masterGain: GainNode | null = null;

  // Generative Ambient Drone Nodes
  private ambientGain: GainNode | null = null;
  private oscBase: OscillatorNode | null = null;
  private oscFifth: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private filterDrone: BiquadFilterNode | null = null;
  private lfoDrone: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMasterVolume(vol: number): void {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime);
    }
  }

  /**
   * Starts or stops the generative procedural ambient sci-fi drone
   */
  public toggleAmbientDrone(): boolean {
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return false;

    if (this.isAmbientPlaying) {
      this.stopAmbientDrone();
      return false;
    } else {
      this.startAmbientDrone();
      return true;
    }
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }

  private startAmbientDrone(): void {
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain || this.isAmbientPlaying) return;

    try {
      const now = ctx.currentTime;

      // Ambient Master Gain
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, now + 3);

      // Lowpass resonant filter with slow LFO sweep
      this.filterDrone = ctx.createBiquadFilter();
      this.filterDrone.type = 'lowpass';
      this.filterDrone.frequency.setValueAtTime(220, now);
      this.filterDrone.Q.setValueAtTime(3.5, now);

      this.lfoDrone = ctx.createOscillator();
      this.lfoDrone.frequency.setValueAtTime(0.12, now); // 8-second slow cycle
      this.lfoGain = ctx.createGain();
      this.lfoGain.gain.setValueAtTime(140, now);

      this.lfoDrone.connect(this.lfoGain);
      this.lfoGain.connect(this.filterDrone.frequency);
      this.lfoDrone.start(now);

      // Sub Bass (55 Hz - A1)
      this.oscSub = ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(55, now);

      // Root Drone (110 Hz - A2)
      this.oscBase = ctx.createOscillator();
      this.oscBase.type = 'sawtooth';
      this.oscBase.frequency.setValueAtTime(110, now);

      // Resonant Perfect Fifth (164.81 Hz - E3)
      this.oscFifth = ctx.createOscillator();
      this.oscFifth.type = 'triangle';
      this.oscFifth.frequency.setValueAtTime(164.81, now);

      this.oscSub.connect(this.filterDrone);
      this.oscBase.connect(this.filterDrone);
      this.oscFifth.connect(this.filterDrone);

      this.filterDrone.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.oscSub.start(now);
      this.oscBase.start(now);
      this.oscFifth.start(now);

      this.isAmbientPlaying = true;
    } catch {
      // Audio context error ignore
    }
  }

  public stopAmbientDrone(): void {
    if (!this.ctx || !this.isAmbientPlaying) return;

    try {
      const now = this.ctx.currentTime;
      if (this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      }

      setTimeout(() => {
        try {
          this.oscSub?.stop();
          this.oscBase?.stop();
          this.oscFifth?.stop();
          this.lfoDrone?.stop();
          this.oscSub?.disconnect();
          this.oscBase?.disconnect();
          this.oscFifth?.disconnect();
          this.lfoDrone?.disconnect();
          this.ambientGain?.disconnect();
        } catch {}
        this.isAmbientPlaying = false;
      }, 1600);
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  /**
   * Dynamically modulates ambient filter frequency based on reality coherence (100% = clear, <45% = distorted)
   */
  public updateCoherenceDissonance(coherence: number): void {
    if (!this.ctx || !this.filterDrone || !this.isAmbientPlaying) return;
    try {
      const now = this.ctx.currentTime;
      // When coherence is high, drone is deep and warm; when coherence collapses, filter opens with high buzz
      const targetFreq = 120 + (100 - coherence) * 8.5;
      this.filterDrone.frequency.setTargetAtTime(targetFreq, now, 0.4);
    } catch {}
  }

  /**
   * Crisp UI interaction blip
   */
  public playBlip(freq = 880): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  /**
   * Anomaly or critical warning alarm
   */
  public playAlert(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.linearRampToValueAtTime(360, now + 0.28);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  /**
   * Sub-reality radar scan ping
   */
  public playScan(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  /**
   * Containment beam pulse
   */
  public playContainmentPulse(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  /**
   * Temporal branching chord
   */
  public playBranch(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const freqs = [330, 440, 554.37, 659.25]; // E major chord
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.12, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.05);
        osc.stop(now + 0.7 + i * 0.05);
      });
    } catch {}
  }

  /**
   * Success arpeggio (tech unlocked, containment verified)
   */
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch {}
  }

  /**
   * Quantum Entanglement Resonance Chime
   */
  public playEntanglementPing(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(1760, now); // A6
      osc2.frequency.setValueAtTime(1764, now); // Micro-detune beat frequency (4 Hz binaural pulse)

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch {}
  }

  /**
   * Warp Speed Transition Whine
   */
  public playWarpSweep(speed: number): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startF = 300;
      const endF = 300 + speed * 120;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(endF, now + 0.2);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /**
   * Chronal Radiation Storm Siren
   */
  public playStormSiren(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.4);
      osc.frequency.linearRampToValueAtTime(220, now + 0.8);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {}
  }
}

export const sound = new SoundEngine();
