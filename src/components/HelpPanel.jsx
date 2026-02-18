import React, { useState, useEffect } from 'react';
import ResizablePanel from './ResizablePanel';
import {
  MousePointer, Move, ZoomIn, ZoomOut, RotateCcw,
  Trash2, Table2, FileUp, Sliders, Zap,
  Download, HelpCircle, X, ChevronRight, Info, BarChart2,
  FileText, Clock, FileDown, Copy
} from 'lucide-react';

// ... (skipping unchanged code) ...

<div className="space-y-3">
  <h4 className="text-xs font-bold text-[var(--text-4)] uppercase">Export</h4>
  <ul className="space-y-2 text-xs">
    <li className="flex items-center gap-3">
      <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Download size={14} /></div>
      <span><strong>Download PNG:</strong> Save the current chart as an image.</span>
    </li>
    <li className="flex items-center gap-3">
      <div className="p-1.5 rounded bg-[var(--surface-bg)]"><FileDown size={14} /></div>
      <span><strong>Export CSV:</strong> Download the processed/transformed data.</span>
    </li>
    <li className="flex items-center gap-3">
      <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Table2 size={14} /></div>
      <span><strong>Data Table:</strong> View data grid.</span>
    </li>
    <li className="flex items-center gap-3">
      <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Copy size={14} /></div>
      <span><strong>Copy:</strong> Copy data to clipboard (from Data Table).</span>
    </li>
  </ul>
</div>

const HelpContent = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col font-sans" style={{ color: 'var(--text-1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--panel-bg)' }}>
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-[var(--accent)]" />
          <h2 className="text-sm font-bold uppercase tracking-wide">Documentation & Guide</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--active-bg)] transition-colors"
          style={{ color: 'var(--text-4)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* 1. Introduction / Getting Started */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-1)]">
              <Info size={16} className="text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-1)]">Getting Started</h3>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-3)]">
              <strong>SciGraph</strong> is a lightweight scientific visualization tool designed for quick data analysis.
              It runs entirely in your browser—your data never leaves your device.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-1)]">
                <div className="flex items-center gap-2 mb-2 font-semibold text-[var(--text-1)]">
                  <FileUp size={16} /> 1. Import Data
                </div>
                <p className="text-xs text-[var(--text-3)] leading-relaxed">
                  Upload a <strong>CSV</strong> or <strong>Excel</strong> file via the sidebar panel.
                  You can also drag & drop files directly onto the window.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-1)]">
                <div className="flex items-center gap-2 mb-2 font-semibold text-[var(--text-1)]">
                  <Sliders size={16} /> 2. Configure Axes
                </div>
                <p className="text-xs text-[var(--text-3)] leading-relaxed">
                  Select which columns to plot on the <strong>X</strong> and <strong>Y</strong> axes using the dropdowns above the graph.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-1)]">
                <div className="flex items-center gap-2 mb-2 font-semibold text-[var(--text-1)]">
                  <Zap size={16} /> 3. Analyze
                </div>
                <p className="text-xs text-[var(--text-3)] leading-relaxed">
                  Select a region on the graph, then choose a <strong>calculation method</strong> (e.g., Linear Regression) from the Analysis panel to compute results.
                </p>
              </div>
            </div>
          </section>

          {/* 1.5 Dataset Management */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-1)]">
              <Table2 size={16} className="text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-1)]">Dataset Management</h3>
            </div>
            <ul className="space-y-3 text-xs text-[var(--text-3)]">
              <li className="flex gap-3">
                <div className="p-1.5 rounded bg-[var(--surface-bg)] shrink-0"><FileText size={14} /></div>
                <div>
                  <strong className="text-[var(--text-2)]">Hot Swapping:</strong> Switching between datasets automatically updates the graph. If column names match, the view is preserved; otherwise, it resets to default axes.
                </div>
              </li>
              <li className="flex gap-3">
                <div className="p-1.5 rounded bg-[var(--surface-bg)] shrink-0"><Clock size={14} /></div>
                <div>
                  <strong className="text-[var(--text-2)]">Recent Files:</strong> The sidebar keeps track of your last 10 datasets.
                </div>
              </li>
              <li className="flex gap-3">
                <div className="p-1.5 rounded bg-[var(--surface-bg)] shrink-0"><Trash2 size={14} /></div>
                <div>
                  <strong className="text-[var(--text-2)]">Manage History:</strong> Hover over a recent file and click the <Trash2 size={10} className="inline mx-1" /> icon to remove it from the list.
                </div>
              </li>
            </ul>
          </section>

          {/* 2. Data Transformation */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-1)]">
              <Sliders size={16} className="text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-1)]">Data Transformation</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <p className="text-xs leading-relaxed text-[var(--text-3)]">
                  Use the <strong>dropdown menus in the top toolbar</strong> (next to the X/Y Axis selectors) to transform your data on the fly.
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-3)]">
                  <li className="flex gap-2">
                    <ChevronRight size={14} className="text-[var(--accent)] shrink-0" />
                    <span><strong>Single Column:</strong> Apply functions like <code>ln(x)</code>, <code>1/x</code>, or <code>x²</code> directly.</span>
                  </li>
                  <li className="flex gap-2">
                    <ChevronRight size={14} className="text-[var(--accent)] shrink-0" />
                    <span><strong>Two Columns:</strong> Combine columns (e.g., <code>A / B</code>) by selecting a second column in the prompt.</span>
                  </li>
                  <li className="flex gap-2">
                    <ChevronRight size={14} className="text-[var(--accent)] shrink-0" />
                    <span><strong>Chaining:</strong> Use the "Wrap" dropdown to apply a second function to the result (e.g., <code>ln(a + b)</code>).</span>
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-64 p-3 rounded bg-[var(--app-bg)] border border-[var(--border-1)] text-[11px] font-mono text-[var(--text-4)]">
                <div className="mb-1 text-[var(--text-2)] font-bold">Example: Arrhenius Plot</div>
                <div className="pl-2 border-l-2 border-[var(--accent)]">
                  <div>X-Axis: 1 / T (Temperature)</div>
                  <div>Y-Axis: ln(k) (Rate Constant)</div>
                  <div className="mt-2 text-[var(--accent)]">Result: Linear slope = -Ea/R</div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Controls & Shortcuts (Grid) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-1)]">
              <MousePointer size={16} className="text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-1)]">Controls</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Controls */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-4)] uppercase">Zoom</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><ZoomIn size={14} /></div>
                    <span>Zoom In (+)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><ZoomOut size={14} /></div>
                    <span>Zoom Out (-)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-4)] uppercase">Interaction</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><MousePointer size={14} /></div>
                    <span>Click & Drag to select region</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><RotateCcw size={14} /></div>
                    <span>Click Reset Button to reset view</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Trash2 size={14} /></div>
                    <span>Click Trash to Clear Selection</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Move size={14} /></div>
                    <span>Arrow Keys / Buttons for inputs</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-4)] uppercase">Export</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Download size={14} /></div>
                    <span><strong>Download PNG:</strong> Save current chart as image</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><FileDown size={14} /></div>
                    <span><strong>Export CSV:</strong> Download processed data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-[var(--surface-bg)]"><Table2 size={14} /></div>
                    <span><strong>Data Table:</strong> View & Copy data</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Chart Types */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-1)]">
              <BarChart2 size={16} className="text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-1)]">Chart Types</h3>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-3)]">
              Use the dropdown menu in the toolbar to switch between visualization styles:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-[var(--text-3)]">
              <div className="p-2 rounded bg-[var(--surface-bg)] border border-[var(--border-1)] text-center">
                <strong>Line Only</strong>
                <div className="text-[10px] text-[var(--text-4)] mt-1">Clean trend view</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface-bg)] border border-[var(--border-1)] text-center">
                <strong>Line + Dots</strong>
                <div className="text-[10px] text-[var(--text-4)] mt-1">Best for small datasets</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface-bg)] border border-[var(--border-1)] text-center">
                <strong>Scatter</strong>
                <div className="text-[10px] text-[var(--text-4)] mt-1">Correlation / Noise</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface-bg)] border border-[var(--border-1)] text-center">
                <strong>Area</strong>
                <div className="text-[10px] text-[var(--text-4)] mt-1">Volume / Accumulation</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface-bg)] border border-[var(--border-1)] text-center">
                <strong>Step</strong>
                <div className="text-[10px] text-[var(--text-4)] mt-1">Discrete changes</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface-bg)] border border-[var(--border-1)] text-center">
                <strong>Bar Chart</strong>
                <div className="text-[10px] text-[var(--text-4)] mt-1">Categorical comparison</div>
              </div>
            </div>
          </section>

        </div>
      </div >
    </div >
  );
};

const HelpPanel = ({ onClose }) => {
  // Initial height: 80% of screen height
  const [height, setHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <ResizablePanel
        height={height}
        setHeight={setHeight}
        minHeight={150}
        maxHeight={typeof window !== 'undefined' ? window.innerHeight * 0.9 : 800}
        onClose={onClose}
        mode="fixed"
        className="z-50 border-t border-[var(--border-1)] shadow-2xl"
      >
        <HelpContent onClose={onClose} />
      </ResizablePanel>
    </>
  );
};

export default HelpPanel;
