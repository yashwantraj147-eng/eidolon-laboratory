import React, { useState } from 'react';
import {
  GitBranch,
  Camera,
  RotateCcw,
  Plus,
  Play,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';

export const TemporalLabView: React.FC = () => {
  const {
    timelineBranches,
    currentBranchId,
    createBranch,
    switchBranch,
    snapshots,
    captureSnapshot,
    restoreSnapshot,
    currentTick,
    resources,
  } = useSimulation();

  const [showForkModal, setShowForkModal] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [newBranchDesc, setNewBranchDesc] = useState<string>('');

  const [newSnapshotLabel, setNewSnapshotLabel] = useState<string>('');

  const handleForkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    createBranch(newBranchName, newBranchDesc || 'Alternate reality fork.');
    setNewBranchName('');
    setNewBranchDesc('');
    setShowForkModal(false);
  };

  const handleCaptureSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newSnapshotLabel.trim() || `Snapshot @ Tick #${currentTick}`;
    captureSnapshot(label);
    setNewSnapshotLabel('');
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
      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitBranch size={20} color="var(--color-purple)" />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: '#fff',
              }}
            >
              TEMPORAL LAB // MANY-WORLDS BRANCH MATRIX
            </h1>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
            Bifurcate reality timelines, record phase-space snapshots, and explore parallel histories.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => setShowForkModal(true)}
            className="btn-tech btn-tech-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Plus size={15} />
            <span>FORK REALITY TIMELINE</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Timeline Branch Tree + Reality Snapshots */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '1.25rem' }}>
        {/* Timeline Branches Tree */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            ACTIVE TIMELINE BRANCHES ({timelineBranches.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {timelineBranches.map((branch) => {
              const isActive = branch.id === currentBranchId;

              return (
                <div
                  key={branch.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: isActive ? 'rgba(168, 85, 247, 0.12)' : 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    border: `1px solid ${isActive ? branch.color : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: branch.color,
                          boxShadow: `0 0 8px ${branch.color}`,
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-tech)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                        {branch.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge-tech" style={{ borderColor: branch.color, color: branch.color }}>
                        {isActive ? 'ACTIVE HEAD' : 'PARALLEL'}
                      </span>
                      {!isActive && (
                        <button
                          onClick={() => switchBranch(branch.id)}
                          className="btn-tech"
                          style={{ fontSize: '0.68rem', padding: '3px 8px' }}
                        >
                          SWITCH &rarr;
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {branch.forkDescription}
                  </p>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: '#64748b',
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '4px',
                    }}
                  >
                    <span>FORKED AT TICK: #{branch.createdTick}</span>
                    <span>ID: {branch.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reality Snapshots Gallery */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            RECORDED REALITY SNAPSHOTS ({snapshots.length})
          </div>

          {/* Quick Capture Input */}
          <form onSubmit={handleCaptureSnapshot} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder={`Snapshot Label (e.g. Pre-Flare @ Tick ${currentTick})...`}
              value={newSnapshotLabel}
              onChange={(e) => setNewSnapshotLabel(e.target.value)}
              style={{
                flex: 1,
                padding: '0.45rem 0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <button type="submit" className="btn-tech" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              <Camera size={13} />
              <span>RECORD</span>
            </button>
          </form>

          {/* Snapshots List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
            {snapshots.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                NO SNAPSHOTS RECORDED YET // USE FORM ABOVE OR SHORTCUT (CTRL+S)
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  style={{
                    padding: '0.75rem 0.9rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                      {snap.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                      TICK #{snap.tick} // BRANCH: {snap.branchId}
                    </div>
                  </div>

                  <button
                    onClick={() => restoreSnapshot(snap.id)}
                    className="btn-tech"
                    style={{ fontSize: '0.7rem', padding: '4px 8px', borderColor: 'var(--color-cyan)', color: 'var(--color-cyan)' }}
                  >
                    <RotateCcw size={12} />
                    <span>RESTORE</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fork Reality Modal */}
      {showForkModal && (
        <div className="modal-overlay" onClick={() => setShowForkModal(false)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '460px',
              padding: '1.5rem',
              border: '1px solid var(--color-purple)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <GitBranch size={18} color="var(--color-purple)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff' }}>
                BIFURCATE REALITY TIMELINE
              </h3>
            </div>

            <form onSubmit={handleForkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                  NEW BRANCH DESIGNATION
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Timeline-Theta-Alternative"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                  FORK HYPOTHESIS & SCIENTIFIC RATIONALE
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the divergence conditions or stress hypotheses for this alternate branch..."
                  value={newBranchDesc}
                  onChange={(e) => setNewBranchDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowForkModal(false)} className="btn-tech">
                  CANCEL
                </button>
                <button type="submit" className="btn-tech btn-tech-primary">
                  COMMENCE BIFURCATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
