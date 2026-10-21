import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Search,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  RotateCcw,
  PlusCircle,
  Eye,
  Camera,
  Play,
  Pause,
  Award,
  Sparkles,
} from 'lucide-react';
import { useSimulation, WorkspaceId } from '../../simulation/simulationStore';
import { sound } from '../../simulation/audioSynth';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'NAVIGATION' | 'INTERVENTION' | 'CONTROL' | 'PERSISTENCE';
  icon: React.ComponentType<{ size: number; color?: string }>;
  action: () => void;
}

export const CommandConsoleModal: React.FC = () => {
  const {
    isConsoleOpen,
    setIsConsoleOpen,
    setActiveWorkspace,
    stabilizeField,
    purgeEntropy,
    overclockEntities,
    chronoRewindPulse,
    spawnManualAnomaly,
    triggerChronalStorm,
    toggleAmbientDrone,
    forgeEntanglement,
    entities,
    togglePause,
    stepSimulation,
    setSimulationSpeed,
    captureSnapshot,
    exportRealityMatrix,
    currentTick,
    resources,
  } = useSimulation();

  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isConsoleOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isConsoleOpen]);

  const commands: CommandItem[] = [
    // Navigations
    {
      id: 'nav-obs',
      title: 'Navigate to Reality Observatory (3D)',
      description: 'Switch to Three.js interactive 3D spatial nexus (Ctrl+2)',
      category: 'NAVIGATION',
      icon: Eye,
      action: () => setActiveWorkspace('observatory'),
    },
    {
      id: 'nav-cmd',
      title: 'Navigate to Command Center',
      description: 'Open Directorate executive HUD and interventions (Ctrl+1)',
      category: 'NAVIGATION',
      icon: Terminal,
      action: () => setActiveWorkspace('command-center'),
    },
    {
      id: 'nav-atlas',
      title: 'Navigate to Entity Atlas',
      description: 'Inspect autonomous agent utilities, inventories, and memories (Ctrl+3)',
      category: 'NAVIGATION',
      icon: Terminal,
      action: () => setActiveWorkspace('entity-atlas'),
    },
    {
      id: 'nav-anom',
      title: 'Navigate to Anomaly Laboratory',
      description: 'Containment protocols, hypothesis matrix, radiation shielding (Ctrl+4)',
      category: 'NAVIGATION',
      icon: ShieldAlert,
      action: () => setActiveWorkspace('anomaly-lab'),
    },
    {
      id: 'nav-temp',
      title: 'Navigate to Temporal Lab',
      description: 'Bifurcate reality timelines and view snapshot gallery (Ctrl+5)',
      category: 'NAVIGATION',
      icon: Terminal,
      action: () => setActiveWorkspace('temporal-lab'),
    },
    {
      id: 'nav-exp',
      title: 'Navigate to Experiment Workbench',
      description: 'Dispatch parameter perturbation stress trials (Ctrl+6)',
      category: 'NAVIGATION',
      icon: Terminal,
      action: () => setActiveWorkspace('experiment-workbench'),
    },
    {
      id: 'nav-res',
      title: 'Navigate to Research Tree',
      description: 'Unlock Directorate technological capabilities (Ctrl+8)',
      category: 'NAVIGATION',
      icon: Award,
      action: () => setActiveWorkspace('research-tree'),
    },

    // Interventions
    {
      id: 'int-stab',
      title: 'Stabilize Reality Field',
      description: 'Channel 40MW quantum energy to raise coherence by +16%',
      category: 'INTERVENTION',
      icon: ShieldAlert,
      action: stabilizeField,
    },
    {
      id: 'int-purge',
      title: 'Purge Chaotic Entropy',
      description: 'Discharge -25 units of background entropy via cooling sink',
      category: 'INTERVENTION',
      icon: Flame,
      action: purgeEntropy,
    },
    {
      id: 'int-over',
      title: 'Overclock Autonomous Probes',
      description: 'Instant recharge and +10 substrate bonus to all active entities',
      category: 'INTERVENTION',
      icon: Zap,
      action: overclockEntities,
    },
    {
      id: 'int-wave',
      title: 'Chrono-Restoration Wave',
      description: 'Restore all entity hulls to 100% and contract anomaly radius by 25%',
      category: 'INTERVENTION',
      icon: RotateCcw,
      action: chronoRewindPulse,
    },
    {
      id: 'int-anom',
      title: 'Inject Controlled Test Anomaly',
      description: 'Spawn high-energy test singularity for containment drills',
      category: 'INTERVENTION',
      icon: PlusCircle,
      action: spawnManualAnomaly,
    },
    {
      id: 'int-storm',
      title: 'Summon Chronal Radiation Tempest',
      description: 'Trigger atmospheric temporal distortion across sectors',
      category: 'INTERVENTION',
      icon: Zap,
      action: triggerChronalStorm,
    },
    {
      id: 'int-entangle',
      title: 'Forge Quantum Entanglement Link',
      description: 'Synchronize quantum states between first available agents',
      category: 'INTERVENTION',
      icon: Sparkles,
      action: () => {
        if (entities.length >= 2) {
          forgeEntanglement(entities[0].id, entities[1].id);
        }
      },
    },
    {
      id: 'ctrl-ambient',
      title: 'Toggle Ambient Synthesizer Drone',
      description: 'Engage or disengage generative dark ambient background audio',
      category: 'CONTROL',
      icon: Zap,
      action: toggleAmbientDrone,
    },
    {
      id: 'cheat-insight',
      title: 'Directorate Grant: +150 Insight Points',
      description: 'Grant research points to immediately test tech tree unlocks',
      category: 'CONTROL',
      icon: Award,
      action: () => {
        sound.playSuccess();
        resources.insightPoints += 150;
      },
    },

    // Controls
    {
      id: 'ctrl-pause',
      title: 'Toggle Simulation Play / Pause',
      description: 'Halt or resume simulation clock ticks (Space)',
      category: 'CONTROL',
      icon: Play,
      action: togglePause,
    },
    {
      id: 'ctrl-step',
      title: 'Single Simulation Step Forward',
      description: 'Advance reality state by 1 discrete tick (Ctrl+Right)',
      category: 'CONTROL',
      icon: ArrowRight,
      action: stepSimulation,
    },
    {
      id: 'ctrl-speed-5x',
      title: 'Set Simulation Speed: 5x',
      description: 'Accelerate simulation ticks to 5x velocity',
      category: 'CONTROL',
      icon: Play,
      action: () => setSimulationSpeed(5),
    },

    // Persistence
    {
      id: 'pers-snap',
      title: 'Record Reality Snapshot',
      description: `Save complete phase-space state at tick #${currentTick} (Ctrl+S)`,
      category: 'PERSISTENCE',
      icon: Camera,
      action: () => captureSnapshot(`Console Snapshot @ Tick ${currentTick}`),
    },
    {
      id: 'pers-export',
      title: 'Export Reality Matrix (.JSON)',
      description: 'Save full reality state file to desktop or download directory',
      category: 'PERSISTENCE',
      icon: Camera,
      action: exportRealityMatrix,
    },
  ];

  const filtered = commands.filter((c) => {
    if (!query) return true;
    return (
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsConsoleOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setIsConsoleOpen(false);
      }
    }
  };

  if (!isConsoleOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsConsoleOpen(false)}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxHeight: '480px',
          padding: '1.25rem',
          border: '1px solid var(--color-cyan)',
          boxShadow: '0 0 35px rgba(0, 240, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 240, 255, 0.4)',
          }}
        >
          <Terminal size={17} color="var(--color-cyan)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, intervention, or navigation target..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
            ESC to close
          </span>
        </div>

        {/* Command Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', flex: 1, maxHeight: '340px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              NO MATCHING COMMANDS FOUND
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsConsoleOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px',
                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Icon size={15} color={isSelected ? 'var(--color-cyan)' : '#64748b'} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-tech)', fontWeight: 600, color: '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <span className="badge-tech" style={{ fontSize: '0.58rem' }}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
