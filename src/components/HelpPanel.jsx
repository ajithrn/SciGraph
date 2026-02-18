import React from 'react';
import { X } from 'lucide-react';

const HelpPanel = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-1)]">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Help</span>
        <button onClick={onClose} className="mx-2 p-1 rounded hover:bg-[var(--surface-bg)] transition-colors" style={{ color: 'var(--text-4)' }}>
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
        <div className="space-y-2">
          <div><strong style={{ color: 'var(--text-2)' }}>Axes:</strong> Choose X and Y columns from the dropdowns.</div>
          <div><strong style={{ color: 'var(--text-2)' }}>Chart Type:</strong> Switch between Line, Line+Dots, Scatter, Area, Step, and Bar from the toolbar dropdown.</div>
          <div><strong style={{ color: 'var(--text-2)' }}>Transform:</strong> Pick a function from <strong>f(x)</strong>. For <code>a × b</code>, pick the second column. Chain transforms with the <strong>wrap</strong> dropdown (e.g. <code>ln(a×b)</code>).</div>
          <div><strong style={{ color: 'var(--text-2)' }}>Zoom:</strong> Use the zoom buttons to magnify. Scroll to pan. Reset with the ↻ button.</div>
          <div><strong style={{ color: 'var(--text-2)' }}>Select Region:</strong> Click and drag on the graph to highlight a region for analysis.</div>
          <div><strong style={{ color: 'var(--text-2)' }}>Full Width:</strong> Toggle the expand button to hide sidebars and maximize the chart.</div>
          <div><strong style={{ color: 'var(--text-2)' }}>Data Table:</strong> View processed values with the table icon.</div>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;
