import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import DataUploader from './components/DataUploader';
import GraphViewer from './components/GraphViewer';
import AnalysisPanel from './components/AnalysisPanel';
import { Sun, Moon } from 'lucide-react';

import { version } from '../package.json';

function StatusBar() {
  const { activeDataset, state } = useData();
  const { activeGraphConfig } = state;
  return (
    <footer className="h-6 shrink-0 flex items-center px-4 text-[11px] select-none justify-between"
      style={{ background: 'var(--panel-bg)', borderTop: '1px solid var(--border-1)', color: 'var(--text-4)' }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeDataset ? 'var(--success)' : 'var(--text-4)' }}></div>
          {activeDataset ? 'Ready' : 'No Data'}
        </span>
        {activeDataset && <span>{activeDataset.name}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span>SciGraph v{version} · Scientific Data Visualization</span>
      </div>
    </footer>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-md transition-colors"
      style={{ color: 'var(--text-3)', background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function AppContent() {
  const { state } = useData();
  const { fullWidth } = state;

  const { theme } = useTheme();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans" style={{ background: 'var(--app-bg)', color: 'var(--text-1)' }}>

      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 shrink-0 z-20"
        style={{ background: 'var(--panel-bg)', borderBottom: '1px solid var(--border-1)' }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="SciGraph Logo"
            className="w-6 h-6 rounded-lg select-none"
          />
          <span className="font-bold tracking-tight text-lg leading-none">
            <span style={{ color: 'var(--accent)' }}>Sci</span>
            <span style={{ color: 'var(--text-1)' }}>Graph</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden" style={{ transition: 'all 0.2s ease' }}>

        {/* Left Sidebar */}
        {!fullWidth && (
          <aside className="flex flex-col shrink-0" style={{ width: 260, background: 'var(--panel-bg)', borderRight: '1px solid var(--border-1)' }}>
            <DataUploader />
          </aside>
        )}

        {/* Main Canvas */}
        <main className="relative flex-1 flex flex-col min-w-0 overflow-auto"
          style={{ background: 'var(--canvas-bg)' }}
        >
          <GraphViewer />
        </main>

        {/* Right Sidebar */}
        {!fullWidth && (
          <aside className="flex flex-col shrink-0 overflow-y-auto" style={{ width: 320, background: 'var(--panel-bg)', borderLeft: '1px solid var(--border-1)' }}>
            <AnalysisPanel />
          </aside>
        )}

      </div>

      <StatusBar />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
