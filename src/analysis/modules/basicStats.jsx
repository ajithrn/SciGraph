import React from 'react';

export const basicStats = {
  id: 'basic-stats',
  name: 'Basic Statistics',
  description: 'Computes summary statistics (Mean, Median, StdDev, Min, Max) for the selected data region.',
  help: 'Select a region on the graph. This module analyzes the Y-values in that range.',
  inputs: [],

  calculate: (data, inputs, ctx) => {
    const points = ctx.regionData;
    if (!points || points.length === 0) return { error: 'No data selected.' };

    const ys = points.map(p => p.y).sort((a, b) => a - b);
    const n = ys.length;
    const min = ys[0];
    const max = ys[n - 1];
    const sum = ys.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = n % 2 === 0 ? (ys[n / 2 - 1] + ys[n / 2]) / 2 : ys[Math.floor(n / 2)];
    const variance = ys.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return {
      mean, median, stdDev, min, max, n
    };
  },
  renderResult: (result) => (
    <div className="grid grid-cols-2 gap-2 text-left">
      <div className="bg-[var(--surface-bg)] p-2 rounded border border-[var(--border-1)]">
        <div className="text-[10px] text-[var(--text-4)] uppercase tracking-wider">Mean</div>
        <div className="font-mono text-sm text-[var(--text-1)]">{result.mean.toExponential(4)}</div>
      </div>
      <div className="bg-[var(--surface-bg)] p-2 rounded border border-[var(--border-1)]">
        <div className="text-[10px] text-[var(--text-4)] uppercase tracking-wider">Median</div>
        <div className="font-mono text-sm text-[var(--text-1)]">{result.median.toExponential(4)}</div>
      </div>
      <div className="bg-[var(--surface-bg)] p-2 rounded border border-[var(--border-1)]">
        <div className="text-[10px] text-[var(--text-4)] uppercase tracking-wider">Std Dev</div>
        <div className="font-mono text-sm text-[var(--text-1)]">{result.stdDev.toExponential(4)}</div>
      </div>
      <div className="bg-[var(--surface-bg)] p-2 rounded border border-[var(--border-1)]">
        <div className="text-[10px] text-[var(--text-4)] uppercase tracking-wider">Count</div>
        <div className="font-mono text-sm text-[var(--text-1)]">{result.n}</div>
      </div>
      <div className="col-span-2 bg-[var(--surface-bg)] p-2 rounded border border-[var(--border-1)] flex justify-between">
        <div>
          <div className="text-[10px] text-[var(--text-4)] uppercase tracking-wider">Min</div>
          <div className="font-mono text-xs text-[var(--text-1)]">{result.min.toExponential(3)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--text-4)] uppercase tracking-wider">Max</div>
          <div className="font-mono text-xs text-[var(--text-1)]">{result.max.toExponential(3)}</div>
        </div>
      </div>
    </div>
  )
};
