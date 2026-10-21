import React, { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  Flame,
  Zap,
  RotateCcw,
  PlusCircle,
  Clock,
  Radio,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { EventSeverity } from '../../types/simulation';

export const CommandCenterView: React.FC = () => {
  const {
    resources,
    currentTick,
    events,
    telemetryHistory,
    anomalies,
    entities,
    stabilizeField,
    purgeEntropy,
    overclockEntities,
    chronoRewindPulse,
    spawnManualAnomaly,
    triggerChronalStorm,
    activeStorm,
    factions,
    entanglementLinks,
    setSelectedAnomalyId,
    setActiveWorkspace,
  } = useSimulation();

  const [severityFilter, setSeverityFilter] = useState<EventSeverity | 'ALL'>('ALL');

  const filteredEvents = events.filter((e) =>
    severityFilter === 'ALL' ? true : e.severity === severityFilter
  );

  const uncontainedAnomalies = anomalies.filter((a) => a.status !== 'CONTAINED');

  // SVG Sparkline generator
  const renderSparkline = (
    data: number[],
    color: string,
    minVal: number,
    maxVal: number,
    width = 240,
    height = 45
  ) => {
    if (data.length < 2) return null;
    const range = maxVal - minVal || 1;
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const normalized = (val - minVal) / range;
        const y = height - normalized * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const coherenceHistory = telemetryHistory.map((t) => t.coherence);
  const entropyHistory = telemetryHistory.map((t) => t.entropy);
  const energyHistory = telemetryHistory.map((t) => t.energy);

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
      {/* Active Chronal Storm Alert Banner */}
      {activeStorm && (
        <div
          className="animate-alert-pulse"
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(168, 85, 247, 0.18)',
            border: '1px solid var(--color-purple)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={18} color="var(--color-purple)" />
            <div>
              <div style={{ fontFamily: 'var(--font-tech)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                CHRONAL RADIATION TEMPEST IN PROGRESS: {activeStorm.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#cbd5e1' }}>
                INTENSITY LEVEL {activeStorm.intensity} // RADIUS: {activeStorm.radius.toFixed(1)}u // REMAINING: {activeStorm.remainingTicks} TICKS
              </div>
            </div>
          </div>
          <span className="badge-tech badge-purple">
            ACTIVE HAZARD
          </span>
        </div>
      )}

      {/* Top Directorate Banner & Interventions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.25rem' }}>
        {/* Reality Stability Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  color: 'var(--color-cyan)',
                }}
              >
                REALITY COHERENCE INDEX
              </div>
              <span
                className={`badge-tech ${
                  resources.coherence > 70
                    ? 'badge-cyan'
                    : resources.coherence > 45
                    ? 'badge-amber'
                    : 'badge-rose'
                }`}
              >
                {resources.coherence > 70 ? 'STABLE' : resources.coherence > 45 ? 'STRAINED' : 'CRITICAL'}
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '2.8rem',
                color: '#fff',
                marginTop: '0.4rem',
                letterSpacing: '-0.02em',
              }}
            >
              {resources.coherence.toFixed(1)}
              <span style={{ fontSize: '1.2rem', color: '#64748b', marginLeft: '4px' }}>%</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span>Historical Telemetry (Last 100 Ticks)</span>
              <span style={{ color: 'var(--color-cyan)' }}>Min: {Math.min(...coherenceHistory).toFixed(1)}%</span>
            </div>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {renderSparkline(coherenceHistory, '#00f0ff', 0, 100, 320, 40)}
            </div>
          </div>
        </div>

        {/* Directorate Interventions Deck */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                color: '#94a3b8',
                marginBottom: '0.75rem',
              }}
            >
              DIRECTORATE PHASE-SPACE INTERVENTIONS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
              <button
                onClick={stabilizeField}
                className="btn-tech"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.3rem',
                  borderColor: 'rgba(0, 240, 255, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-cyan)' }}>
                  <ShieldAlert size={15} />
                  <span style={{ fontSize: '0.85rem' }}>Stabilize Field</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'none' }}>
                  Cost: 40 Energy | +16 Coherence
                </span>
              </button>

              <button
                onClick={purgeEntropy}
                className="btn-tech"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.3rem',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-rose)' }}>
                  <Flame size={15} />
                  <span style={{ fontSize: '0.85rem' }}>Purge Entropy</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'none' }}>
                  Cost: 50 Energy | -25 Entropy
                </span>
              </button>

              <button
                onClick={overclockEntities}
                className="btn-tech"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.3rem',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-amber)' }}>
                  <Zap size={15} />
                  <span style={{ fontSize: '0.85rem' }}>Overclock Probes</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'none' }}>
                  Cost: 30 Energy | 100% Recharge
                </span>
              </button>

              <button
                onClick={chronoRewindPulse}
                className="btn-tech"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.3rem',
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-purple)' }}>
                  <RotateCcw size={15} />
                  <span style={{ fontSize: '0.85rem' }}>Chrono-Wave</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'none' }}>
                  Hulls to 100% | Contract Anomalies
                </span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              AVAILABLE ENERGY RESERVE: {resources.energy} / {resources.maxEnergy} MW
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={triggerChronalStorm}
                className="btn-tech"
                style={{ fontSize: '0.72rem', padding: '4px 8px', color: 'var(--color-purple)' }}
                title="Generate Chronal Tempest in Sector"
              >
                <Zap size={13} />
                <span>SUMMON STORM</span>
              </button>
              <button
                onClick={spawnManualAnomaly}
                className="btn-tech"
                style={{ fontSize: '0.72rem', padding: '4px 8px', color: 'var(--color-rose)' }}
                title="Inject Controlled Singularity"
              >
                <PlusCircle size={13} />
                <span>INJECT ANOMALY</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Deck: Telemetry Telemetry Plots & Active Anomaly Alarms */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '1.25rem' }}>
        {/* Active Anomalies Radar */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
              ACTIVE DISTORTIONS & ANOMALIES ({uncontainedAnomalies.length})
            </div>
            <button
              onClick={() => setActiveWorkspace('anomaly-lab')}
              className="btn-tech"
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              GO TO LAB &rarr;
            </button>
          </div>

          {uncontainedAnomalies.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-emerald)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
              }}
            >
              <CheckCircle2 size={24} style={{ margin: '0 auto 0.5rem' }} />
              ALL ANOMALIES CONTAINED // SECTOR STABLE
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {uncontainedAnomalies.map((anom) => (
                <div
                  key={anom.id}
                  onClick={() => {
                    setSelectedAnomalyId(anom.id);
                    setActiveWorkspace('anomaly-lab');
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <AlertTriangle size={13} color="var(--color-rose)" />
                      <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                        {anom.name}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                      {anom.classification.replace(/_/g, ' ')} // RAD: {anom.radius.toFixed(1)}u
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge-tech badge-rose">{anom.severity}</span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>
                      {Math.round(anom.containmentProgress)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry Plots: Energy & Entropy History */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            PHASE-SPACE DYNAMICS (ENERGY & ENTROPY)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                <span style={{ color: 'var(--color-rose)' }}>Chaotic Entropy Growth</span>
                <span>Current: {resources.entropy.toFixed(1)} / 100</span>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '5px 8px', borderRadius: '4px' }}>
                {renderSparkline(entropyHistory, '#ef4444', 0, 100, 380, 32)}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                <span style={{ color: 'var(--color-cyan)' }}>Quantum Energy Baseline</span>
                <span>Current: {resources.energy} / {resources.maxEnergy} MW</span>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '5px 8px', borderRadius: '4px' }}>
                {renderSparkline(energyHistory, '#00f0ff', 0, resources.maxEnergy, 380, 32)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faction Territorial Dominance Matrix Deck */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
            IDEOLOGICAL FACTION TERRITORIAL DOMINANCE & DIPLOMACY
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-cyan)' }}>
            ENTANGLED TWINS: {entanglementLinks.length} PAIRS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {factions.map((f) => (
            <div
              key={f.name}
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '6px',
                border: `1px solid ${f.color}40`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-tech)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  {f.name}
                </span>
                <span
                  className="badge-tech"
                  style={{
                    borderColor: f.color,
                    color: f.color,
                    fontSize: '0.6rem',
                  }}
                >
                  {f.stanceWithDirectorate.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>
                “{f.motto}”
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>INFLUENCE SCORE</span>
                  <span style={{ color: f.color, fontWeight: 700 }}>{f.influenceScore}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
                  <div style={{ width: `${f.influenceScore}%`, height: '100%', backgroundColor: f.color, borderRadius: '2px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                <span>ZONE: {f.controlledZoneId || 'CONTESTED'}</span>
                <span>AGENTS: {f.synthesizedAgentsCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Deck: Causal Event Ticker */}
      <div className="glass-panel" style={{ padding: '1.25rem', flex: 1, minHeight: '240px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} color="var(--color-cyan)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
              CHRONO-CAUSAL SIMULATION EVENT LOG
            </span>
          </div>

          {/* Severity Filters */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {(['ALL', 'ANOMALY', 'CRITICAL', 'SUCCESS', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  background: severityFilter === sev ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                  color: severityFilter === sev ? '#00f0ff' : '#64748b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                borderLeft: `3px solid ${
                  ev.severity === 'ANOMALY' || ev.severity === 'CRITICAL'
                    ? 'var(--color-rose)'
                    : ev.severity === 'SUCCESS'
                    ? 'var(--color-emerald)'
                    : 'var(--color-cyan)'
                }`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                    {ev.title}
                  </span>
                  <span
                    className={`badge-tech ${
                      ev.severity === 'ANOMALY' || ev.severity === 'CRITICAL'
                        ? 'badge-rose'
                        : ev.severity === 'SUCCESS'
                        ? 'badge-emerald'
                        : 'badge-cyan'
                    }`}
                  >
                    {ev.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {ev.description}
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                TICK #{ev.tick}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
