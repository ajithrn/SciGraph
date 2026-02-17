# SciGraph

**SciGraph** is a high-precision scientific data visualization tool designed for researchers and engineers. It bridges the gap between raw data acquisition and actionable insights through an intuitive, extensible interface.

## Core Capabilities

### 1. Advanced Data Acquisition

- **Universal Import**: Seamlessly ingest data from `CSV`, `XLS`, and `XLSX` formats.
- **Auto-Parsing**: Intelligent detection of headers and data types. Headerless CSVs are auto-detected with synthetic column names (`Column 1`, `Column 2`, …).
- **Column Renaming**: Rename auto-generated column names directly from the sidebar.
- **Manual Entry**: Enter data manually with editable column headers.
- **Multi-Dataset Management**: Compare and analyze multiple experimental runs simultaneously.

### 2. Precision Visualization

- **6 Chart Types**: Line, Line + Dots, Scatter, Area, Step, and Bar — selectable from the toolbar.
- **Scientific Styling**: High-contrast axes, labels, and grid lines matching scientific paper standards.
- **Interactive Plotting**: Real-time zooming, panning, and scaling with configurable zoom levels.
- **16:10 Aspect Ratio**: Fixed scientific chart proportions centered in the workspace.
- **Region of Interest (ROI)**: Precise, click-and-drag selection for localized analysis.
- **Full-Width Mode**: Toggle to hide sidebars and maximize the chart area.
- **Raw Data Viewer**: Collapsible data table in the sidebar showing uploaded values.
- **Dynamic Axis Mapping**: Instantly switch between variables to explore correlations.
- **Dark/Light Themes**: Full theme support with high-contrast, accessible color palettes.

### 3. Data Transformations

- **Built-in Transforms**: Apply mathematical transformations to any axis — `√x`, `ln(x)`, `log₁₀(x)`, `x²`, `1/x`, `|x|`, `a×b`.
- **Transform Chaining**: Compose transforms such as `ln(a×b)` using inner + outer wrapping.
- **Processed Data Viewer**: Inspect transformed data in a collapsible table with copy-to-clipboard.

### 4. Analytical Engine

- **Linear Regression**: Automatic least-squares fitting on selected regions to determine slopes ($B$). Works correctly with both raw and transformed data.
- **Thermal Diffusivity**: Built-in module for calculating thermal diffusivity ($D = \pi L^2 / B^2$).
- **Extensible Registry**: A plugin-based architecture allowing users to define custom physical formulas without altering the core codebase.

## Scientific Methodology

### Thermal Diffusivity Calculation

The application implements the standard method for calculating thermal diffusivity from the slope of the linear region.

$$ D = \frac{\pi L^2}{B^2} $$

Where:

- $L$: Sample Thickness (mm)
- $B$: Slope of the linear regression

## Architecture & Extension

SciGraph is built on a modular **React** + **Vite** architecture.

- **`src/analysis/registry.js`**: The heart of the analytical engine. Add new physical models here.
- **`src/analysis/transforms.js`**: Data transformation library with chaining support.
- **`docs/ARCHITECTURE.md`**: Detailed technical documentation for developers.

## Installation

```bash
git clone git@github.com:ajithrn/SciGraph.git
cd SciGraph
npm install
npm run dev
```

## Deployment

Automated deployment via GitHub Actions is supported. Push to `main` to trigger a build and deploy to GitHub Pages.
