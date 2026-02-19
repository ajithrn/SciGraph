# <img src="public/logo-dark.svg" width="32" height="32" style="vertical-align: middle; margin-right: 8px;" alt="SciGraph Logo" /> SciGraph

**SciGraph** is a high-precision scientific data visualization tool designed for researchers and engineers. It bridges the gap between raw data acquisition and actionable insights through an intuitive, extensible interface.

## Core Capabilities

- **Universal Import**: Support for `CSV`, `XLS`, and `XLSX` (auto-detects headers) with drag & drop.
- **Precision Plotting**: 6 chart types (Line, Scatter, Area, Step, Bar, Dots) with scientific styling.
- **Data Transformation**: Advanced math (`ln`, `log`, `√`, `x²`, `1/x`), column arithmetic, and chaining.
- **Data Analysis**: Automated linear regression, interactive area selection (ROI), and statistical summaries.
- **Dataset Management**: Hot-swapping between datasets, recent file history (last 10), and one-click deletion.
- **Analysis Modules**: Basic Statistics, Area Under Curve, Peak Finder, Data Smoothing (MA, Savitzky-Golay), Derivatives (1st & 2nd Order).
- **Modern UI**: Dark/Light themes, resizable panels, and global font scaling (A+/A-).
- **Export**: Download publication-ready charts (High-Res PNG) and generated analysis datasets (CSV).

## Documentation

- **[User Methods & Calculations](docs/METHODS.md)**: Detailed explanation of formulas and transforms.
- **[Architecture](docs/ARCHITECTURE.md)**: Technical design and codebase structure.
- **[Roadmap](docs/ROADMAP.md)**: Future plans and feature tracking.

## Installation

```bash
git clone git@github.com:ajithrn/SciGraph.git
cd SciGraph
npm install
npm run dev
```

## Deployment

Automated deployment via GitHub Actions is supported. Push to `main` to trigger a build and deploy to GitHub Pages.

**Live URL**: [scigraph.trytoinnovate.com](https://scigraph.trytoinnovate.com/)

## Release

To bump the version in `package.json` (without git commit/tag):

```bash
npm run bump
```

Then manually commit and push to release:

```bash
git add .
git commit -m "chore: bump version to x.x.x"
git push
```
