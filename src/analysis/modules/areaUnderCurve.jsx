import React from 'react';

export const areaUnderCurve = {
  id: 'area-under-curve',
  name: 'Area Under Curve',
  description: 'Calculates the definite integral (area) under the curve using the Trapezoidal Rule.',
  help: 'Select a region. The area is computed as sum of trapezoids between data points.',
  inputs: [],

  calculate: (data, inputs, ctx) => {
    const points = ctx.regionData;
    if (!points || points.length < 2) return { error: 'Need at least 2 points.' };

    // Sort by X just in case
    const sorted = [...points].sort((a, b) => a.x - b.x);
    let area = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      area += 0.5 * (p1.y + p2.y) * (p2.x - p1.x);
    }

    return { area };
  },
  renderResult: (result) => (
    <div className="space-y-1">
      <div className="text-2xl font-mono tracking-tight text-[var(--text-1)]">
        {result.area.toExponential(4)}
      </div>
      <div className="text-xs font-medium text-[var(--text-3)]">
        Integrated Area
      </div>
      <div className="text-xs font-mono pt-1 text-[var(--text-4)]">
        Formula: Σ 0.5 · (y₁+y₂) · Δx
      </div>
    </div>
  )
};
