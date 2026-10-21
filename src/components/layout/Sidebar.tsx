import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Users,
  ShieldAlert,
  GitBranch,
  FlaskConical,
  Radio,
  Network,
  BookOpen,
  Settings,
} from 'lucide-react';
import { useSimulation, WorkspaceId } from '../../simulation/simulationStore';

interface NavItem {
  id: WorkspaceId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size: number; color?: string }>;
  hotkey: string;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeWorkspace,
    setActiveWorkspace,
    anomalies,
    timelineBranches,
    researchNodes,
    resources,
    entities,
  } = useSimulation();

  const uncontainedAnomaliesCount = anomalies.filter((a) => a.status !== 'CONTAINED').length;
  const unlockableResearchCount = researchNodes.filter(
    (n) => !n.unlocked && resources.insightPoints >= n.cost
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'command-center',
      label: 'Command Center',
      sublabel: 'Directorate HUD & Interventions',
      icon: LayoutDashboard,
      hotkey: 'Ctrl+1',
    },
    {
      id: 'observatory',
      label: 'Reality Observatory',
      sublabel: 'Interactive 3D Quantum Space',
      icon: Eye,
      hotkey: 'Ctrl+2',
      badge: `${entities.length} ENT`,
      badgeColor: 'var(--color-cyan)',
    },
    {
      id: 'entity-atlas',
      label: 'Entity Atlas',
      sublabel: 'Autonomous Agent Telemetry',
      icon: Users,
      hotkey: 'Ctrl+3',
    },
    {
      id: 'anomaly-lab',
      label: 'Anomaly Laboratory',
      sublabel: 'Containment & Diagnosis',
      icon: ShieldAlert,
      hotkey: 'Ctrl+4',
      badge: uncontainedAnomaliesCount > 0 ? `${uncontainedAnomaliesCount} ACT` : undefined,
      badgeColor: 'var(--color-rose)',
    },
    {
      id: 'temporal-lab',
      label: 'Temporal Lab',
      sublabel: 'Many-Worlds Branching Matrix',
      icon: GitBranch,
      hotkey: 'Ctrl+5',
      badge: `${timelineBranches.length} BR`,
      badgeColor: 'var(--color-purple)',
    },
    {
      id: 'experiment-workbench',
      label: 'Experiment Workbench',
      sublabel: 'Parameter Perturbation Trials',
      icon: FlaskConical,
      hotkey: 'Ctrl+6',
    },
    {
      id: 'signal-room',
      label: 'Signal Room',
      sublabel: 'Sub-Reality Quantum Decoder',
      icon: Radio,
      hotkey: 'Ctrl+7',
    },
    {
      id: 'research-tree',
      label: 'Research Tree',
      sublabel: 'Directorate R&D Progression',
      icon: Network,
      hotkey: 'Ctrl+8',
      badge: unlockableResearchCount > 0 ? `${unlockableResearchCount} NEW` : undefined,
      badgeColor: 'var(--color-amber)',
    },
    {
      id: 'archive',
      label: 'Archive & Dossiers',
      sublabel: 'Classified Records & Lore',
      icon: BookOpen,
      hotkey: 'Ctrl+9',
    },
    {
      id: 'settings',
      label: 'Settings & Diag',
      sublabel: 'Engine Parameters & IO',
      icon: Settings,
      hotkey: 'Ctrl+0',
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'rgba(5, 9, 18, 0.95)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 60px)',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Navigation Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '0.6rem',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            color: '#64748b',
            padding: '4px 8px',
            textTransform: 'uppercase',
          }}
        >
          Directorate Workspaces
        </div>

        {navItems.map((item) => {
          const isActive = activeWorkspace === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveWorkspace(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                border: isActive
                  ? '1px solid rgba(0, 240, 255, 0.4)'
                  : '1px solid transparent',
                backgroundColor: isActive
                  ? 'rgba(0, 240, 255, 0.08)'
                  : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '15%',
                    bottom: '15%',
                    width: '3px',
                    backgroundColor: 'var(--color-cyan)',
                    borderRadius: '0 2px 2px 0',
                    boxShadow: '0 0 8px var(--color-cyan)',
                  }}
                />
              )}

              <Icon
                size={17}
                color={isActive ? 'var(--color-cyan)' : '#64748b'}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-tech)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        border: `1px solid ${item.badgeColor || 'var(--color-cyan)'}`,
                        color: item.badgeColor || 'var(--color-cyan)',
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '130px',
                    }}
                  >
                    {item.sublabel}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      color: '#475569',
                    }}
                  >
                    {item.hotkey}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Terminal / Engine Diagnostic Status Footer */}
      <div
        style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>ENGINE STATUS</span>
          <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>SYNCHRONIZED</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: '#475569',
            marginTop: '3px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>PRNG MULBERRY32</span>
          <span>FPS: ~60</span>
        </div>
      </div>
    </aside>
  );
};
