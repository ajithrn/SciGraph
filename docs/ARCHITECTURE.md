# Architecture Guide

## Overview

SciGraph is designed with extensibility in mind. The core philosophy is to separate **Data Management**, **Visualization**, **Transformation**, and **Analysis** into independent, composable layers.

## Directory Structure

```
src/
├── analysis/               # Scientific computation layer
│   ├── modules/             # Individual analysis logic (e.g., stats.jsx)
│   ├── registry.js          # Analysis module aggregator
│   ├── utils.js             # Shared math utilities (linear regression)
│   └── transforms.js        # Data transformation library (sqrt, ln, etc.)
├── components/              # UI Components
│   ├── GraphViewer.jsx      # Main chart + two-row toolbar + transform selectors
│   ├── ChartFactory.jsx     # Recharts-based chart renderer
│   ├── DataUploader.jsx     # File import, manual entry, column rename editor
│   ├── AnalysisPanel.jsx    # Analysis toolkit (dynamic inputs, params, results)
│   ├── HelpPanel.jsx        # Encapsulated documentation overlay
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

Plugin-based system. Each analysis method is a self-contained module in `src/analysis/modules/`.

Each module exports an object defining:

- `id`, `name`, `description`, `inputs[]`
- `calculate(data, inputs, { slope, regionData })` — computation function returning a result object.
- `renderInfo(regression)` — (Optional) Function returning React node for custom formula display.
- `renderResult(result)` — (Optional) Function returning React node for custom result formatting.
- `required_analysis` — Array of dependencies (e.g., `['linear_regression']`).

The registry aggregates these modules and exports them for use by the `AnalysisPanel`.

## How to Extend

### Adding a New Calculation Module

### Adding a New Calculation Module

1. Create a new file in `src/analysis/modules/` (e.g., `youngsModulus.jsx`):

```javascript
import React from 'react';

export const youngsModulus = {
  id: 'youngs-modulus',
  name: "Young's Modulus",
  description: 'Calculates Young\'s Modulus from stress-strain slope.',
  inputs: [
    { id: 'area', name: 'Area', type: 'number', unit: 'mm²' }
  ],
  required_analysis: ['linear_regression'],
  calculate: (data, inputs, ctx) => {
    // ... logic using ctx.slope
    return { value: result, unit: 'Pa' };
  },
  // Optional: Custom result display
  renderResult: (res) => (
    <div className="font-bold">{res.value} {res.unit}</div>
  )
};
```

1. Import and add it to the `registry` object in `src/analysis/registry.js`.
2. The UI will automatically generate the corresponding inputs and result display.

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
