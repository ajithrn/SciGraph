import React from 'react';

export const peakFinder = {
  id: 'peak-finder',
  name: 'Peak Finder',
  description: 'Identifies the data point with the maximum Y value in the selected region.',
  help: 'Select a region containing a peak.',
  inputs: [],

  calculate: (data, inputs, ctx) => {
    const points = ctx.regionData;
    if (!points || points.length === 0) return { error: 'No data selected.' };

    let maxP = points[0];
    for (const p of points) {
      if (p.y > maxP.y) maxP = p;
    }

    return { x: maxP.x, y: maxP.y };
  },
  renderResult: (result) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center bg-[var(--surface-bg)] p-2 rounded border border-[var(--border-1)]">
        <span className="text-xs font-bold text-[var(--accent)]">Y (Max)</span>
        <span className="font-mono text-lg text-[var(--text-1)]">{result.y.toExponential(4)}</span>
      </div>
      <div className="flex justify-between items-center px-2">
        <span className="text-xs text-[var(--text-4)]">at X =</span>
        <span className="font-mono text-sm text-[var(--text-2)]">{result.x.toExponential(4)}</span>
      </div>
    </div>
  )
};
