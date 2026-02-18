import { thermalDiffusivity } from './modules/thermalDiffusivity.jsx';
import { basicStats } from './modules/basicStats.jsx';
import { areaUnderCurve } from './modules/areaUnderCurve.jsx';
import { peakFinder } from './modules/peakFinder.jsx';
import { smoothing } from './modules/smoothing.jsx';
import { calculateLinearRegression } from './utils';

// Analysis Registry
const registry = {
  [thermalDiffusivity.id]: thermalDiffusivity,
  [basicStats.id]: basicStats,
  [areaUnderCurve.id]: areaUnderCurve,
  [peakFinder.id]: peakFinder,
  [smoothing.id]: smoothing,
};

export function getAnalysisModules() {
  return Object.values(registry);
}

export function getAnalysisModule(id) {
  return registry[id];
}

export { calculateLinearRegression };
