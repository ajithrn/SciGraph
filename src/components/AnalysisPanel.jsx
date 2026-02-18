import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { getAnalysisModules, calculateLinearRegression } from '../analysis/registry';
import { applyTransform } from '../analysis/transforms';
import { Sliders, Zap, HelpCircle, Minus, Plus } from 'lucide-react';

const NumberInput = ({ value, onChange, min, max, step = 1, unit, placeholder }) => {
  const val = value === '' || value === undefined ? '' : parseFloat(value);

  const update = (newValue) => {
    let n = newValue;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    // Round to avoid float errors (approximate to step precision)
    n = Math.round(n * 10000000000) / 10000000000;
    onChange(n);
  };

  const increment = () => update((typeof val === 'number' ? val : 0) + Number(step));
  const decrement = () => update((typeof val === 'number' ? val : 0) - Number(step));

  return (
    <div className="flex items-center rounded overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-1)', background: 'var(--surface-bg)' }}>
      <button
        className="px-1.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90"
        style={{ color: 'var(--text-3)' }}
        onClick={decrement}
      >
        <Minus size={10} />
      </button>
      <input
        type="number"
        className="w-14 px-1 py-1.5 text-xs font-mono text-center outline-none bg-transparent appearance-none no-spinner"
        style={{ color: 'var(--text-1)' }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'ArrowUp') { e.preventDefault(); increment(); }
          if (e.key === 'ArrowDown') { e.preventDefault(); decrement(); }
        }}
        step={step}
        min={min}
        max={max}
      />
      <button
        className="px-1.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90"
        style={{ color: 'var(--text-3)' }}
        onClick={increment}
      >
        <Plus size={10} />
      </button>
      {unit && (
        <span className="px-1.5 py-1.5 text-[10px] font-mono border-l border-[var(--border-2)]"
          style={{ background: 'var(--app-bg)', color: 'var(--text-4)' }}>
          {unit}
        </span>
      )}
    </div>
  );
};

const AnalysisPanel = () => {
  const { state, activeDataset, dispatch, actions } = useData();
  const { selectedRegion, activeGraphConfig } = state;
  const [analysisResults, setAnalysisResults] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const modules = getAnalysisModules();

  useEffect(() => {
    if (!selectedModuleId && modules.length > 0) setSelectedModuleId(modules[0].id);
  }, [modules, selectedModuleId]);

  useEffect(() => {
    if (activeDataset && selectedRegion) {
      const xKey = activeGraphConfig.xAxis;
      const yKey = activeGraphConfig.yAxis;
      const xTfm = activeGraphConfig.xTransform;
      const yTfm = activeGraphConfig.yTransform;

      // Get transformed values (or raw if no transform)
      const { values: xVals } = applyTransform(activeDataset.data, xKey, xTfm);
      const { values: yVals } = applyTransform(activeDataset.data, yKey, yTfm);

      // Build paired data points in the transformed domain
      const regionData = xVals
        .map((x, i) => ({ x, y: yVals[i] }))
        .filter(p =>
          !isNaN(p.x) && !isNaN(p.y) &&
          p.x >= selectedRegion.start && p.x <= selectedRegion.end
        );

      const regression = calculateLinearRegression(regionData);
      // Replace state to clear previous Calculation results when data/region changes
      setAnalysisResults({ linear_regression: regression, regionData });
    } else {
      setAnalysisResults({ linear_regression: null, regionData: null });
    }
  }, [activeDataset, selectedRegion, activeGraphConfig]);

  if (!activeDataset) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
      <div className="p-3 rounded-xl" style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-1)' }}>
        <Sliders size={20} strokeWidth={1.5} style={{ color: 'var(--text-4)' }} />
      </div>
      <p className="text-xs" style={{ color: 'var(--text-4)' }}>Select a dataset to begin analysis.</p>
    </div>
  );

  const handleSelectAll = () => {
    const xKey = activeGraphConfig.xAxis;
    const xTfm = activeGraphConfig.xTransform;
    const { values: xVals } = applyTransform(activeDataset.data, xKey, xTfm);

    // Filter out NaNs/nulls to get valid range
    const validX = xVals.filter(x => x !== null && x !== undefined && !isNaN(x));
    if (validX.length === 0) return;

    const min = Math.min(...validX);
    const max = Math.max(...validX);

    dispatch({ type: actions.SET_SELECTED_REGION, payload: { start: min, end: max } });
  };

  const handleCalculate = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    const inputs = inputValues[moduleId] || {};
    const slope = analysisResults.linear_regression?.slope;
    const regionData = analysisResults.regionData;

    const result = module.calculate(activeDataset.data, inputs, { slope, regionData });
    setAnalysisResults(prev => ({ ...prev, [moduleId]: result }));
  };

  const handleInputChange = (moduleId, inputId, value) => {
    // Determine if we should parse as float or keep as string
    // Simplified check: if it parses to a valid number and doesn't look like a string ID (like 'moving_average'), stick with float. 
    // Better: check against the module definition, but looking up module is expensive here. 
    // Heuristic: if it's not a number string, keep as string.
    const isNumber = !isNaN(parseFloat(value)) && isFinite(value);

    // Actually, we should check the module definition to be safe, or just store everything as string and parse in calculate().
    // The previous implementation used parseFloat(value). 
    // Let's rely on the input type from the event if possible, but React onChange generic doesn't always give it.
    // Safe bet: if value matches one of the known select options (string), keep string.

    // For now, let's just store the value as-is if it's a string from a select (which we can infer if parseFloat returns NaN).
    // But 'moving_average' parses to NaN. Perfect.

    const parsed = isNumber ? parseFloat(value) : value;

    setInputValues(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [inputId]: parsed }
    }));
  };

  const activeModule = modules.find(m => m.id === selectedModuleId);
  const regression = analysisResults.linear_regression;

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 px-4 flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--panel-bg)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Analysis</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Method ── */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: 'var(--text-4)' }}>Method</label>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>Select the appropriate equation or model to apply to your data.</p>
          <div className="relative">
            <select
              className="w-full rounded-md py-2 px-3 text-xs outline-none appearance-none cursor-pointer transition-colors"
              style={{ background: 'var(--app-bg)', border: '1px solid var(--border-1)', color: 'var(--text-1)' }}
              value={selectedModuleId || ''}
              onChange={(e) => { setSelectedModuleId(e.target.value); setShowHelp(false); }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
            >
              {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
            </div>
          </div>

          {activeModule && (
            <div className="rounded-md p-3 space-y-3" style={{ border: '1px solid var(--border-1)', background: 'var(--surface-bg)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{activeModule.description}</p>

              {/* Formula card - Only show if module provides renderInfo */}
              {activeModule.renderInfo && (
                <div className="p-2.5 rounded" style={{ background: 'var(--app-bg)', border: '1px solid var(--border-1)' }}>
                  {activeModule.renderInfo(regression)}
                </div>
              )}

              {/* Inline help toggle */}
              {activeModule.help && (
                <button
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle size={11} /> {showHelp ? 'Hide' : 'Show'} workflow guide
                </button>
              )}

              {showHelp && activeModule.help && (
                <div className="text-xs leading-relaxed p-2.5 rounded" style={{ color: 'var(--text-3)', background: 'var(--app-bg)', border: '1px solid var(--border-1)' }}>
                  {activeModule.help}
                </div>
              )}
            </div>
          )}
        </div>

        {!selectedRegion ? (
          <div className="space-y-3 p-4 rounded-lg text-center" style={{ background: 'var(--surface-bg)', border: '1px dashed var(--border-2)' }}>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              No region selected. Please select a range on the graph to analyze.
            </p>
            <div className="text-[10px] font-bold uppercase tracking-widest my-1 opacity-60" style={{ color: 'var(--text-4)', fontSize: '9px' }}>— OR —</div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
              style={{ background: 'var(--app-bg)', border: '1px solid var(--border-1)', color: 'var(--text-1)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
            >
              Select All Data
            </button>
          </div>
        ) : (
          <>
            {/* ── Parameters ── */}
            {activeModule && (activeModule.inputs.length > 0 || activeModule.required_analysis?.includes('linear_regression')) && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: 'var(--text-4)' }}>Parameters</label>

                <div className="space-y-3 rounded-lg p-4" style={{ background: 'var(--app-bg)', border: '1px solid var(--border-1)' }}>
                  {activeModule.inputs.map(input => (
                    <div key={input.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs truncate" title={input.description || input.name} style={{ color: 'var(--text-2)' }}>{input.name}</label>
                        <div className="flex items-center gap-0">
                          {input.type === 'select' ? (
                            <div className="relative">
                              <select
                                className="w-32 rounded px-2 py-1.5 text-xs font-mono outline-none appearance-none cursor-pointer transition-colors"
                                style={{
                                  background: 'var(--surface-bg)',
                                  border: '1px solid var(--border-1)',
                                  color: 'var(--text-1)',
                                  paddingRight: '1.5rem'
                                }}
                                value={inputValues[activeModule.id]?.[input.id] || input.defaultValue || ''}
                                onChange={(e) => handleInputChange(activeModule.id, input.id, e.target.value)}
                                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
                              >
                                {input.options?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }}>
                                <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L5 5L9 1" /></svg>
                              </div>
                            </div>
                          ) : (
                            <NumberInput
                              value={inputValues[activeModule.id]?.[input.id] ?? (input.defaultValue ?? '')}
                              onChange={(val) => handleInputChange(activeModule.id, input.id, val)}
                              min={input.min}
                              max={input.max}
                              step={input.step || 1}
                              unit={input.unit}
                              placeholder={input.defaultValue}
                            />
                          )}
                        </div>
                      </div>
                      {input.description && (
                        <p className="text-xs pl-0.5" style={{ color: 'var(--text-4)' }}>{input.description}</p>
                      )}
                    </div>
                  ))}

                  {/* Slope (auto-computed) - Only show if required by the module */}
                  {activeModule.required_analysis?.includes('linear_regression') && (
                    <div className="pt-3 space-y-1" style={{ borderTop: activeModule.inputs.length > 0 ? '1px dashed var(--border-1)' : 'none' }}>
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs decoration-dotted underline cursor-help" style={{ color: 'var(--text-3)', textDecorationColor: 'var(--border-2)' }} title="Auto-calculated via least-squares regression from your graph selection">Slope (B)</label>
                        <div className="px-2 py-1.5 text-xs font-mono rounded w-24 text-right"
                          style={{
                            background: 'var(--surface-bg)',
                            border: '1px solid var(--border-1)',
                            color: regression ? 'var(--accent)' : 'var(--text-4)',
                            fontStyle: regression ? 'normal' : 'italic',
                          }}>
                          {regression ? regression.slope.toExponential(3) : '—'}
                        </div>
                      </div>
                      {regression && (
                        <div className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
                          R² = {regression.rSquared.toFixed(4)} · intercept = {regression.intercept.toExponential(2)}
                        </div>
                      )}
                      {!regression && (
                        <p className="text-xs" style={{ color: 'var(--text-4)' }}>Drag on the graph to select a region — slope is auto-calculated.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Action ── */}
            {activeModule && (
              <div className="space-y-4">
                <button
                  className="w-full py-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide transition-all active:scale-[0.98]"
                  style={{
                    background: (regression || !activeModule.required_analysis?.includes('linear_regression')) ? 'var(--accent)' : 'var(--surface-bg)',
                    color: (regression || !activeModule.required_analysis?.includes('linear_regression')) ? 'white' : 'var(--text-4)',
                    cursor: (regression || !activeModule.required_analysis?.includes('linear_regression')) ? 'pointer' : 'not-allowed',
                  }}
                  disabled={activeModule.required_analysis?.includes('linear_regression') && !regression}
                  onClick={() => handleCalculate(activeModule.id)}
                >
                  <Zap size={13} className={(regression || !activeModule.required_analysis?.includes('linear_regression')) ? "fill-current" : ""} /> Calculate
                </button>

                {analysisResults[activeModule.id] && (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-1)', background: 'var(--app-bg)' }}>
                    <div className="px-3 py-1.5 flex justify-between items-center"
                      style={{ background: 'var(--surface-bg)', borderBottom: '1px solid var(--border-1)' }}>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Result</span>
                      {!analysisResults[activeModule.id].error && (
                        <span className="flex h-2 w-2 rounded-full" style={{ background: 'var(--success)', boxShadow: '0 0 6px rgba(16,185,129,0.4)' }}></span>
                      )}
                    </div>

                    <div className="p-4 text-center">
                      {analysisResults[activeModule.id].error ? (
                        <span className="text-xs" style={{ color: 'var(--error)' }}>{analysisResults[activeModule.id].error}</span>
                      ) : activeModule.renderResult ? (
                        activeModule.renderResult(analysisResults[activeModule.id], dispatch)
                      ) : (
                        <div className="space-y-1">
                          <div className="text-2xl font-mono tracking-tight" style={{ color: 'var(--text-1)' }}>
                            {analysisResults[activeModule.id].value.toExponential(4)}
                          </div>
                          <div className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                            {analysisResults[activeModule.id].unit}
                          </div>
                          {analysisResults[activeModule.id].formula && (
                            <div className="text-xs font-mono pt-1" style={{ color: 'var(--text-4)' }}>
                              Formula: {analysisResults[activeModule.id].formula}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div >
  );
};

export default AnalysisPanel;
