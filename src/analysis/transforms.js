/**
 * Built-in mathematical transforms for axis data processing.
 * Each transform has: id, label, fn(value, secondValue?), needsSecondColumn
 */

const TRANSFORMS = [
  {
    id: 'sqrt',
    label: 'sqrt(x)',
    description: 'Square root',
    fn: (v) => Math.sqrt(Math.abs(v)),
    formatLabel: (col) => `√(${col})`,
  },
  {
    id: 'ln',
    label: 'ln(x)',
    description: 'Natural logarithm',
    fn: (v) => v > 0 ? Math.log(v) : NaN,
    formatLabel: (col) => `ln(${col})`,
  },
  {
    id: 'log10',
    label: 'log₁₀(x)',
    description: 'Base-10 logarithm',
    fn: (v) => v > 0 ? Math.log10(v) : NaN,
    formatLabel: (col) => `log₁₀(${col})`,
  },
  {
    id: 'square',
    label: 'x²',
    description: 'Square',
    fn: (v) => v * v,
    formatLabel: (col) => `(${col})²`,
  },
  {
    id: 'inverse',
    label: '1/x',
    description: 'Inverse',
    fn: (v) => v !== 0 ? 1 / v : NaN,
    formatLabel: (col) => `1/(${col})`,
  },
  {
    id: 'abs',
    label: '|x|',
    description: 'Absolute value',
    fn: (v) => Math.abs(v),
    formatLabel: (col) => `|${col}|`,
  },
  {
    id: 'multiply',
    label: 'a × b',
    description: 'Multiply two columns',
    fn: (v, v2) => v * (v2 ?? 1),
    needsSecondColumn: true,
    formatLabel: (col, col2) => `${col} × ${col2 || '?'}`,
  },
];

/**
 * Get all available transforms
 */
export function getTransforms() {
  return TRANSFORMS;
}

/**
 * Find a transform by ID
 */
export function getTransformById(id) {
  return TRANSFORMS.find(t => t.id === id) || null;
}

/**
 * Apply a transform (with optional chaining) to a data array.
 * @param {Array} data - array of row objects
 * @param {string} column - primary column name
 * @param {object|null} transform - { id, secondColumn?, outer? } or null
 *   - id: inner transform (e.g. 'multiply', 'sqrt')
 *   - secondColumn: for 'multiply' — the second column
 *   - outer: optional wrapping transform id (e.g. 'ln' to get ln(a×b))
 * @returns {{ values: number[], label: string }}
 */
export function applyTransform(data, column, transform) {
  if (!transform || !transform.id) {
    return {
      values: data.map(row => parseFloat(row[column])),
      label: column,
    };
  }

  const t = getTransformById(transform.id);
  if (!t) {
    return {
      values: data.map(row => parseFloat(row[column])),
      label: column,
    };
  }

  // Step 1: apply the inner transform
  let values = data.map(row => {
    const v = parseFloat(row[column]);
    if (isNaN(v)) return NaN;
    if (t.needsSecondColumn && transform.secondColumn) {
      const v2 = parseFloat(row[transform.secondColumn]);
      return t.fn(v, v2);
    }
    return t.fn(v);
  });

  let label = t.formatLabel(
    column,
    t.needsSecondColumn ? transform.secondColumn : undefined
  );

  // Step 2: apply the outer (wrapping) transform if present
  if (transform.outer) {
    const outerT = getTransformById(transform.outer);
    if (outerT) {
      values = values.map(v => isNaN(v) ? NaN : outerT.fn(v));
      label = outerT.formatLabel(label);
    }
  }

  return { values, label };
}

/**
 * Build processed dataset from raw data + axis transforms.
 * Returns { data: [{xKey: ..., yKey: ...}, ...], xLabel, yLabel }
 */
export function buildProcessedData(rawData, xCol, yCol, xTransform, yTransform) {
  const xResult = applyTransform(rawData, xCol, xTransform);
  const yResult = applyTransform(rawData, yCol, yTransform);

  const xKey = xResult.label;
  const yKey = yResult.label;

  const data = xResult.values.map((xVal, i) => ({
    [xKey]: xVal,
    [yKey]: yResult.values[i],
    _index: i,
  })).filter(row => !isNaN(row[xKey]) && !isNaN(row[yKey]));

  return { data, xLabel: xKey, yLabel: yKey, xKey, yKey };
}
