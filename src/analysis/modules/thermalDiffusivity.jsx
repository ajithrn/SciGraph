import React from 'react';

export const thermalDiffusivity = {
  id: 'thermal-diffusivity',
  name: 'Thermal Diffusivity',
  description: 'Calculates thermal diffusivity (α) of a material from a laser flash experiment. Measures how quickly heat propagates through a sample of known thickness.',
  help: 'Workflow: 1) Import your temperature-vs-time data. 2) Select the X (time) and Y (temperature) axes. 3) Drag on the graph to select the linear rise region — the slope (B) is auto-calculated via least-squares regression. 4) Enter the sample thickness (L) below. 5) Click Calculate. The formula α = π · L² / B² gives the diffusivity in mm²/s.',
  inputs: [
    {
      id: 'thickness',
      name: 'Sample Thickness (L)',
      type: 'number',
      unit: 'mm',
      step: 0.1,
      min: 0.01,
      defaultValue: 0.1,
      description: 'The thickness of the sample being measured, in millimeters.',
    },
  ],
  required_analysis: ['linear_regression'],
  renderInfo: (regression) => (
    <div className="font-mono text-xs text-center space-y-1">
      <div style={{ color: 'var(--accent)' }}>α = π · L² / B²</div>
      <div className="text-xs" style={{ color: 'var(--text-4)' }}>L = thickness (mm), B = slope from linear regression</div>
    </div>
  ),
  calculate: (data, inputs, analysisResults) => {
    const L = inputs.thickness; // in mm
    const B = analysisResults.slope; // from regression

    if (!B || B === 0) return { error: 'Invalid slope (B). Select a region on the graph first.' };
    if (!L) return { error: 'Enter a valid sample thickness (L).' };

    const TD = (Math.PI * Math.pow(L, 2)) / Math.pow(B, 2);

    return {
      value: TD,
      unit: 'mm²/s',
      formula: 'π · L² / B²'
    };
  }
};
