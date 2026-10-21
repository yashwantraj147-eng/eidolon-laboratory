import React, { useState } from 'react';
import {
  Users,
  Compass,
  Zap,
  Shield,
  Activity,
  Boxes,
  Sparkles,
  MapPin,
  Clock,
  Send,
  Wrench,
  Search,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { EntityArchetype, EntityCondition, Entity } from '../../types/simulation';

export const EntityAtlasView: React.FC = () => {
  const {
    entities,
    selectedEntityId,
    setSelectedEntityId,
    currentTick,
    zones,
  } = useSimulation();

  const [archetypeFilter, setArchetypeFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  const filteredEntities = entities.filter((e) => {
    if (archetypeFilter !== 'ALL' && e.archetype !== archetypeFilter) return false;
    if (conditionFilter !== 'ALL' && e.operationalCondition !== conditionFilter) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
      {/* Left Column: Entity Directory & Filters */}
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
            <Users size={16} color="var(--color-cyan)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
              ENTITY ATLAS ({filteredEntities.length} / {entities.length})
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '0.6rem',
          }}
        >
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search entity designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sans)',
              width: '100%',
            }}
          />
        </div>

        {/* Archetype Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.3rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          {['ALL', 'probe', 'synthet', 'harvester', 'archivist', 'chronomancer', 'anomaly-warden'].map((arch) => (
            <button
              key={arch}
              onClick={() => setArchetypeFilter(arch)}
              style={{
                background: archetypeFilter === arch ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: archetypeFilter === arch ? '#00f0ff' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }}
            >
              {arch}
            </button>
          ))}
        </div>

        {/* Entity Card List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '4px',
          }}
        >
          {filteredEntities.map((entity) => {
            const isSelected = entity.id === selectedEntity?.id;
            return (
              <div
                key={entity.id}
                onClick={() => setSelectedEntityId(entity.id)}
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 0, 0, 0.35)',
                  border: isSelected
                    ? '1px solid rgba(0, 240, 255, 0.5)'
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
                        backgroundColor:
                          entity.operationalCondition === 'optimal'
                            ? 'var(--color-emerald)'
                            : entity.operationalCondition === 'critical'
                            ? 'var(--color-rose)'
                            : 'var(--color-amber)',
                      }}
                    />
                    <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                      {entity.name}
                    </span>
                  </div>

                  <span
                    className={`badge-tech ${
                      entity.operationalCondition === 'optimal'
                        ? 'badge-emerald'
                        : entity.operationalCondition === 'critical'
                        ? 'badge-rose'
                        : 'badge-amber'
                    }`}
                  >
                    {entity.operationalCondition}
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
                  <span style={{ textTransform: 'uppercase', color: 'var(--color-cyan)' }}>
                    {entity.archetype}
                  </span>
                  <span>{entity.currentGoal.replace(/_/g, ' ')}</span>
                </div>

                {/* Micro Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '6px' }}>
                  <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
                    <div style={{ width: `${entity.health}%`, height: '100%', backgroundColor: 'var(--color-emerald)' }} />
                  </div>
                  <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
                    <div style={{ width: `${entity.energy}%`, height: '100%', backgroundColor: 'var(--color-cyan)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Deep Inspection Dossier */}
      {selectedEntity ? (
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
          {/* Header Dossier */}
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
                  {selectedEntity.name}
                </h2>
                <span className="badge-tech badge-cyan">{selectedEntity.archetype}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                FACTION: {selectedEntity.affiliation} // ID: {selectedEntity.id}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b' }}>
              <div>POSITION: [{selectedEntity.position.x.toFixed(1)}, {selectedEntity.position.y.toFixed(1)}, {selectedEntity.position.z.toFixed(1)}]</div>
              <div style={{ color: 'var(--color-cyan)', marginTop: '2px' }}>
                TRAVEL: {selectedEntity.totalDistanceTraveled.toFixed(1)}u | DISCOVERIES: {selectedEntity.discoveriesCount}
              </div>
            </div>
          </div>

          {/* Vitals Deck */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#94a3b8' }}>HULL STRUCTURAL INTEGRITY</span>
                <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>{selectedEntity.health}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '6px' }}>
                <div style={{ width: `${selectedEntity.health}%`, height: '100%', backgroundColor: 'var(--color-emerald)', borderRadius: '3px' }} />
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#94a3b8' }}>QUANTUM POWER CORE</span>
                <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{Math.round(selectedEntity.energy)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '6px' }}>
                <div style={{ width: `${selectedEntity.energy}%`, height: '100%', backgroundColor: 'var(--color-cyan)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          {/* Utility AI Weights Engine */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              AUTONOMOUS UTILITY EVALUATION WEIGHTS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(selectedEntity.utilityScores || {}).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                    <span style={{ textTransform: 'uppercase', color: '#e2e8f0' }}>{key}</span>
                    <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{(val * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
                    <div style={{ width: `${Math.min(100, val * 100)}%`, height: '100%', backgroundColor: 'var(--color-cyan)', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Manifest */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.6rem' }}>
              INVENTORY EXTRACTION MANIFEST
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SUBSTRATE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '2px' }}>
                  {selectedEntity.inventory.substrate}u
                </div>
              </div>
              <div style={{ padding: '0.6rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>RESONANCE CRYSTALS</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-purple)', marginTop: '2px' }}>
                  {selectedEntity.inventory.resonanceCrystals}
                </div>
              </div>
              <div style={{ padding: '0.6rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>CHRONAL DUST</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#ec4899', marginTop: '2px' }}>
                  {selectedEntity.inventory.chronalDust}
                </div>
              </div>
            </div>
          </div>

          {/* Episodic Memory Log */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.6rem' }}>
              EPISODIC MEMORY TRACES ({selectedEntity.memories.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
              {selectedEntity.memories.map((mem, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.45rem 0.65rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                    borderLeft: '2px solid var(--color-cyan)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                  }}
                >
                  <span style={{ color: '#cbd5e1' }}>{mem.event}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#64748b' }}>
                    TICK #{mem.tick}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Select an entity to inspect</div>
      )}
    </div>
  );
};
