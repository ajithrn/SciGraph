
import React, { useState } from 'react';
import { movingAverage, savitzkyGolay } from '../utils';

export const smoothing = {
  id: 'smoothing',
  name: 'Data Smoothing',
  description: 'Reduce noise using Moving Average or Savitzky-Golay filters.',
  help: (
    <div className="space-y-2">
      <p><strong>Workflow:</strong></p>
      <ol className="list-decimal list-inside space-y-1">
        <li>
          <strong>Select Method</strong>: "Moving Average" for simple noise reduction, "Savitzky-Golay" to preserve peak shapes.
        </li>
        <li>
          <strong>Window Size</strong>: Must be odd. Higher values smooth more but may distort features.
        </li>
        <li>
          <strong>Poly Order</strong> (SG only): Higher order follows curvature better (less distortion).
        </li>
        <li>
          Click <strong>Calculate</strong>, then "Save as New Dataset" to compare.
        </li>
      </ol>
    </div>
  ),

  // Define inputs for the analysis
  inputs: [
    {
      id: 'method',
      name: 'Smoothing Method',
      type: 'select',
      options: [
        { value: 'moving_average', label: 'Moving Average' },
        { value: 'savitzky_golay', label: 'Savitzky-Golay' }
      ],
      defaultValue: 'moving_average'
    },
    {
      id: 'windowSize',
      name: 'Window Size',
      type: 'number',
      defaultValue: 5,
      min: 3,
      step: 2, // Check logic to ensure odd numbers
      description: 'Number of points to include in the average (odd number).'
    },
    {
      id: 'polyOrder',
      name: 'Polynomial Order (SG Only)',
      type: 'number',
      defaultValue: 2,
      min: 2,
      max: 5,
      description: 'Degree of polynomial to fit. Higher = follows curvature better.'
    }
  ],

  renderInfo: () => (
    <div className="font-mono text-xs text-center space-y-1">
      <div style={{ color: 'var(--accent)' }}>y_smooth[i] = Σ (c[j] · y[i+j]) / Norm</div>
      <div className="text-xs" style={{ color: 'var(--text-4)' }}>Convolution with window size w</div>
    </div>
  ),

  /**
   * Calculates the smoothed dataset.
   * @param {Array} data - The input data array (raw).
   * @param {Object} params - User parameters (method, windowSize, polyOrder).
   * @param {Object} context - Context containing { slope, regionData }.
   */
  calculate: (data, params, { regionData }) => {
    // We use regionData because it contains the properly transformed X/Y numeric values 
    // for the selected region. The raw 'data' usually contains string values and arbitrary column names.
    const sourceData = regionData;

    if (!sourceData || sourceData.length === 0) return { error: 'No data in selected region.' };

    const method = params.method || 'moving_average';
    let windowSize = parseInt(params.windowSize, 10) || 5;

    // Ensure window size is odd
    if (windowSize % 2 === 0) windowSize += 1;
    // Enforce minimum window size of 3
    if (windowSize < 3) windowSize = 3;

    let smoothedData = [];
    let label = '';

    if (method === 'moving_average') {
      smoothedData = movingAverage(sourceData, windowSize);
      label = `Smoothed (MA, w=${windowSize})`;
    } else if (method === 'savitzky_golay') {
      // SG implementation currently only supports 5, 7, 9, 11
      // If user provided < 5, bump to 5.
      // If user provided > 11, clamp to 11 (for now, until we add more kernels or general solver)
      // Or just warn and fallback.
      // Let's constrain to supported values.
      const validWindows = [5, 7, 9, 11];
      // Find closest valid window
      if (windowSize < 5) windowSize = 5;
      if (windowSize > 11) windowSize = 11;

      const polyOrder = parseInt(params.polyOrder, 10) || 2;
      smoothedData = savitzkyGolay(sourceData, windowSize, polyOrder);
      label = `Smoothed (SG, w=${windowSize}, p=${polyOrder})`;
    }

    return {
      smoothedData,
      method,
      windowSize,
      label
    };
  },

  /**
   * Renders the result card.
   * Provides a button to save the smoothed data as a new dataset.
   */
  renderResult: (result, dispatch) => {
    if (!result || !result.smoothedData) return null;

    const handleSave = () => {
      // Dispatch action to add new dataset
      // We need to construct a new dataset object
      // This implies the action 'ADD_DATASET' exists in DataContext

      const newDataset = {
        id: Date.now().toString(), // Simple ID generation
        name: result.label,
        headers: ['x', 'y'], // Standard headers for plotted data
        data: result.smoothedData,
        color: '#ff9800', // Orange for smoothed data by default?
        isVisible: true
      };

      dispatch({ type: 'ADD_DATASET', payload: newDataset });
    };

    return (
      <div className="flex flex-col">
        <div className="text-sm" style={{ color: 'var(--text-3)' }}>
          Generated <strong>{result.smoothedData.length}</strong> smoothed points using <strong>{result.method === 'moving_average' ? 'Moving Average' : 'Savitzky-Golay'}</strong>.
        </div>
        <button
          onClick={handleSave}
          className="mt-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded transition-colors flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <span>Save as New Dataset</span>
        </button>
      </div>
    );
  }
};
