import React from 'react';

export const thermalDiffusivity = {
  id: 'thermal-diffusivity',
  name: 'Thermal Diffusivity',
  description: (regression, inputs) => {
    const method = inputs?.method || 'direct';
    const baseDesc = 'Calculates thermal diffusivity (α) of a material from a laser flash experiment. Measures how quickly heat propagates through a sample of known thickness.\n\n';

    if (method === 'direct') {
      return baseDesc + '• Direct (Transmission): A laser pulse heats the front face of the sample, and the temperature rise is measured on the rear face. This measures how quickly heat propagates directly through the sample\'s thickness.';
    } else {
      return baseDesc + '• Indirect (Reflection): The laser pulse and the temperature measurement both occur on the same front surface. Useful when the rear face is inaccessible or for testing thin films through a medium/substrate.';
    }
  },
  help: (regression, inputs) => {
    const method = inputs?.method || 'direct';

    if (method === 'direct') {
      return (
        <ul className="list-decimal pl-4 space-y-1">
          <li>Import your temperature-vs-time data.</li>
          <li>Select the X (time) and Y (temperature) axes.</li>
          <li>Select <strong>Direct</strong> Test Method.</li>
          <li>Drag on the graph to establish the slope (B) using linear regression.</li>
          <li>Enter the sample thickness (L) below.</li>
          <li>Click Calculate to find α = π · L² / B².</li>
        </ul>
      );
    } else {
      return (
        <ul className="list-decimal pl-4 space-y-1">
          <li>Import your data and select axes.</li>
          <li>Select <strong>Indirect / Reflection</strong> Test Method.</li>
          <li>Enter the sample thickness (L) and Factor (Fc) below.</li>
          <li>Click Calculate to find α = L² · Fc.</li>
        </ul>
      );
    }
  },
  inputs: [
    {
      id: 'method',
      name: 'Test Method',
      type: 'select',
      options: [
        { value: 'direct', label: 'Direct' },
        { value: 'indirect', label: 'Indirect / Reflection' }
      ],
      defaultValue: 'direct',
      description: 'Select the test case calculation method.',
    },
    {
      id: 'thickness',
      name: 'Sample Thickness (L)',
      type: 'number',
      unit: 'mm',
      step: 0.1,
      min: 0.01,
      defaultValue: 0.1,
      description: 'The thickness of the sample being measured, in millimeters.',
      show: () => true
    },
    {
      id: 'fc',
      name: 'Factor (Fc)',
      type: 'number',
      step: 0.01,
      defaultValue: 1.0,
      description: 'Multiplier factor used for the indirect method.',
      show: (inputs) => (inputs?.method || 'direct') === 'indirect'
    }
  ],
  showSlope: (inputs) => (inputs?.method || 'direct') === 'direct',
  required_analysis: ['linear_regression'],
  renderInfo: (regression, inputs) => {
    const method = inputs?.method || 'direct';

    if (method === 'direct') {
      return (
        <div className="font-mono text-xs text-center space-y-1">
          <div style={{ color: 'var(--accent)' }}>α = π · L² / B²</div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>L = thickness (mm), B = slope from linear regression</div>
        </div>
      );
    } else {
      return (
        <div className="font-mono text-xs text-center space-y-1">
          <div style={{ color: 'var(--accent)' }}>α = L² · Fc</div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>L = thickness (mm), Fc = factor input</div>
        </div>
      );
    }
  },
  calculate: (data, inputs, analysisResults) => {
    const method = inputs.method || 'direct';
    const L = inputs.thickness; // in mm

    if (!L) return { error: 'Enter a valid sample thickness (L).' };

    if (method === 'direct') {
      const B = analysisResults.slope; // from regression
      if (!B || B === 0) return { error: 'Invalid slope (B). Select a region on the graph first.' };

      const TD = (Math.PI * Math.pow(L, 2)) / Math.pow(B, 2);

      return {
        value: TD,
        unit: 'mm²/s',
        formula: 'π · L² / B²'
      };
    } else {
      const Fc = inputs.fc !== undefined ? inputs.fc : 1.0;
      const TD = Math.pow(L, 2) * Fc;

      return {
        value: TD,
        unit: 'mm²/s',
        formula: 'L² · Fc'
      };
    }
  }
};
