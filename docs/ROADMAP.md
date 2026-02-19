# SciGraph — Roadmap

## Current Chart Types (v1)

- Line
- Line + Dots
- Scatter (dots only)
- Area (gradient fill)
- Step (discrete/quantized data)
- Bar

## Future Chart Types

### Error Bars / Range Chart

Show data points with uncertainty bands (±σ). Essential for reporting experimental measurements with confidence intervals.
**Complexity:** Medium — Recharts supports `ErrorBar` component natively.

### Dual-Axis Chart

Two Y-axes for overlaying variables with different scales (e.g., temperature on left, pressure on right). Requires selecting a second Y column.
**Complexity:** Medium — needs UI for second Y-axis column selection.

### Histogram

Frequency distribution of a single variable. Useful for statistical analysis of repeated measurements. Requires binning logic.
**Complexity:** Medium — needs custom binning algorithm + single-axis mode.

### Polar / Radar Chart

For angular data — antenna patterns, crystal orientations, wind roses.
**Complexity:** Low-Medium — Recharts has `RadarChart`, but axis mapping is different.

### Heatmap

2D data density visualization. Requires X, Y, and Z (color intensity) columns.
**Complexity:** High — Recharts doesn't have native heatmap; would need custom rendering or a different library.

## Completed Features (v1.2)

### Analysis Modules

- **Basic Statistics**: Mean, Median, StdDev, Min, Max of selected region.
- **Area Under Curve**: Trapezoidal integration.
- **Peak Finder**: Automatic detection of global maximum in selection.
- **Data Smoothing**: Signal processing via **Moving Average** and **Savitzky-Golay** filters.
- **Derivatives**: 1st ($dy/dx$) and 2nd ($d^2y/dx^2$) derivatives via finite differences.
- **Modular Architecture**: Plugin-based analysis system (`src/analysis/modules/`).

### Dataset Management

- **Hot Swapping**: Instant dataset switching with intelligent axis reset.
- **History**: Recent files list (last 10) with persistence and deletion support.

### UI Enhancements

- **Select All**: One-click selection of entire dataset.
- **Input Controls**: Numeric steppers and keyboard support for parameters.
- **Dynamic Results**: Custom Result displays (grids, formulas) per module.
- **Empty States**: Clear guidance when no region is selected.

## In Progress

(None - moving to v1.3 Planning)

## Planned Features (v1.3+)

### Advanced Analysis

- **Curve Fitting**:
  - Polynomial ($Ax^2 + Bx + C$)
  - Exponential Decay ($Ae^{-kt}$)
  - Gaussian ($Ae^{-(x-\mu)^2/2\sigma^2}$)
- **Baseline Correction**: Linear or spline-based background subtraction.
- **FFT**: Spectral analysis.

### Chart Types

- **Error Bars**: Scatter plots with X/Y error ranges.
- **Dual-Axis**: Overlay two datasets with different scales.
- **Histogram**: Frequency distribution binning.
- **Heatmap**: 2D density plots.

### Data Management

- **Export**: Save smoothed/fitted data as new CSVs.
