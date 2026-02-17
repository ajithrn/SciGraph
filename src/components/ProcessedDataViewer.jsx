import React from 'react';
import { Copy, X } from 'lucide-react';

const ProcessedDataViewer = ({ data, xKey, yKey, onClose }) => {
  if (!data || data.length === 0) return null;

  const formatValue = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '—';
    if (Number.isInteger(v)) return v.toString();
    return v.toFixed(6);
  };

  const handleCopy = () => {
    const header = `${xKey}\t${yKey}`;
    const rows = data.map(row => `${formatValue(row[xKey])}\t${formatValue(row[yKey])}`);
    navigator.clipboard.writeText([header, ...rows].join('\n'));
  };

  return (
    <div className="shrink-0 flex flex-col max-h-52 border-t"
      style={{ borderColor: 'var(--border-1)', background: 'var(--panel-bg)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-1)' }}>
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>
          Processed Data
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-4)' }}
            title="Copy to clipboard">
            <Copy size={12} />
          </button>
          <button onClick={onClose} className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-4)' }}
            title="Close">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono" style={{ color: 'var(--text-2)' }}>
          <thead>
            <tr style={{ background: 'var(--surface-bg)' }}>
              <th className="text-left px-3 py-1.5 font-semibold sticky top-0"
                style={{ background: 'var(--surface-bg)', color: 'var(--text-3)', borderBottom: '1px solid var(--border-1)' }}>
                #
              </th>
              <th className="text-right px-3 py-1.5 font-semibold sticky top-0"
                style={{ background: 'var(--surface-bg)', color: 'var(--accent)', borderBottom: '1px solid var(--border-1)' }}>
                {xKey}
              </th>
              <th className="text-right px-3 py-1.5 font-semibold sticky top-0"
                style={{ background: 'var(--surface-bg)', color: 'var(--success)', borderBottom: '1px solid var(--border-1)' }}>
                {yKey}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="transition-colors"
                style={{ borderBottom: '1px solid var(--border-1)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="px-3 py-1" style={{ color: 'var(--text-4)' }}>{i + 1}</td>
                <td className="text-right px-3 py-1">{formatValue(row[xKey])}</td>
                <td className="text-right px-3 py-1">{formatValue(row[yKey])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 px-3 py-1 text-[11px]"
        style={{ color: 'var(--text-4)', borderTop: '1px solid var(--border-1)' }}>
        {data.length} rows
      </div>
    </div>
  );
};

export default ProcessedDataViewer;
