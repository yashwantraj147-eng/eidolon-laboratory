import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sliders,
  Layers,
  Award,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { PRESET_SCENARIOS } from '../../simulation/scenarioPresets';

export const ExperimentWorkbenchView: React.FC = () => {
  const {
    activeExperiment,
    experiments,
    queueExperiment,
    abortExperiment,
    timelineBranches,
    currentBranchId,
    currentTick,
  } = useSimulation();

  const [title, setTitle] = useState<string>('Perturbation Assay #1');
  const [durationTicks, setDurationTicks] = useState<number>(45);
  const [targetBranchId, setTargetBranchId] = useState<string>(currentBranchId);
  const [energyFlux, setEnergyFlux] = useState<number>(20);
  const [entropyInjection, setEntropyInjection] = useState<number>(15);
  const [resonanceDamping, setResonanceDamping] = useState<number>(0);
  const [containmentAssist, setContainmentAssist] = useState<boolean>(true);

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeExperiment) return;

    queueExperiment({
      title,
      targetBranchId,
      durationTicks,
      variables: {
        energyFlux,
        entropyInjection,
        resonanceDamping,
        containmentAssist,
      },
    });
  };

  const elapsedTicks = activeExperiment ? currentTick - activeExperiment.startTick : 0;
  const progressPercent = activeExperiment
    ? Math.min(100, Math.round((elapsedTicks / activeExperiment.durationTicks) * 100))
    : 0;

  return (
    <div
      style={{
        padding: '1.5rem',
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FlaskConical size={20} color="var(--color-amber)" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#fff',
            }}
          >
            EXPERIMENT WORKBENCH // PERTURBATION ASSAYS
          </h1>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
          Inject controlled energy and entropy stresses across timeline branches to evaluate systemic resilience.
        </p>
      </div>

      {/* Preset Scenario Cards */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
            PRESET DIRECTORATE EXPERIMENT ASSAYS (1-CLICK LOAD)
          </div>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-amber)' }}>
            HIGH-REWARD CRISIS PROTOCOLS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {PRESET_SCENARIOS.map((scen) => (
            <div
              key={scen.id}
              onClick={() => {
                if (activeExperiment) return;
                setTitle(scen.name);
                setEnergyFlux(scen.variables.energyFlux);
                setEntropyInjection(scen.variables.entropyInjection);
                setResonanceDamping(scen.variables.resonanceDamping);
                setContainmentAssist(scen.variables.containmentAssist);
                setDurationTicks(scen.durationTicks);
              }}
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '6px',
                border: title === scen.name ? '1px solid var(--color-amber)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: activeExperiment ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.35rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {scen.name}
                  </span>
                  <span
                    className={`badge-tech ${
                      scen.difficulty === 'OMEGA'
                        ? 'badge-rose'
                        : scen.difficulty === 'CHALLENGING'
                        ? 'badge-amber'
                        : 'badge-cyan'
                    }`}
                    style={{ fontSize: '0.55rem' }}
                  >
                    {scen.difficulty}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                  {scen.tagline}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-amber)', marginTop: '4px' }}>
                <span>{scen.durationTicks} TICKS</span>
                <span>+{scen.rewardInsight} INSIGHT</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Experiment Configuration Console vs Active/Past Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.7fr', gap: '1.25rem' }}>
        {/* Experiment Setup Form */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            CONFIGURE PERTURBATION TRIAL
          </div>

          <form onSubmit={handleStartTrial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                EXPERIMENT CODENAME
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!!activeExperiment}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                TARGET REALITY BRANCH
              </label>
              <select
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                disabled={!!activeExperiment}
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
                {timelineBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                <span style={{ color: '#94a3b8' }}>ENERGY FLUX INJECTION</span>
                <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{energyFlux}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="80"
                value={energyFlux}
                onChange={(e) => setEnergyFlux(Number(e.target.value))}
                disabled={!!activeExperiment}
                style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                <span style={{ color: '#94a3b8' }}>CHAOTIC ENTROPY INJECTION</span>
                <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>+{entropyInjection} units</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                value={entropyInjection}
                onChange={(e) => setEntropyInjection(Number(e.target.value))}
                disabled={!!activeExperiment}
                style={{ width: '100%', accentColor: 'var(--color-rose)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                <span style={{ color: '#94a3b8' }}>TRIAL DURATION (TICKS)</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{durationTicks} ticks</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={durationTicks}
                onChange={(e) => setDurationTicks(Number(e.target.value))}
                disabled={!!activeExperiment}
                style={{ width: '100%', accentColor: 'var(--color-amber)' }}
              />
            </div>

            <button
              type="submit"
              disabled={!!activeExperiment}
              className={`btn-tech ${activeExperiment ? '' : 'btn-tech-primary'}`}
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
            >
              <Play size={14} />
              <span>{activeExperiment ? 'TRIAL IN PROGRESS...' : 'DISPATCH EXPERIMENT ASSAY'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Active Live Monitor & Experiment History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Trial Monitor */}
          {activeExperiment ? (
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--color-amber)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge-tech badge-amber">LIVE PERTURBATION RUNNING</span>
                  <h3 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                    {activeExperiment.title}
                  </h3>
                </div>

                <button onClick={abortExperiment} className="btn-tech btn-tech-danger" style={{ fontSize: '0.72rem' }}>
                  <AlertOctagon size={13} />
                  <span>ABORT TRIAL</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>EXECUTION PROGRESS</span>
                  <span style={{ color: 'var(--color-amber)', fontWeight: 700 }}>
                    {elapsedTicks} / {activeExperiment.durationTicks} TICKS ({progressPercent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--color-amber)', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            </div>
          ) : null}

          {/* Past Experiment Results Dossier */}
          <div className="glass-panel" style={{ padding: '1.25rem', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              DIRECTORATE EXPERIMENT ARCHIVES ({experiments.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
              {experiments.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  NO COMPLETED EXPERIMENTS ON RECORD // DISPATCH TRIAL TO TEST STRESS RESILIENCE
                </div>
              ) : (
                experiments.map((exp) => (
                  <div
                    key={exp.id}
                    style={{
                      padding: '0.85rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-tech)', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                        {exp.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge-tech badge-emerald">
                          SCORE: {exp.successScore}/100
                        </span>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-purple)' }}>
                          +60 INSIGHT
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                      {exp.outcomeSummary}
                    </p>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#64748b' }}>
                      DURATION: {exp.durationTicks} TICKS // TARGET: {exp.targetBranchId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
