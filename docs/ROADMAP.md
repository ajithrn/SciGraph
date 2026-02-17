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

## Future Analysis Features

### Curve Fitting

Fit common scientific functions (polynomial, exponential, Gaussian, power law) to data. Display best-fit parameters with uncertainties.

### FFT / Spectral Analysis

Compute and display frequency spectrum of time-series data.

### Statistical Summary

Min, max, mean, median, std deviation, skewness, kurtosis for each column.

### Data Interpolation / Smoothing

Spline interpolation, moving average, Savitzky-Golay filter.

### Export Options

- Export data as CSV/Excel with transforms applied
- Export chart as SVG (vector) in addition to PNG
- Export analysis results as formatted report
