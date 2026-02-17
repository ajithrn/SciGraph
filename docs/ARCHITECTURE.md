# Architecture Guide

## Overview

SciGraph is designed with extensibility in mind. The core philosophy is to separate **Data Management**, **Visualization**, **Transformation**, and **Analysis** into independent, composable layers.

## Directory Structure

```
src/
├── analysis/               # Scientific computation layer
│   ├── registry.js          # Analysis module registry & linear regression
│   └── transforms.js        # Data transformation library (sqrt, ln, etc.)
├── components/              # UI Components
│   ├── GraphViewer.jsx      # Main chart + two-row toolbar + transform selectors
│   ├── ChartFactory.jsx     # Recharts-based chart renderer
│   ├── DataUploader.jsx     # File import, manual entry, column rename editor
│   ├── AnalysisPanel.jsx    # Analysis toolkit (method, parameters, results)
│   └── ProcessedDataViewer.jsx  # Transformed data table overlay
├── context/
│   └── DataContext.jsx      # Global state (datasets, graph config, transforms)
└── styles/
    └── index.css            # Design tokens, theme variables, base styles
```

## Data Flow

```
CSV/XLSX → DataUploader → DataContext (raw data + headers)
                              ↓
                    GraphViewer (useMemo)
                        ↓
              transforms.js (buildProcessedData)
                        ↓
                  ChartFactory (rendered chart)
                        ↓
              AnalysisPanel (regression on transformed data)
```

## Key Modules

### DataContext (`src/context/DataContext.jsx`)

Global state via `useReducer`. Manages:

- `datasets[]` — array of `{ id, name, data, headers }`
- `activeDatasetId` — currently selected dataset
- `activeGraphConfig` — axis mapping, chart type, transform selections
- `selectedRegion` — ROI for analysis

Actions: `ADD_DATASET`, `SET_ACTIVE_DATASET`, `UPDATE_GRAPH_CONFIG`, `SET_SELECTED_REGION`, `RENAME_HEADER`

### Transforms Library (`src/analysis/transforms.js`)

Built-in transforms: `sqrt`, `ln`, `log10`, `square`, `reciprocal`, `abs`, `multiply`

Each transform defines:

- `fn(value)` — the math function
- `formatLabel(col)` — axis label formatter (e.g., `"√(frequency)"`)
- `arity` — 1 (unary) or 2 (binary, e.g., `a×b`)

**Chaining**: `applyTransform(data, column, { id, secondColumn?, outer? })` supports an optional `outer` wrapping transform. Example: `{ id: 'multiply', secondColumn: 'freq', outer: 'ln' }` → `ln(amplitude × freq)`.

### Analysis Registry (`src/analysis/registry.js`)

Plugin-based system. Each module defines:

- `id`, `name`, `description`, `inputs[]`
- `calculate(data, inputs, { slope })` — computation function
- `help` — optional workflow guide text

The regression `useEffect` in `AnalysisPanel` applies active transforms before filtering by the selected region, ensuring slope calculation works correctly in both raw and transformed views.

## How to Extend

### Adding a New Calculation Module

Add a new entry to `src/analysis/registry.js`:

```javascript
const youngsModulus = {
  id: 'youngs-modulus',
  name: "Young's Modulus",
  description: 'Calculates Young\'s Modulus from stress-strain slope.',
  inputs: [
    { id: 'area', name: 'Cross-sectional Area', type: 'number', unit: 'mm²' }
  ],
  required_analysis: ['linear_regression'],
  calculate: (data, inputs, analysisResults) => {
    // ... logic
    return { value: result, unit: 'Pa' };
  }
};
```

Add it to the `registry` object. The UI will automatically generate the corresponding inputs and result display.

### Adding a New Transform

Add a new entry to the `TRANSFORMS` array in `src/analysis/transforms.js`:

```javascript
{ id: 'cube', name: 'x³', fn: v => v ** 3, formatLabel: c => `(${c})³`, arity: 1 }
```

It will automatically appear in the f(x) dropdown in the toolbar.

### Adding a New Chart Type

Supported types: `line`, `line-dots`, `scatter`, `area`, `step`, `bar`.

1. Add a new entry to `CHART_TYPES` array in `src/components/ChartFactory.jsx`.
2. Add a rendering block for the new chart type using the shared `xAxisProps`, `yAxisProps`, `tooltipProps`.
3. Theme colors are reactive via `useTheme()` from `ThemeContext`.

## Theming

Theme tokens are defined as CSS custom properties in `src/styles/index.css`:

- `--text-1` through `--text-4`: text hierarchy (primary → subtle)
- `--panel-bg`, `--surface-bg`, `--app-bg`: background layers
- `--accent`, `--accent-hover`: interactive highlights
- `--border-1`, `--border-2`: border hierarchy

Both dark and light themes are supported via `[data-theme]` attribute.
