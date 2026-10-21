import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';

export const SettingsView: React.FC = () => {
  const {
    config,
    resetReality,
    exportRealityMatrix,
    importRealityMatrix,
    currentTick,
    entities,
    anomalies,
    zones,
    timelineBranches,
  } = useSimulation();

  const [customSeed, setCustomSeed] = useState<string>(config.seed.toString());
  const [selectedRuleset, setSelectedRuleset] = useState<
    'standard' | 'quantum-decay' | 'hyper-resonance' | 'entropic-collapse'
  >(config.ruleset);
  const [fileImportError, setFileImportError] = useState<string | null>(null);

  const handleApplySeed = (e: React.FormEvent) => {
    e.preventDefault();
    const seedNum = parseInt(customSeed, 10);
    if (isNaN(seedNum)) return;
    resetReality({ seed: seedNum, ruleset: selectedRuleset });
  };

  const handleRandomizeSeed = () => {
    const random = Math.floor(Math.random() * 900000) + 100000;
    setCustomSeed(random.toString());
    resetReality({ seed: random, ruleset: selectedRuleset });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        importRealityMatrix(text);
        setFileImportError(null);
      } catch (err) {
        setFileImportError('Failed to parse reality matrix JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={20} color="var(--color-cyan)" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#fff',
            }}
          >
            SYSTEM SETTINGS & REALITY DIAGNOSTICS
          </h1>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
          Configure PRNG seeds, toggle quantum physics rulesets, and manage reality matrix persistence.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Seed & Generation Config */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
            DETERMINISTIC PRNG SEED GENERATOR
          </div>

          <form onSubmit={handleApplySeed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                CURRENT MULBERRY32 SEED
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                />
                <button
                  type="button"
                  onClick={handleRandomizeSeed}
                  className="btn-tech"
                  style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                >
                  <RefreshCw size={13} />
                  <span>RANDOMIZE</span>
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                REALITY PHYSICS RULESET
              </label>
              <select
                value={selectedRuleset}
                onChange={(e) => setSelectedRuleset(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="standard">Standard Directorate Ruleset</option>
                <option value="quantum-decay">Quantum Decay (Accelerated Entropy)</option>
                <option value="hyper-resonance">Hyper Resonance (High Coherence & Crystals)</option>
                <option value="entropic-collapse">Entropic Collapse (Extreme Anomaly Strain)</option>
              </select>
            </div>

            <button type="submit" className="btn-tech btn-tech-primary" style={{ padding: '0.65rem' }}>
              REINITIALIZE REALITY MATRIX
            </button>
          </form>
        </div>

        {/* Matrix Persistence IO */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
            REALITY MATRIX EXPORT / IMPORT (PERSISTENCE)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Export the complete phase-space state of the simulation including all entities, anomalies, timeline branches, and research progression.
            </p>

            <button onClick={exportRealityMatrix} className="btn-tech" style={{ padding: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={15} color="var(--color-cyan)" />
              <span>EXPORT REALITY MATRIX (.JSON)</span>
            </button>

            <label
              className="btn-tech"
              style={{
                padding: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={15} color="var(--color-purple)" />
              <span>IMPORT REALITY MATRIX (.JSON)</span>
              <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {fileImportError && (
              <div style={{ color: 'var(--color-rose)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                {fileImportError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Diagnostics Card */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
          SYSTEM DIAGNOSTICS & TELEMETRY SUMMARY
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ELAPSED TICKS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
              {currentTick}
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ACTIVE AGENTS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-cyan)' }}>
              {entities.length}
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ANOMALIES IN SPACE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-rose)' }}>
              {anomalies.length}
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>TIMELINE BRANCHES</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-purple)' }}>
              {timelineBranches.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
