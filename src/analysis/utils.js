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

/**
 * Calculates a Simple Moving Average (SMA).
 * @param {Array<{x: number, y: number}>} dataPoints - The input data.
 * @param {number} windowSize - The size of the moving window (should be odd).
 * @returns {Array<{x: number, y: number}>} - The smoothed data points.
 */
export function movingAverage(dataPoints, windowSize) {
  if (!dataPoints || dataPoints.length < windowSize) return dataPoints;
  const halfWindow = Math.floor(windowSize / 2);
  const smoothed = [];

  for (let i = 0; i < dataPoints.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      if (j >= 0 && j < dataPoints.length) {
        sum += dataPoints[j].y;
        count++;
      }
    }
    smoothed.push({ x: dataPoints[i].x, y: sum / count });
  }
  return smoothed;
}

/**
 * Calculates Savitzky-Golay smoothing.
 * Currently implements a simplified version or a specific kernel for common cases (e.g., quadratic/cubic, varied window).
 * For a robust general implementation, we'd need a matrix solver, but here we can hardcode coefficients for common windows.
 * 
 * NOTE: For this initial implementation, we will use a simplified convolution approach for 5, 7, 9 point windows with quadratic polynomial.
 * If window is not supported, falls back to Moving Average.
 * 
 * Ref for coefficients: https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter#Tables_of_selected_convolution_coefficients
 */
export function savitzkyGolay(dataPoints, windowSize, polynomialOrder = 2) {
  if (!dataPoints || dataPoints.length < windowSize) return dataPoints;
  
  // Simplified SG Coefficients for Quadratic/Cubic (order 2/3 are same coefficients)
  // Window Size must be odd.
  const halfWindow = Math.floor(windowSize / 2);
  
  // Hardcoded coefficients for common window sizes (normalized)
  let coeffs = [];
  let norm = 1;

  if (windowSize === 5) {
    coeffs = [-3, 12, 17, 12, -3];
    norm = 35;
  } else if (windowSize === 7) {
    coeffs = [-2, 3, 6, 7, 6, 3, -2];
    norm = 21;
  } else if (windowSize === 9) {
    coeffs = [-21, 14, 39, 54, 59, 54, 39, 14, -21];
    norm = 231;
  } else if (windowSize === 11) {
    coeffs = [-36, 9, 44, 69, 84, 89, 84, 69, 44, 9, -36];
    norm = 429;
  } else {
    // Fallback for unsupported window sizes
    console.warn(`Savitzky-Golay: Window size ${windowSize} not hardcoded. Falling back to Moving Average.`);
    return movingAverage(dataPoints, windowSize);
  }

  const smoothed = [];
  
  for (let i = 0; i < dataPoints.length; i++) {
    // Handle edges by keeping original data or mirrored padding (here: keeping original for simplicity at very edges)
    if (i < halfWindow || i >= dataPoints.length - halfWindow) {
      smoothed.push(dataPoints[i]);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      const dataIndex = i - halfWindow + j;
      sum += dataPoints[dataIndex].y * coeffs[j];
    }
    smoothed.push({ x: dataPoints[i].x, y: sum / norm });
  }

  return smoothed;
}
