// Analysis Registry

const thermalDiffusivity = {
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
      description: 'The thickness of the sample being measured, in millimeters.',
    },
  ],
  required_analysis: ['linear_regression'],
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

const registry = {
  [thermalDiffusivity.id]: thermalDiffusivity,
};

export function getAnalysisModules() {
  return Object.values(registry);
}

export function getAnalysisModule(id) {
  return registry[id];
}

// Helper: Linear Regression (Least Squares)
export function calculateLinearRegression(dataPoints) {
  const n = dataPoints.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (const p of dataPoints) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const ssRes = dataPoints.reduce((sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
  const meanY = sumY / n;
  const ssTot = dataPoints.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
  const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, rSquared };
}
