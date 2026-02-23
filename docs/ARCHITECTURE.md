# Architecture Guide

## Overview

SciGraph is designed with extensibility in mind. The core philosophy is to separate **Data Management**, **Visualization**, **Transformation**, and **Analysis** into independent, composable layers.

## Directory Structure

```
src/
├── analysis/               # Scientific computation layer
│   ├── modules/             # Individual analysis logic (e.g., stats.jsx, derivatives.jsx)
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
samples/
└── ...                      # Included CSV files for testing analysis methods
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

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier |
| `name` | `string` | ✅ | Display name shown in the Method dropdown |
| `description` | `string \| (regression, inputs) => string` | ✅ | Description text. Can be a function to return different text based on current inputs |
| `inputs[]` | `array` | ✅ | List of input definitions (see below) |
| `required_analysis` | `string[]` | ✅ | Dependencies e.g. `['linear_regression']`. Pass `[]` if none needed |
| `calculate(data, inputs, ctx)` | `function` | ✅ | Main computation. Returns `{ value, unit, formula }` or `{ error }` |
| `help` | `string \| JSX \| (regression, inputs) => JSX` | — | Workflow guide shown via the "Show workflow guide" toggle |
| `renderInfo(regression, inputs)` | `function => JSX` | — | Formula card shown in the description block. Receives current regression + inputs so it can be dynamic |
| `renderResult(result, dispatch)` | `function => JSX` | — | Custom result display. Falls back to a standard value/unit/formula layout if omitted |
| `showSlope(inputs)` | `function => bool` | — | If provided, hides the auto-computed Slope (B) row when returns `false`. Useful for modes that don't use regression |

**Input definition fields**:

| Field | Description |
|---|---|
| `id` | Unique key |
| `name` | Label in the UI |
| `type` | `'number'` or `'select'` |
| `defaultValue` | Initial value |
| `unit` | (number) Unit label shown in the input widget |
| `min`, `max`, `step` | (number) Bounds and increment |
| `options[]` | (select) `[{ value, label }]` |
| `description` | Short hint shown below the input |
| `show(inputs) => bool` | If provided, the input is only rendered when this returns `true`. Used for conditionally relevant params |

Select-type inputs (e.g. Test Method, Smoothing Method) are automatically lifted above the description card in the UI. Number inputs are shown in the Parameters block, filtered by their `show()` function.

The registry aggregates these modules and exports them for use by the `AnalysisPanel`.

## How to Extend

### Adding a New Calculation Module

1. Create a new file in `src/analysis/modules/` (e.g., `youngsModulus.jsx`):

```javascript
import React from 'react';

export const youngsModulus = {
  id: 'youngs-modulus',
  name: "Young's Modulus",
  // description can be a string or a function of (regression, inputs)
  description: (regression, inputs) => {
    return 'Calculates Young\'s Modulus from the slope of a stress-strain curve.';
  },
  help: 'Select the linear region on the stress-strain graph, then enter the cross-sectional area.',
  inputs: [
    {
      id: 'area',
      name: 'Cross-Section Area',
      type: 'number',
      unit: 'mm²',
      defaultValue: 1,
      description: 'Cross-sectional area of the sample.',
    }
  ],
  required_analysis: ['linear_regression'],
  // renderInfo can use inputs to dynamically show the formula
  renderInfo: (regression, inputs) => (
    <div className="font-mono text-xs text-center">
      <div style={{ color: 'var(--accent)' }}>E = B / A</div>
      <div style={{ color: 'var(--text-4)' }}>B = slope, A = area</div>
    </div>
  ),
  calculate: (data, inputs, ctx) => {
    const E = ctx.slope / inputs.area;
    return { value: E, unit: 'GPa', formula: 'B / A' };
  }
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
