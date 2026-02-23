import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export const derivatives = {
  id: 'derivatives',
  name: 'Derivatives',
  description: (regression, inputs) => {
    const order = String(inputs?.order || '1');
    if (order === '2') {
      return 'Calculates the 2nd derivative (curvature/concavity) of the selected data region using central finite differences. Useful for identifying inflection points and peak shapes.';
    }
    return 'Calculates the 1st derivative (rate of change/slope) of the selected data region using central finite differences. Useful for detecting trends and changes in velocity.';
  },

  help: (
    <div className="space-y-2">
      <p><strong>Workflow:</strong></p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Select the derivative order (1st for slope, 2nd for curvature).</li>
        <li>Click <strong>Calculate</strong> to process the selected region.</li>
        <li>Click <strong>"Save as New Dataset"</strong> to overlay the result.</li>
      </ol>
      <div className="mt-2 pt-2 border-t border-[var(--border-2)]">
        <p className="font-medium mb-1">Formulas (Central Difference):</p>
        <div className="font-mono text-xs space-y-1 text-[var(--text-3)]">
          <p>1st: dy/dx ≈ (y₍ᵢ₊₁₎ - y₍ᵢ₋₁₎) / (x₍ᵢ₊₁₎ - x₍ᵢ₋₁₎)</p>
          <p>2nd: d²y/dx² ≈ (y₍ᵢ₊₁₎ - 2yᵢ + y₍ᵢ₋₁₎) / h²</p>
        </div>
      </div>
    </div>
  ),

  inputs: [
    {
      id: 'order',
      name: 'Derivative Order',
      type: 'select',
      options: [
        { value: '1', label: '1st Derivative (dy/dx)' },
        { value: '2', label: '2nd Derivative (d²y/dx²)' }
      ],
      defaultValue: '1'
    }
  ],

  required_analysis: [],

  renderInfo: (result, inputs) => {
    const isSecond = String(inputs?.order || '1') === '2';
    return (
      <div className="font-mono text-xs text-center space-y-1 mt-2">
        <div style={{ color: 'var(--accent)' }}>
          {isSecond
            ? "d²y/dx² ≈ (y[i+1] - 2y[i] + y[i-1]) / h²"
            : "dy/dx ≈ (y[i+1] - y[i-1]) / (x[i+1] - x[i-1])"}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>
          {isSecond ? "Central Difference (Curvature)" : "Central Difference (Slope)"}
        </div>
      </div>
    );
  },

  calculate: (data, inputs, ctx) => {
    // Extract region data from context
    const regionData = ctx?.regionData;

    // Pass it through in result so renderResult can use it
    return {
      ready: true,
      order: String(inputs?.order || '1'),
      regionData: regionData
    };
  },

  renderResult: (result, dispatch) => {
    return <DerivativeActions data={result.regionData} order={result.order} />;
  }
};

const DerivativeActions = ({ data, order }) => {
  const { actions, dispatch, activeDataset } = useData();
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSaved(false); }, [data, order]);

  const handleSave = () => {
    if (!data || data.length < 2) return;

    const xKey = Object.keys(data[0])[0];
    const yKey = Object.keys(data[0])[1]; // Assuming 2nd key is Y

    const n = data.length;

    const parsedOrder = String(order || '1');

    // Construct new Y-axis label
    const newYKey = parsedOrder === '1'
      ? `d(${yKey})/d(${xKey})`
      : `d²(${yKey})/d(${xKey})²`;

    const newPoints = [];

    // Finite Difference Calculation
    for (let i = 0; i < n; i++) {
      let deriv = null;
      const x_i = data[i][xKey];

      if (parsedOrder === '1') {
        // 1st Derivative (dy/dx)
        if (i === 0) {
          // Forward difference
          const h = data[i + 1]?.[xKey] - x_i;
          if (h) deriv = (data[i + 1][yKey] - data[i][yKey]) / h;
        } else if (i === n - 1) {
          // Backward difference
          const h = x_i - data[i - 1]?.[xKey];
          if (h) deriv = (data[i][yKey] - data[i - 1][yKey]) / h;
        } else {
          // Central difference
          const h = data[i + 1]?.[xKey] - data[i - 1]?.[xKey];
          if (h) deriv = (data[i + 1][yKey] - data[i - 1][yKey]) / h;
        }
      } else {
        // 2nd Derivative (d2y/dx2)
        if (i > 0 && i < n - 1) {
          // Central difference
          const x_prev = data[i - 1]?.[xKey];
          const x_next = data[i + 1]?.[xKey];
          const y_prev = data[i - 1]?.[yKey];
          const y_cur = data[i]?.[yKey];
          const y_next = data[i + 1]?.[yKey];

          if (x_prev != null && x_next != null && y_prev != null && y_cur != null && y_next != null) {
            const h = (x_next - x_prev) / 2;
            if (h !== 0) {
              deriv = (y_next - 2 * y_cur + y_prev) / (h * h);
            }
          }
        }
      }

      newPoints.push({ [xKey]: x_i, [newYKey]: deriv });
    }

    // Filter out rows where deriv is null to ensure clean graphs
    const cleanPoints = newPoints.filter(pt => pt[newYKey] !== null && !isNaN(pt[newYKey]));

    const nameSuffix = parsedOrder === '1' ? "1st Deriv" : "2nd Deriv";
    // Prepend original dataset name if available
    const datasetName = activeDataset ? `${activeDataset.name} - ${nameSuffix}` : `${nameSuffix} of Selection`;

    dispatch({
      type: 'ADD_DATASET',
      payload: {
        id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
        name: datasetName,
        data: cleanPoints,
        headers: [xKey, newYKey]
      }
    });
    setSaved(true);
  };

  return (
    <div className="mt-2 space-y-2">
      <button
        onClick={handleSave}
        disabled={saved}
        className="w-full py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: saved ? 'var(--success-bg)' : 'var(--accent)',
          color: saved ? 'var(--success)' : '#fff',
          opacity: saved ? 0.8 : 1
        }}
      >
        {saved ? 'Saved to Sidebar' : 'Save as New Dataset'}
      </button>
      <p className="text-[10px] text-[var(--text-3)] text-center leading-tight">
        Creates a new dataset with the calculated derivative values.
      </p>
    </div>
  );
};
