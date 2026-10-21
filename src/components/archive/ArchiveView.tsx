import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Lock,
  Tag,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { ArchiveRecord } from '../../types/simulation';

export const ArchiveView: React.FC = () => {
  const { archiveRecords } = useSimulation();
  const [selectedRecordId, setSelectedRecordId] = useState<string>(archiveRecords[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const selectedRecord = archiveRecords.find((r) => r.id === selectedRecordId) || archiveRecords[0];

  const filteredRecords = archiveRecords.filter((rec) => {
    if (categoryFilter !== 'ALL' && rec.category !== categoryFilter) return false;
    if (
      searchQuery &&
      !rec.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !rec.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
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
      {/* Left Column: Dossier Index */}
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
            <BookOpen size={16} color="var(--color-cyan)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
              CLASSIFIED ARCHIVES ({filteredRecords.length})
            </span>
          </div>
        </div>

        {/* Search */}
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
            placeholder="Search classified records..."
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

        {/* Categories */}
        <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          {['ALL', 'ARTIFACT', 'ANOMALY', 'EXPERIMENT', 'SECRET'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                background: categoryFilter === cat ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: categoryFilter === cat ? '#00f0ff' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {filteredRecords.map((record) => {
            const isSelected = record.id === selectedRecord?.id;

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecordId(record.id)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 0, 0, 0.35)',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid var(--color-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    {record.title}
                  </span>
                  <span className="badge-tech badge-purple" style={{ fontSize: '0.58rem' }}>
                    {record.category}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>
                  {record.summary}
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>
                  DATE: {record.realDate} // DISCOVERED TICK #{record.discoveredAtTick}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Full Classified Dossier View */}
      {selectedRecord ? (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto',
            border: '1px solid rgba(0, 240, 255, 0.25)',
          }}
        >
          {/* Security Clearance Header */}
          <div
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--color-rose)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            <Shield size={16} />
            <span>{selectedRecord.classificationCode}</span>
          </div>

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.6rem',
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              {selectedRecord.title}
            </h2>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#94a3b8',
                marginTop: '4px',
              }}
            >
              DOCUMENT ID: {selectedRecord.id} // DEPOSITORY ENTRY: {selectedRecord.realDate}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {selectedRecord.tags.map((t) => (
              <span key={t} className="badge-tech badge-cyan">
                #{t}
              </span>
            ))}
          </div>

          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />

          {/* Executive Summary */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-cyan)', marginBottom: '4px' }}>
              EXECUTIVE ABSTRACT:
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>
              {selectedRecord.summary}
            </p>
          </div>

          {/* Full Text Document */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#e2e8f0',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {selectedRecord.details}
          </div>
        </div>
      ) : null}
    </div>
  );
};
