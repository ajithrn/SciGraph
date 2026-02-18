import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import {
  Upload, FileText, ChevronDown, ChevronRight, Table, ArrowLeft, Plus, Pencil, Check, Clock, X
} from 'lucide-react';

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const DataUploader = () => {
  const { state, dispatch, actions, activeDataset, recentDatasets, loadRecentDataset } = useData();
  const [isExpanded, setIsExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('explorer');

  const [manualData, setManualData] = useState([{ x: '', y: '' }]);
  const [manualHeaders, setManualHeaders] = useState(['x', 'y']);

  const [editingColumn, setEditingColumn] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showRawData, setShowRawData] = useState(false);



  const startRename = (header) => {
    setEditingColumn(header);
    setEditValue(header);
  };

  const commitRename = () => {
    if (editingColumn && editValue.trim() && editValue.trim() !== editingColumn) {
      dispatch({
        type: actions.RENAME_HEADER,
        payload: { datasetId: activeDataset.id, oldName: editingColumn, newName: editValue.trim() }
      });
    }
    setEditingColumn(null);
    setEditValue('');
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = (e) => {
      const content = e.target.result;
      let data = [];
      let headers = [];

      try {
        let rows = [];

        if (extension === 'csv') {
          const raw = Papa.parse(content, { header: false, dynamicTyping: true, skipEmptyLines: true });
          rows = raw.data;
        } else if (['xlsx', 'xls'].includes(extension)) {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        }

        if (rows.length > 0) {
          // Heuristic for header detection
          const firstRow = rows[0];
          const secondRow = rows.length > 1 ? rows[1] : null;

          let isHeaderless = false;

          // Helper to check if a value is effectively numeric (ignoring empty)
          const isNumeric = (val) => {
            if (val === null || val === undefined || val === '') return true; // Ignore empty
            return typeof val === 'number';
          };

          // 1. If first row has all numbers (ignoring empty/null), it's likely data
          if (firstRow.every(isNumeric)) {
            isHeaderless = true;
          }
          // 2. If we have a second row, compare types
          else if (secondRow) {
            // Get types, treating null/empty as 'unknown' (or compatible with anything)
            const getType = (val) => {
              if (val === null || val === undefined || val === '') return 'empty';
              return typeof val;
            };

            const firstRowTypes = firstRow.map(getType);
            const secondRowTypes = secondRow.map(getType);

            // Check consistency: types match OR one of them is empty
            const consistent = firstRowTypes.every((t1, i) => {
              const t2 = secondRowTypes[i];
              return t1 === t2 || t1 === 'empty' || t2 === 'empty';
            });

            if (consistent) {
              isHeaderless = true;
            }
          }

          if (isHeaderless) {
            headers = firstRow.map((_, i) => `Column ${i + 1}`);
            data = rows.map(row => {
              const obj = {};
              headers.forEach((h, i) => { obj[h] = row[i]; });
              return obj;
            });
          } else {
            headers = firstRow.map(String); // Ensure headers are strings
            data = rows.slice(1).map(row => {
              const obj = {};
              headers.forEach((h, i) => { obj[h] = row[i]; });
              return obj;
            });
          }

          dispatch({
            type: actions.ADD_DATASET,
            payload: { id: Date.now(), name: file.name, data, headers },
          });
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        // Could add error notification dispatch here
      }
    };

    if (extension === 'csv') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  const saveManualDataset = () => {
    const validData = manualData.filter(row => row.x !== '' && row.y !== '');
    if (validData.length === 0) return;
    dispatch({
      type: actions.ADD_DATASET,
      payload: { id: Date.now(), name: 'Manual Data', data: validData, headers: manualHeaders }
    });
    setManualData([{ x: '', y: '' }]);
    setViewMode('explorer');
  };

  if (viewMode === 'manual') {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--panel-bg)' }}>
        <div className="h-10 px-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--border-1)' }}>
          <button className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            onClick={() => setViewMode('explorer')}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="overflow-hidden rounded-md" style={{ border: '1px solid var(--border-1)' }}>
            <table className="w-full text-xs text-left">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {manualHeaders.map((h, i) => (
                    <th key={i} className="p-0" style={{ borderBottom: '1px solid var(--border-1)' }}>
                      <input
                        className="w-full bg-transparent p-2 text-center font-bold outline-none transition-colors"
                        style={{ color: 'var(--accent)' }}
                        value={h}
                        onChange={(e) => { const newH = [...manualHeaders]; newH[i] = e.target.value; setManualHeaders(newH); }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {manualData.map((row, i) => (
                  <tr key={i}>
                    {manualHeaders.map((col, j) => (
                      <td key={j} className="p-0" style={{ borderBottom: '1px solid var(--border-1)', borderRight: j < manualHeaders.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
                        <input
                          type="number"
                          className="w-full bg-transparent p-2 text-center font-mono outline-none transition-colors"
                          style={{ color: 'var(--text-2)' }}
                          value={row[col]}
                          placeholder="-"
                          onChange={(e) => { const newD = [...manualData]; newD[i][col] = e.target.value; setManualData(newD); }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setManualData([...manualData, { x: '', y: '' }])}
            className="w-full py-2 flex items-center justify-center gap-2 text-xs rounded transition-all"
            style={{ color: 'var(--text-4)', border: '1px dashed var(--border-2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.color = 'var(--text-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)' }}
          >
            <Plus size={12} /> Add Row
          </button>
        </div>

        <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--border-1)' }}>
          <button onClick={saveManualDataset}
            className="w-full py-2 text-white rounded text-xs font-semibold shadow-sm active:translate-y-px transition-all"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            Save Dataset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 px-4 flex items-center justify-between shrink-0 z-10"
        style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--panel-bg)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Explorer</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 py-2">
        <div className="flex-1 overflow-y-auto">
          <div className="mb-2">
            <button
              className="w-full flex items-center gap-1 px-3 py-1 select-none group transition-colors"
              style={{ color: 'var(--text-4)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="text-[11px] font-bold uppercase tracking-wider">Workspace</span>
            </button>

            {isExpanded && (
              <div className="mt-1 flex flex-col gap-0.5">
                {state.datasets.length === 0 ? (
                  <div className="px-8 py-2 text-xs italic" style={{ color: 'var(--text-4)' }}>
                    No files open
                  </div>
                ) : (
                  state.datasets.map(ds => (
                    <div
                      key={ds.id}
                      className="group flex items-center gap-2 px-3 py-1.5 pl-8 cursor-pointer text-xs transition-colors mx-2 rounded-md"
                      style={{
                        background: activeDataset?.id === ds.id ? 'var(--accent-surface)' : 'transparent',
                        color: activeDataset?.id === ds.id ? 'var(--accent)' : 'var(--text-3)',
                      }}
                      onMouseEnter={e => { if (activeDataset?.id !== ds.id) { e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.color = 'var(--text-1)'; } }}
                      onMouseLeave={e => { if (activeDataset?.id !== ds.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; } }}
                      onClick={() => dispatch({ type: actions.SET_ACTIVE_DATASET, payload: ds.id })}
                    >
                      <FileText size={14} className="shrink-0" />
                      <span className="truncate">{ds.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent Datasets */}
          {recentDatasets.length > 0 && (
            <div className="mb-2">
              <button
                className="w-full flex items-center gap-1 px-3 py-1 select-none transition-colors"
                style={{ color: 'var(--text-4)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
                onClick={() => setRecentExpanded(!recentExpanded)}
              >
                {recentExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Clock size={12} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Recent</span>
                <span className="text-[10px] font-mono ml-auto" style={{ color: 'var(--text-4)' }}>{recentDatasets.length}</span>
              </button>
              {recentExpanded && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {recentDatasets.slice().reverse().map(ds => {
                    const isActive = state.activeDatasetId === ds.id;
                    const ago = ds.savedAt ? formatTimeAgo(ds.savedAt) : '';
                    return (
                      <div
                        key={ds.id}
                        className="group flex items-center gap-2 px-3 py-1.5 pl-8 cursor-pointer text-xs transition-colors mx-2 rounded-md"
                        style={{
                          background: isActive ? 'var(--accent-surface)' : 'transparent',
                          color: isActive ? 'var(--accent)' : 'var(--text-3)',
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.color = 'var(--text-1)'; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; } }}
                        onClick={() => loadRecentDataset(ds)}
                      >
                        <FileText size={14} className="shrink-0" />
                        <span className="truncate flex-1">{ds.name}</span>
                        {ago && <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-4)' }}>{ago}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Column Editor (Always Visible) ── */}
      {activeDataset && (
        <div className="px-3 py-2 space-y-1.5 shrink-0" style={{ borderTop: '1px solid var(--border-1)' }}>
          <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-4)' }}>Columns</span>
          {activeDataset.headers.map(h => (
            <div key={h} className="flex items-center gap-1.5">
              {editingColumn === h ? (
                <>
                  <input
                    className="flex-1 px-2 py-1 text-xs font-mono rounded outline-none"
                    style={{ background: 'var(--surface-bg)', border: '1px solid var(--accent)', color: 'var(--text-1)' }}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingColumn(null); }}
                    autoFocus
                  />
                  <button onClick={commitRename} className="p-0.5 rounded transition-colors" style={{ color: 'var(--success)' }}>
                    <Check size={12} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs font-mono truncate" style={{ color: /^Column \d+$/.test(h) ? 'var(--text-4)' : 'var(--text-2)' }}>{h}</span>
                  <button onClick={() => startRename(h)} className="p-0.5 rounded transition-colors opacity-50 hover:opacity-100" style={{ color: 'var(--text-3)' }}>
                    <Pencil size={11} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Raw Data Table ── */}
      {activeDataset && (
        <div className="shrink-0 flex flex-col" style={{ borderTop: '1px solid var(--border-1)' }}>
          <button
            className="flex items-center gap-2 px-3 py-2 w-full text-left"
            style={{ color: 'var(--text-3)' }}
            onClick={() => setShowRawData(!showRawData)}
          >
            {showRawData ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Table size={12} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Data</span>
            <span className="text-[10px] font-mono ml-auto" style={{ color: 'var(--text-4)' }}>{activeDataset.data.length} rows</span>
          </button>
          {showRawData && (
            <div className="overflow-auto" style={{ maxHeight: '200px' }}>
              <table className="w-full text-[10px] font-mono" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {activeDataset.headers.map(h => (
                      <th key={h} className="px-2 py-1 text-left sticky top-0"
                        style={{ background: 'var(--surface-bg)', color: 'var(--text-3)', borderBottom: '1px solid var(--border-2)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDataset.data.map((row, i) => (
                    <tr key={i}>
                      {activeDataset.headers.map(h => (
                        <td key={h} className="px-2 py-0.5" style={{ color: 'var(--text-2)', borderBottom: '1px solid var(--border-1)' }}>
                          {row[h] != null ? (typeof row[h] === 'number' ? row[h].toPrecision(4) : row[h]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3 shrink-0" style={{ borderTop: '1px solid var(--border-1)' }}>
        <label className="flex items-center justify-center gap-2 w-full py-2 text-white rounded text-xs font-semibold shadow-sm cursor-pointer active:translate-y-px transition-all"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => Array.from(e.target.files).forEach(handleFileUpload)}
          />
          <Upload size={14} />
          <span>Import File</span>
        </label>

        <button
          onClick={() => setViewMode('manual')}
          className="flex items-center justify-center gap-2 w-full py-2 rounded text-xs font-medium transition-colors"
          style={{ background: 'var(--surface-bg)', color: 'var(--text-2)', border: '1px solid var(--border-1)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--active-bg)'; e.currentTarget.style.borderColor = 'var(--text-3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.borderColor = 'var(--border-1)' }}
        >
          <Table size={14} />
          <span>Manual Entry</span>
        </button>
      </div>
    </div>
  );
};

export default DataUploader;
