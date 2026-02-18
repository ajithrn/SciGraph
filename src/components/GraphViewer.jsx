import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import ChartFactory, { CHART_TYPES } from './ChartFactory';
import ProcessedDataViewer from './ProcessedDataViewer';
import { getTransforms, buildProcessedData, getTransformById } from '../analysis/transforms';
import { ZoomIn, ZoomOut, RotateCcw, Download, HelpCircle, X, Trash2, Table2, Maximize2, Minimize2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.1;

const allTransforms = getTransforms();
// Unary transforms only (for the outer/wrap dropdown)
const unaryTransforms = allTransforms.filter(t => !t.needsSecondColumn);

const GraphViewer = () => {
  const { state, dispatch, actions, activeDataset } = useData();
  const { activeGraphConfig, selectedRegion } = state;
  const [showHelp, setShowHelp] = useState(false);
  const [showData, setShowData] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const chartRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionCurrent, setSelectionCurrent] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const isZoomed = zoomLevel > 1;

  // Measure scroll container width for pixel-based zoom
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Build processed data with transforms ──
  const processed = useMemo(() => {
    if (!activeDataset) return null;
    return buildProcessedData(
      activeDataset.data,
      activeGraphConfig.xAxis,
      activeGraphConfig.yAxis,
      activeGraphConfig.xTransform,
      activeGraphConfig.yTransform
    );
  }, [activeDataset, activeGraphConfig.xAxis, activeGraphConfig.yAxis, activeGraphConfig.xTransform, activeGraphConfig.yTransform]);

  const hasTransform = activeGraphConfig.xTransform || activeGraphConfig.yTransform;

  // ── Zoom ──
  const zoomIn = useCallback(() => {
    // Force measure width before zoom to ensure we have a valid base width
    if (scrollContainerRef.current && scrollContainerRef.current.clientWidth > 0) {
      setContainerWidth(scrollContainerRef.current.clientWidth);
    }
    setZoomLevel(prev => {
      const next = Math.min(+(prev + ZOOM_STEP).toFixed(1), ZOOM_MAX);
      setTimeout(() => {
        const el = scrollContainerRef.current;
        if (el && next > 1) {
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
          el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
        }
      }, 50);
      return next;
    });
  }, []);
  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(+(prev - ZOOM_STEP).toFixed(1), ZOOM_MIN));
  }, []);
  const resetZoom = useCallback(() => setZoomLevel(1), []);

  const downloadChart = useCallback(async () => {
    if (!chartRef.current || !activeDataset) return;
    try {
      // Temporarily switch to light theme for paper-ready export
      const root = document.documentElement;
      const originalTheme = root.getAttribute('data-theme');
      root.setAttribute('data-theme', 'light');
      // Force a style recalc so CSS variables update
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      const canvas = await html2canvas(chartRef.current, { backgroundColor: '#ffffff', scale: 2 });

      // Restore original theme
      root.setAttribute('data-theme', originalTheme || 'dark');

      const link = document.createElement('a');
      link.download = `${activeDataset.name.replace(/\.[^/.]+$/, '')}_chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error('Download failed:', err); }
  }, [activeDataset]);

  // ── Transform dispatchers ──
  const updateAxisTransform = (axis, updates) => {
    const key = axis === 'x' ? 'xTransform' : 'yTransform';
    const current = activeGraphConfig[key];
    dispatch({ type: actions.UPDATE_GRAPH_CONFIG, payload: { [key]: updates === null ? null : { ...current, ...updates } } });
  };

  const setTransformId = (axis, id) => {
    if (!id) { updateAxisTransform(axis, null); return; }
    const current = axis === 'x' ? activeGraphConfig.xTransform : activeGraphConfig.yTransform;
    updateAxisTransform(axis, { id, secondColumn: current?.secondColumn, outer: current?.outer });
  };
  const setSecondColumn = (axis, col) => updateAxisTransform(axis, { secondColumn: col });
  const setOuterTransform = (axis, outer) => {
    const key = axis === 'x' ? 'xTransform' : 'yTransform';
    const current = activeGraphConfig[key];
    updateAxisTransform(axis, { ...current, outer: outer || undefined });
  };

  // ── Empty state ──
  if (!activeDataset) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4" style={{ color: 'var(--text-4)' }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-1)' }}>
          <span className="text-xl opacity-30">📊</span>
        </div>
        <p className="text-xs font-medium">Import a dataset to get started</p>
      </div>
    );
  }

  // ── Chart event handlers ──
  const handleMouseDown = (e) => {
    if (e && e.activeLabel !== undefined) { setSelectionStart(e.activeLabel); setIsSelecting(true); }
  };
  const handleMouseMove = (e) => {
    if (isSelecting && e && e.activeLabel !== undefined) setSelectionCurrent(e.activeLabel);
  };
  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionCurrent !== null) {
      const s = Math.min(selectionStart, selectionCurrent), end = Math.max(selectionStart, selectionCurrent);
      if (s !== end) dispatch({ type: actions.SET_SELECTED_REGION, payload: { start: s, end } });
    }
    setIsSelecting(false); setSelectionStart(null); setSelectionCurrent(null);
  };

  const chartConfig = {
    ...activeGraphConfig,
    xAxis: processed?.xKey || activeGraphConfig.xAxis,
    yAxis: processed?.yKey || activeGraphConfig.yAxis,
    zoomDomain: null,
    zoomLevel,
    selectedRegion: isSelecting && selectionStart !== null && selectionCurrent !== null
      ? { start: Math.min(selectionStart, selectionCurrent), end: Math.max(selectionStart, selectionCurrent) }
      : selectedRegion,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };

  const xDef = activeGraphConfig.xTransform ? getTransformById(activeGraphConfig.xTransform.id) : null;
  const yDef = activeGraphConfig.yTransform ? getTransformById(activeGraphConfig.yTransform.id) : null;

  // ── Reusable toolbar components ──
  const Btn = ({ onClick, active, title, disabled, children }) => (
    <button
      className="px-1.5 py-1 rounded transition-colors"
      style={{
        color: active ? 'var(--accent)' : disabled ? 'var(--border-2)' : 'var(--text-4)',
        background: active ? 'var(--accent-surface)' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
      onClick={disabled ? undefined : onClick}
      title={title}
    >{children}</button>
  );

  const SmallSelect = ({ value, onChange, options, highlight, title, placeholder }) => (
    <select
      className="bg-transparent text-[11px] outline-none font-mono cursor-pointer rounded px-1 py-0.5"
      style={{
        color: highlight ? 'var(--accent)' : 'var(--text-4)',
        background: highlight ? 'var(--accent-surface)' : 'transparent',
        border: `1px solid ${highlight ? 'rgba(59,130,246,0.3)' : 'var(--border-2)'}`,
      }}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      title={title}
    >
      <option value="" style={{ background: 'var(--panel-bg)' }}>{placeholder || 'none'}</option>
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: 'var(--panel-bg)' }}>{o.label}</option>
      ))}
    </select>
  );

  const transformOptions = allTransforms.map(t => ({ value: t.id, label: t.label }));
  const outerOptions = unaryTransforms.map(t => ({ value: t.id, label: t.label }));

  // Build axis selector + transform chain UI for one axis
  const AxisBlock = ({ axis, axisLabel, col, transformConfig }) => {
    const def = transformConfig ? getTransformById(transformConfig.id) : null;
    return (
      <div className="flex items-center gap-1">
        <span className="text-[11px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-4)' }}>{axisLabel}</span>
        <select
          className="bg-transparent text-xs outline-none font-mono cursor-pointer"
          style={{ color: 'var(--text-2)' }}
          value={col}
          onChange={(e) => dispatch({ type: actions.UPDATE_GRAPH_CONFIG, payload: { [axis + 'Axis']: e.target.value } })}
        >
          {activeDataset.headers.map(h => <option key={h} value={h} style={{ background: 'var(--panel-bg)' }}>{h}</option>)}
        </select>
        <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>→</span>
        <SmallSelect
          value={transformConfig?.id}
          onChange={(id) => setTransformId(axis, id)}
          options={transformOptions}
          highlight={!!transformConfig?.id}
          title={`Transform for ${axisLabel} axis`}
          placeholder="f(x)"
        />
        {/* Second column picker for multiply */}
        {def?.needsSecondColumn && (
          <SmallSelect
            value={transformConfig?.secondColumn}
            onChange={(col) => setSecondColumn(axis, col)}
            options={activeDataset.headers.filter(h => h !== col).map(h => ({ value: h, label: h }))}
            highlight={!!transformConfig?.secondColumn}
            title="Second column"
            placeholder="col…"
          />
        )}
        {/* Outer wrap transform (e.g. ln of a×b) */}
        {transformConfig?.id && (
          <>
            <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>→</span>
            <SmallSelect
              value={transformConfig?.outer}
              onChange={(id) => setOuterTransform(axis, id)}
              options={outerOptions}
              highlight={!!transformConfig?.outer}
              title={`Wrap with function (e.g. ln of result)`}
              placeholder="wrap"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ═══ Row 1: Plotting options (axis + transforms) ═══ */}
      <div className="shrink-0 z-10 h-10 flex items-center gap-3 px-3"
        style={{ background: 'var(--panel-bg)', borderBottom: '1px solid var(--border-1)' }}>
        <AxisBlock axis="x" axisLabel="X" col={activeGraphConfig.xAxis} transformConfig={activeGraphConfig.xTransform} />
        <div style={{ width: '1px', height: '16px', background: 'var(--border-2)' }} />
        <AxisBlock axis="y" axisLabel="Y" col={activeGraphConfig.yAxis} transformConfig={activeGraphConfig.yTransform} />
        {hasTransform && (
          <span className="ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-surface)', color: 'var(--accent)' }}>
            Transformed
          </span>
        )}
      </div>

      {/* ═══ Row 2: Controls (zoom, chart type, download, help) ═══ */}
      <div className="shrink-0 z-10 h-10 flex items-center gap-2 px-3"
        style={{ background: 'var(--panel-bg)', borderBottom: '1px solid var(--border-1)' }}>
        <Btn title="Zoom In" onClick={zoomIn} disabled={zoomLevel >= ZOOM_MAX}><ZoomIn size={13} /></Btn>
        <Btn title="Zoom Out" onClick={zoomOut} disabled={zoomLevel <= ZOOM_MIN}><ZoomOut size={13} /></Btn>
        <Btn title="Reset Zoom" onClick={resetZoom} disabled={!isZoomed}><RotateCcw size={12} /></Btn>
        {isZoomed && <span className="text-[11px] font-mono" style={{ color: 'var(--accent)' }}>{zoomLevel.toFixed(1)}×</span>}

        <div style={{ width: '1px', height: '14px', background: 'var(--border-2)', margin: '0 2px' }} />

        {/* Chart type selector */}
        <select
          value={activeGraphConfig.chartType || 'line'}
          onChange={e => dispatch({ type: actions.UPDATE_GRAPH_CONFIG, payload: { chartType: e.target.value } })}
          className="text-[11px] font-mono px-1.5 py-0.5 rounded outline-none cursor-pointer"
          style={{ background: 'var(--surface-bg)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}
          title="Chart Type"
        >
          {CHART_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-2)', margin: '0 2px' }} />

        <Btn title="View Processed Data" onClick={() => setShowData(!showData)} active={showData} disabled={!hasTransform && !showData}>
          <Table2 size={13} />
        </Btn>
        <Btn title="Download as PNG" onClick={downloadChart}><Download size={13} /></Btn>
        <Btn title="Clear Selection" onClick={() => dispatch({ type: actions.SET_SELECTED_REGION, payload: null })} disabled={!selectedRegion}>
          <Trash2 size={12} />
        </Btn>
        <Btn active={showHelp} title="Help" onClick={() => setShowHelp(!showHelp)}><HelpCircle size={13} /></Btn>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-2)', margin: '0 2px' }} />

        <Btn title={state.fullWidth ? 'Exit Full Width' : 'Full Width'} active={state.fullWidth}
          onClick={() => dispatch({ type: actions.TOGGLE_FULL_WIDTH })}>
          {state.fullWidth ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </Btn>

        {(isZoomed || selectedRegion) && (
          <div className="ml-auto flex items-center gap-2 text-[11px] font-mono" style={{ color: 'var(--text-4)' }}>
            {isZoomed && <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-surface)', color: 'var(--accent)' }}>Scroll to pan</span>}
            {selectedRegion && <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-surface)', color: 'var(--success)' }}>Region</span>}
          </div>
        )}
      </div>

      {/* ═══ Chart ═══ */}
      <div ref={scrollContainerRef}
        className="flex-1 w-full"
        style={{
          cursor: isZoomed ? 'grab' : 'crosshair',
          overflow: isZoomed ? 'auto' : 'hidden',
          padding: '16px',
        }}>
        <div ref={chartRef} style={{
          width: isZoomed ? `${containerWidth * zoomLevel}px` : '100%',
          maxWidth: isZoomed ? 'none' : '900px',
          aspectRatio: '16 / 10',
          margin: isZoomed ? undefined : '0 auto',
        }}>
          <ChartFactory data={processed?.data || activeDataset.data} config={chartConfig} />
        </div>
      </div>

      {/* Processed Data Table */}
      {showData && processed && (
        <ProcessedDataViewer data={processed.data} xKey={processed.xKey} yKey={processed.yKey} onClose={() => setShowData(false)} />
      )}

      {/* Help */}
      {showHelp && (
        <div className="shrink-0 px-4 py-3 text-xs leading-relaxed overflow-y-auto"
          style={{ background: 'var(--panel-bg)', borderTop: '1px solid var(--border-1)', color: 'var(--text-3)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div><strong style={{ color: 'var(--text-2)' }}>Axes:</strong> Choose X and Y columns from the dropdowns.</div>
              <div><strong style={{ color: 'var(--text-2)' }}>Chart Type:</strong> Switch between Line, Line+Dots, Scatter, Area, Step, and Bar from the toolbar dropdown.</div>
              <div><strong style={{ color: 'var(--text-2)' }}>Transform:</strong> Pick a function from <strong>f(x)</strong>. For <code>a × b</code>, pick the second column. Chain transforms with the <strong>wrap</strong> dropdown (e.g. <code>ln(a×b)</code>).</div>
              <div><strong style={{ color: 'var(--text-2)' }}>Zoom:</strong> Use the zoom buttons to magnify. Scroll to pan. Reset with the ↻ button.</div>
              <div><strong style={{ color: 'var(--text-2)' }}>Select Region:</strong> Click and drag on the graph to highlight a region for analysis.</div>
              <div><strong style={{ color: 'var(--text-2)' }}>Full Width:</strong> Toggle the expand button to hide sidebars and maximize the chart.</div>
              <div><strong style={{ color: 'var(--text-2)' }}>Data Table:</strong> View processed values with the table icon.</div>
            </div>
            <button onClick={() => setShowHelp(false)} className="shrink-0 p-1 rounded" style={{ color: 'var(--text-4)' }}><X size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphViewer;
