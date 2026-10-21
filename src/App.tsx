import React from 'react';
import { SimulationProvider, useSimulation } from './simulation/simulationStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ObservatoryView } from './components/observatory/ObservatoryView';
import { CommandCenterView } from './components/commandCenter/CommandCenterView';
import { EntityAtlasView } from './components/entityAtlas/EntityAtlasView';
import { AnomalyLabView } from './components/anomalyLab/AnomalyLabView';
import { TemporalLabView } from './components/temporalLab/TemporalLabView';
import { ExperimentWorkbenchView } from './components/experiment/ExperimentWorkbenchView';
import { SignalRoomView } from './components/signalRoom/SignalRoomView';
import { ResearchTreeView } from './components/research/ResearchTreeView';
import { ArchiveView } from './components/archive/ArchiveView';
import { SettingsView } from './components/settings/SettingsView';
import { CommandConsoleModal } from './components/console/CommandConsoleModal';

const WorkspaceRouter: React.FC = () => {
  const { activeWorkspace } = useSimulation();

  return (
    <main
      style={{
        flex: 1,
        minWidth: 0,
        height: 'calc(100vh - 60px)',
        position: 'relative',
        backgroundColor: '#030712',
      }}
    >
      {activeWorkspace === 'command-center' && <CommandCenterView />}
      {activeWorkspace === 'observatory' && <ObservatoryView />}
      {activeWorkspace === 'entity-atlas' && <EntityAtlasView />}
      {activeWorkspace === 'anomaly-lab' && <AnomalyLabView />}
      {activeWorkspace === 'temporal-lab' && <TemporalLabView />}
      {activeWorkspace === 'experiment-workbench' && <ExperimentWorkbenchView />}
      {activeWorkspace === 'signal-room' && <SignalRoomView />}
      {activeWorkspace === 'research-tree' && <ResearchTreeView />}
      {activeWorkspace === 'archive' && <ArchiveView />}
      {activeWorkspace === 'settings' && <SettingsView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: '#030712',
          position: 'relative',
        }}
      >
        {/* CRT Scanline & Subtle Vignette */}
        <div
          className="scanlines-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />

        {/* Global Top Bar */}
        <Header />

        {/* Body Workspace Layout */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar />
          <WorkspaceRouter />
        </div>

        {/* Command Palette Modal */}
        <CommandConsoleModal />
      </div>
    </SimulationProvider>
  );
};

export default App;
