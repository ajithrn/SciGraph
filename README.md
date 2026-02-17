# <img src="public/logo-dark.svg" width="32" height="32" align="center" alt="SciGraph Logo" /> SciGraph

**SciGraph** is a high-precision scientific data visualization tool designed for researchers and engineers. It bridges the gap between raw data acquisition and actionable insights through an intuitive, extensible interface.

## Core Capabilities

- **Universal Import**: Support for `CSV`, `XLS`, and `XLSX` (auto-detects headers).
- **Precision Plotting**: 6 chart types (Line, Scatter, Step, Bar, etc.) with scientific styling and 16:10 aspect ratio.
- **Data Analysis**: Built-in linear regression, region selection (ROI), and mathematical transforms (`ln`, `log`, `√`, `x²`, `1/x`).
- **Thermal Diffusivity**: Specialized module for calculating diffusivity ($D$) from slope ($B$).
- **Modern UI**: Dark/Light themes, full-width mode, and persistent dataset history.

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
