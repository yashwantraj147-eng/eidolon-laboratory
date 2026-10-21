import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  Sliders,
  Radio,
  Search,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { ContainmentProtocolType, Anomaly } from '../../types/simulation';

export const AnomalyLabView: React.FC = () => {
  const {
    anomalies,
    selectedAnomalyId,
    setSelectedAnomalyId,
    testHypothesis,
    deployContainmentProtocol,
    resources,
    currentTick,
  } = useSimulation();

  const selectedAnomaly = anomalies.find((a) => a.id === selectedAnomalyId) || anomalies[0];

  // Containment Protocol sliders
  const [protocol, setProtocol] = useState<ContainmentProtocolType>('HARMONIC_DAMPENING');
  const [allocatedEnergy, setAllocatedEnergy] = useState<number>(90);
  const [allocatedResonance, setAllocatedResonance] = useState<number>(50);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; success: boolean } | null>(null);

  const protocols: ContainmentProtocolType[] = [
    'HARMONIC_DAMPENING',
    'SUBSTRATE_ISOLATION',
    'TEMPORAL_INVERSION',
    'QUANTUM_PINNING',
  ];

  const handleEngageContainment = () => {
    if (!selectedAnomaly) return;
    const ok = deployContainmentProtocol(
      selectedAnomaly.id,
      protocol,
      allocatedEnergy,
      allocatedResonance
    );
    if (ok) {
      setFeedbackMessage({ text: 'Harmonic dampening lattice successfully locked.', success: true });
    } else {
      setFeedbackMessage({
        text: 'Containment failed! Parameter mismatch with singularity radiation.',
        success: false,
      });
    }
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.8fr',
        gap: '1.25rem',
      }}
    >
      {/* Left Column: Anomaly Registry */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} color="var(--color-rose)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
              ANOMALY CONTAINMENT MATRIX ({anomalies.length})
            </span>
          </div>
        </div>

        {/* Anomaly Cards List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '4px',
          }}
        >
          {anomalies.map((anom) => {
            const isSelected = anom.id === selectedAnomaly?.id;
            const isContained = anom.status === 'CONTAINED';

            return (
              <div
                key={anom.id}
                onClick={() => {
                  setSelectedAnomalyId(anom.id);
                  setFeedbackMessage(null);
                }}
                style={{
                  padding: '0.75rem 0.9rem',
                  backgroundColor: isSelected
                    ? 'rgba(239, 68, 68, 0.12)'
                    : isContained
                    ? 'rgba(16, 185, 129, 0.05)'
                    : 'rgba(0, 0, 0, 0.35)',
                  border: isSelected
                    ? '1px solid rgba(239, 68, 68, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isContained ? 'var(--color-emerald)' : 'var(--color-rose)',
                      }}
                    />
                    <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                      {anom.name}
                    </span>
                  </div>

                  <span className={`badge-tech ${isContained ? 'badge-emerald' : 'badge-rose'}`}>
                    {anom.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: '#94a3b8',
                  }}
                >
                  <span>{anom.classification.replace(/_/g, ' ')}</span>
                  <span style={{ color: 'var(--color-cyan)' }}>{Math.round(anom.containmentProgress)}%</span>
                </div>

                {/* Containment Bar */}
                <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', marginTop: '6px' }}>
                  <div
                    style={{
                      width: `${anom.containmentProgress}%`,
                      height: '100%',
                      backgroundColor: isContained ? 'var(--color-emerald)' : 'var(--color-cyan)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Containment Lab & Hypothesis Matrix */}
      {selectedAnomaly ? (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto',
          }}
        >
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: '#fff',
                  }}
                >
                  {selectedAnomaly.name}
                </h2>
                <span className="badge-tech badge-rose">{selectedAnomaly.severity}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                CLASSIFICATION: {selectedAnomaly.classification.replace(/_/g, ' ')} // STATUS: {selectedAnomaly.status}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b' }}>
              <div>COORDINATES: [{selectedAnomaly.location.x.toFixed(1)}, {selectedAnomaly.location.y.toFixed(1)}, {selectedAnomaly.location.z.toFixed(1)}]</div>
              <div style={{ color: 'var(--color-rose)', marginTop: '2px' }}>
                DISTORTION RADIUS: {selectedAnomaly.radius.toFixed(1)}u
              </div>
            </div>
          </div>

          {/* Containment Progress Large Gauge */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>CONTAINMENT FIELD INTEGRITY</span>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>
                {Math.round(selectedAnomaly.containmentProgress)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${selectedAnomaly.containmentProgress}%`,
                  height: '100%',
                  backgroundColor: selectedAnomaly.status === 'CONTAINED' ? 'var(--color-emerald)' : 'var(--color-cyan)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Diagnostic Hypothesis Matrix */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
                DIAGNOSTIC HYPOTHESIS MATRIX (SCIENTIFIC VALIDATION)
              </div>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-purple)' }}>
                EARN +45 INSIGHT ON VALIDATION
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedAnomaly.hypotheses.map((hyp) => (
                <div
                  key={hyp.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 500 }}>
                      {hyp.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                      THEORETICAL CONFIDENCE: {Math.round(hyp.confidence * 100)}%
                    </div>
                  </div>

                  <div>
                    {hyp.tested ? (
                      <span className={`badge-tech ${hyp.validated ? 'badge-emerald' : 'badge-rose'}`}>
                        {hyp.validated ? 'CONFIRMED' : 'REFUTED'}
                      </span>
                    ) : (
                      <button
                        onClick={() => testHypothesis(selectedAnomaly.id, hyp.id)}
                        className="btn-tech"
                        style={{ fontSize: '0.68rem', padding: '3px 8px' }}
                      >
                        TEST HYPOTHESIS
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Containment Procedure Deployment Console */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              DIRECTORATE CONTAINMENT DEPLOYMENT CONSOLE
            </div>

            {/* Protocol Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {protocols.map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  style={{
                    background: protocol === p ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                    color: protocol === p ? '#00f0ff' : '#94a3b8',
                    border: protocol === p ? '1px solid var(--color-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {p.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Sliders: Energy & Resonance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>ALLOCATED ENERGY BEAM</span>
                  <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{allocatedEnergy} MW</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  value={allocatedEnergy}
                  onChange={(e) => setAllocatedEnergy(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>RESONANCE MODULATION FREQ</span>
                  <span style={{ color: 'var(--color-purple)', fontWeight: 600 }}>{allocatedResonance} Hz</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={allocatedResonance}
                  onChange={(e) => setAllocatedResonance(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-purple)' }}
                />
              </div>
            </div>

            {feedbackMessage && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '4px',
                  backgroundColor: feedbackMessage.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${feedbackMessage.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: feedbackMessage.success ? 'var(--color-emerald)' : 'var(--color-rose)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                {feedbackMessage.text}
              </div>
            )}

            <button
              onClick={handleEngageContainment}
              className="btn-tech btn-tech-primary"
              style={{ width: '100%', padding: '0.65rem' }}
            >
              ENGAGE CONTAINMENT BEAM
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Select an anomaly to inspect</div>
      )}
    </div>
  );
};
