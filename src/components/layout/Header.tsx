import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Camera,
  Terminal,
  Volume2,
  VolumeX,
  ShieldAlert,
  Zap,
  Activity,
  Boxes,
  Flame,
  Award,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';

export const Header: React.FC = () => {
  const {
    resources,
    currentTick,
    isPaused,
    simulationSpeed,
    isMuted,
    isAmbientActive,
    togglePause,
    stepSimulation,
    setSimulationSpeed,
    toggleMute,
    toggleAmbientDrone,
    setIsConsoleOpen,
    captureSnapshot,
    stabilizeField,
    purgeEntropy,
    overclockEntities,
    chronoRewindPulse,
    config,
  } = useSimulation();

  // Coherence status color
  const coherenceColor =
    resources.coherence > 75
      ? 'var(--color-cyan)'
      : resources.coherence > 45
      ? 'var(--color-amber)'
      : 'var(--color-rose)';

  const isCoherenceCritical = resources.coherence < 45;

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'rgba(5, 10, 20, 0.95)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 50,
      }}
    >
      {/* Brand & Tick */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isPaused ? 'var(--color-amber)' : 'var(--color-cyan)',
              boxShadow: isPaused
                ? '0 0 8px var(--color-amber)'
                : '0 0 10px var(--color-cyan)',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '0.1em',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              EIDOLON
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-cyan)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                }}
              >
                PROD-v1.0
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: '#94a3b8',
              }}
            >
              {config.name} // SEED #{config.seed}
            </div>
          </div>
        </div>

        {/* Tick Counter */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            padding: '4px 10px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span style={{ color: '#64748b' }}>TICK</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>
            {currentTick.toString().padStart(6, '0')}
          </span>
        </div>

        {/* Coherence / Reality Stability Gauge */}
        <div
          className={isCoherenceCritical ? 'animate-alert-pulse' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '4px 12px',
            backgroundColor: isCoherenceCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 240, 255, 0.06)',
            border: `1px solid ${isCoherenceCritical ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 240, 255, 0.2)'}`,
            borderRadius: '4px',
          }}
        >
          <Activity size={14} color={coherenceColor} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                COHERENCE
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: coherenceColor,
                }}
              >
                {resources.coherence.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                width: '70px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '2px',
              }}
            >
              <div
                style={{
                  width: `${resources.coherence}%`,
                  height: '100%',
                  backgroundColor: coherenceColor,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Meters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Energy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <Zap size={13} color="var(--color-cyan)" />
          <span style={{ color: '#94a3b8' }}>ENRG:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{resources.energy}</span>
        </div>

        {/* Substrate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <Boxes size={13} color="var(--color-emerald)" />
          <span style={{ color: '#94a3b8' }}>SUB:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{resources.substrate}</span>
        </div>

        {/* Resonance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <Activity size={13} color="var(--color-purple)" />
          <span style={{ color: '#94a3b8' }}>RES:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{resources.resonance}</span>
        </div>

        {/* Entropy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <Flame size={13} color="var(--color-rose)" />
          <span style={{ color: '#94a3b8' }}>ENTR:</span>
          <span style={{ color: resources.entropy > 60 ? 'var(--color-rose)' : '#fff', fontWeight: 600 }}>
            {resources.entropy.toFixed(1)}
          </span>
        </div>

        {/* Insight Points */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '4px',
          }}
        >
          <Award size={13} color="var(--color-purple)" />
          <span style={{ color: '#c084fc', fontWeight: 700 }}>{resources.insightPoints}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>INSIGHT</span>
        </div>
      </div>

      {/* Clock Controls & Interventions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Play/Pause */}
        <button
          onClick={togglePause}
          className="btn-tech"
          style={{
            padding: '5px 10px',
            backgroundColor: isPaused ? 'rgba(0, 240, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            borderColor: isPaused ? 'var(--color-cyan)' : 'var(--color-rose)',
          }}
          title="Play / Pause Simulation (Space)"
        >
          {isPaused ? <Play size={13} color="var(--color-cyan)" /> : <Pause size={13} color="var(--color-rose)" />}
          <span style={{ fontSize: '0.75rem' }}>{isPaused ? 'RESUME' : 'HALT'}</span>
        </button>

        {/* Step Forward */}
        <button
          onClick={stepSimulation}
          className="btn-tech"
          style={{ padding: '5px 8px' }}
          title="Step Single Tick (Ctrl+Right)"
        >
          <SkipForward size={13} />
        </button>

        {/* Speed Multipliers */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSimulationSpeed(s)}
              style={{
                background: simulationSpeed === s ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                color: simulationSpeed === s ? '#00f0ff' : '#94a3b8',
                border: 'none',
                padding: '4px 7px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Quick Interventions Menu */}
        <button
          onClick={stabilizeField}
          className="btn-tech"
          style={{ padding: '5px 8px', fontSize: '0.72rem', color: 'var(--color-cyan)' }}
          title="Stabilize Field (-40 Enrg, +16 Coherence)"
        >
          <ShieldAlert size={13} />
          <span>STABILIZE</span>
        </button>

        <button
          onClick={purgeEntropy}
          className="btn-tech"
          style={{ padding: '5px 8px', fontSize: '0.72rem', color: 'var(--color-rose)' }}
          title="Purge Entropy (-50 Enrg, -25 Entropy)"
        >
          <Flame size={13} />
          <span>PURGE</span>
        </button>

        {/* Snapshot */}
        <button
          onClick={() => captureSnapshot(`Manual Snap @ Tick ${currentTick}`)}
          className="btn-tech"
          style={{ padding: '5px 8px' }}
          title="Capture Reality Snapshot (Ctrl+S)"
        >
          <Camera size={13} />
        </button>

        {/* Command Console */}
        <button
          onClick={() => setIsConsoleOpen(true)}
          className="btn-tech"
          style={{ padding: '5px 8px', borderColor: 'rgba(0, 240, 255, 0.4)' }}
          title="Open Command Console (Ctrl+K)"
        >
          <Terminal size={13} color="var(--color-cyan)" />
        </button>

        {/* Ambient Sci-Fi Drone Toggle */}
        <button
          onClick={toggleAmbientDrone}
          className="btn-tech"
          style={{
            padding: '5px 8px',
            backgroundColor: isAmbientActive ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            borderColor: isAmbientActive ? 'var(--color-purple)' : 'rgba(255, 255, 255, 0.12)',
            color: isAmbientActive ? '#c084fc' : '#94a3b8',
          }}
          title={isAmbientActive ? 'Mute Ambient Synthesizer Drone' : 'Engage Generative Ambient Sci-Fi Drone'}
        >
          <Activity size={13} color={isAmbientActive ? '#c084fc' : '#64748b'} />
          <span style={{ fontSize: '0.68rem' }}>DRONE</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="btn-tech"
          style={{ padding: '5px 8px' }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={13} color="#64748b" /> : <Volume2 size={13} color="var(--color-cyan)" />}
        </button>
      </div>
    </header>
  );
};
