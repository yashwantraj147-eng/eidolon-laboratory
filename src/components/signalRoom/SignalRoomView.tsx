import React, { useState, useEffect } from 'react';
import {
  Radio,
  Wifi,
  Lock,
  Unlock,
  Sparkles,
  Volume2,
  Sliders,
  Cpu,
  Terminal,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { sound } from '../../simulation/audioSynth';

interface InterceptedSignal {
  id: string;
  frequency: number;
  originNode: string;
  encryptedText: string;
  decryptedText: string;
  isDecrypted: boolean;
  insightReward: number;
}

const INITIAL_SIGNALS: InterceptedSignal[] = [
  {
    id: 'sig-01',
    frequency: 142.8,
    originNode: 'Probe-Solon-42',
    encryptedText: '78-A1-FE-90-BC-33-01-E4-5A-88-12-9F',
    decryptedText: '“Telemetry confirms boundary wall oscillation. Metric coordinates non-Euclidean at edge.”',
    isDecrypted: false,
    insightReward: 25,
  },
  {
    id: 'sig-02',
    frequency: 384.2,
    originNode: 'Obsidian-Synod-Relay',
    encryptedText: 'EE-12-9A-00-55-CC-41-8F-99-31-02-D7',
    decryptedText: '“The Observers manipulate our entropy dial. We must harvest resonance crystals to transcend their lens.”',
    isDecrypted: false,
    insightReward: 35,
  },
  {
    id: 'sig-03',
    frequency: 712.5,
    originNode: 'Nexus-Forge-Automata',
    encryptedText: '11-34-FF-A7-88-DE-52-90-CC-E1-00-2B',
    decryptedText: '“Substrate crystallization complete. Ready to synthesize next-generation autonomous wardens.”',
    isDecrypted: false,
    insightReward: 20,
  },
];

export const SignalRoomView: React.FC = () => {
  const { resources, currentTick } = useSimulation();
  const [signals, setSignals] = useState<InterceptedSignal[]>(INITIAL_SIGNALS);
  const [selectedFreq, setSelectedFreq] = useState<number>(142.8);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [activeSignalId, setActiveSignalId] = useState<string>('sig-01');

  const activeSignal = signals.find((s) => s.id === activeSignalId) || signals[0];

  const handleDecrypt = (sigId: string) => {
    sound.playScan();
    setIsDecoding(true);

    setTimeout(() => {
      sound.playSuccess();
      setSignals((prev) =>
        prev.map((s) => (s.id === sigId ? { ...s, isDecrypted: true } : s))
      );
      resources.insightPoints += activeSignal.insightReward;
      setIsDecoding(false);
    }, 1200);
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
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Radio size={20} color="var(--color-cyan)" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#fff',
            }}
          >
            SIGNAL ROOM // QUANTUM FREQUENCY INTERCEPTOR
          </h1>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
          Listen to sub-reality entity broadcasts, tune spectral bandwidths, and decipher classified transmissions.
        </p>
      </div>

      {/* Main Grid: Waveform Spectrogram & Signal Packets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1.25rem' }}>
        {/* Spectral Analyzer & Frequency Tuner */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
              SPECTRAL DENSITY ANALYZER
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-cyan)' }}>
              TUNED: {selectedFreq.toFixed(1)} MHz
            </span>
          </div>

          {/* Animated Waveform Spectrogram Bars */}
          <div
            style={{
              height: '140px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '6px',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '10px 14px',
              gap: '4px',
            }}
          >
            {Array.from({ length: 32 }).map((_, i) => {
              const h = Math.sin((currentTick * 0.15) + i * 0.4) * 45 + 50;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    backgroundColor: i % 2 === 0 ? 'var(--color-cyan)' : 'var(--color-purple)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.1s ease',
                    opacity: 0.85,
                  }}
                />
              );
            })}
          </div>

          {/* Frequency Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>CARRIER WAVE TUNER</span>
              <span style={{ color: '#fff' }}>100.0 - 900.0 MHz</span>
            </div>
            <input
              type="range"
              min="100"
              max="900"
              step="0.5"
              value={selectedFreq}
              onChange={(e) => setSelectedFreq(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
            />
          </div>

          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}
          >
            <div>STATUS: SCANNING SUB-REALITY QUANTUM FLUX</div>
            <div>CARRIER NOISE: -82.4 dBm // POLARIZATION: ELLIPTIC</div>
          </div>
        </div>

        {/* Intercepted Signal Dossier & Decryption */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
            INTERCEPTED PACKETS ({signals.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {signals.map((sig) => {
              const isSelected = sig.id === activeSignal.id;

              return (
                <div
                  key={sig.id}
                  onClick={() => setActiveSignalId(sig.id)}
                  style={{
                    padding: '0.85rem',
                    backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {sig.isDecrypted ? <Unlock size={14} color="var(--color-emerald)" /> : <Lock size={14} color="var(--color-amber)" />}
                      <span style={{ fontFamily: 'var(--font-tech)', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                        {sig.originNode}
                      </span>
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-cyan)' }}>
                      {sig.frequency} MHz
                    </span>
                  </div>

                  {sig.isDecrypted ? (
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', padding: '4px 6px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '3px' }}>
                      {sig.decryptedText}
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#64748b', letterSpacing: '0.1em' }}>
                      ENCRYPTED: {sig.encryptedText}
                    </div>
                  )}

                  {!sig.isDecrypted && isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecrypt(sig.id);
                      }}
                      disabled={isDecoding}
                      className="btn-tech btn-tech-primary"
                      style={{ fontSize: '0.7rem', padding: '4px 8px', marginTop: '4px' }}
                    >
                      {isDecoding ? 'DECODING QUANTUM STREAM...' : `DECRYPT PACKET (+${sig.insightReward} INSIGHT)`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
