import React, { useState } from 'react';
import {
  Network,
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  Radar,
  Eye,
  Shield,
  GitBranch,
  History,
  Cpu,
  Activity,
  Zap,
  Layers,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { ResearchNode } from '../../types/simulation';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color?: string }>> = {
  Radar,
  Eye,
  Shield,
  Lock,
  GitBranch,
  History,
  Cpu,
  Activity,
  Zap,
  Layers,
};

export const ResearchTreeView: React.FC = () => {
  const { researchNodes, resources, unlockResearch } = useSimulation();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'DETECTION', 'CONTAINMENT', 'TEMPORAL', 'COMPUTATION', 'SYNTHESIS'];

  const filteredNodes = researchNodes.filter(
    (n) => selectedCategory === 'ALL' || n.category === selectedCategory
  );

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
      {/* Header & Balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Network size={20} color="var(--color-purple)" />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: '#fff',
              }}
            >
              DIRECTORATE RESEARCH & DEVELOPMENT TREE
            </h1>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
            Allocate synthesized Insight Points to unlock systemic simulation enhancements and containment buffs.
          </p>
        </div>

        {/* Insight Points Balance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1rem',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '6px',
          }}
        >
          <Award size={18} color="var(--color-purple)" />
          <div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              AVAILABLE INSIGHT POINTS
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#c084fc' }}>
              {resources.insightPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background: selectedCategory === cat ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === cat ? '#00f0ff' : '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Research Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredNodes.map((node) => {
          const Icon = ICON_MAP[node.iconName] || Network;
          const isUnlocked = node.unlocked;
          const canAfford = resources.insightPoints >= node.cost;
          const prereqsMet = node.prerequisites.every((pid) =>
            researchNodes.some((rn) => rn.id === pid && rn.unlocked)
          );
          const canUnlock = !isUnlocked && canAfford && prereqsMet;

          return (
            <div
              key={node.id}
              style={{
                padding: '1.25rem',
                backgroundColor: isUnlocked
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(0, 0, 0, 0.35)',
                borderRadius: '8px',
                border: isUnlocked
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                      }}
                    >
                      <Icon size={18} color={isUnlocked ? 'var(--color-emerald)' : 'var(--color-cyan)'} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                        {node.title}
                      </h3>
                      <span className="badge-tech badge-purple" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                        {node.category}
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="badge-tech badge-emerald">UNLOCKED</span>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: canAfford ? 'var(--color-purple)' : '#64748b', fontWeight: 700 }}>
                      {node.cost} INSIGHT
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem', lineHeight: 1.4 }}>
                  {node.description}
                </p>

                {/* Mechanical Benefit Card */}
                <div
                  style={{
                    padding: '0.5rem 0.65rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                    borderLeft: '2px solid var(--color-cyan)',
                    marginTop: '0.6rem',
                    fontSize: '0.72rem',
                    color: '#e2e8f0',
                  }}
                >
                  <strong style={{ color: 'var(--color-cyan)' }}>EFFECT: </strong>
                  {node.mechanicalBenefit}
                </div>
              </div>

              {/* Action Button */}
              {!isUnlocked && (
                <button
                  onClick={() => unlockResearch(node.id)}
                  disabled={!canUnlock}
                  className={`btn-tech ${canUnlock ? 'btn-tech-primary' : ''}`}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    fontSize: '0.72rem',
                    opacity: canUnlock ? 1 : 0.5,
                    cursor: canUnlock ? 'pointer' : 'not-allowed',
                  }}
                >
                  {!prereqsMet
                    ? 'PREREQUISITES REQUIRED'
                    : !canAfford
                    ? `NEED ${(node.cost - resources.insightPoints)} MORE INSIGHT`
                    : `RESEARCH ADVANCEMENT (${node.cost} PTS)`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
