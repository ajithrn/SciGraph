
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplesDir = path.join(__dirname, '../samples');

// Ensure directory exists
if (!fs.existsSync(samplesDir)){
    fs.mkdirSync(samplesDir, { recursive: true });
}

// 1. Thermal Diffusivity (Linearized Phase vs Sqrt(Freq))
let thermalData = 'SqrtFrequency,Phase\n';
for (let i = 1; i <= 20; i++) {
    const sqrtF = i * 0.5;
    const phase = -1.77 * sqrtF + (Math.random() * 0.1 - 0.05); // Add small noise
    thermalData += `${sqrtF.toFixed(2)},${phase.toFixed(3)}\n`;
}
fs.writeFileSync(path.join(samplesDir, 'thermal_diffusivity.csv'), thermalData);
console.log('Created thermal_diffusivity.csv');

// 2. Noisy Sine Wave (For Smoothing & Peak Finder)
let sineData = 'Time,Amplitude\n';
for (let i = 0; i <= 200; i++) { 
    const t = i * 0.1;
    const clean = Math.sin(t);
    const noise = (Math.random() - 0.5) * 0.5; // Significant noise
    sineData += `${t.toFixed(2)},${(clean + noise).toFixed(4)}\n`;
}
fs.writeFileSync(path.join(samplesDir, 'noisy_sine.csv'), sineData);
console.log('Created noisy_sine.csv');

// 3. Exponential Decay (For Area Under Curve)
let decayData = 'Time,Signal\n';
for (let i = 0; i <= 50; i++) {
    const t = i * 0.5;
    const y = 10 * Math.exp(-t / 5);
    decayData += `${t.toFixed(2)},${y.toFixed(4)}\n`;
}
fs.writeFileSync(path.join(samplesDir, 'exponential_decay.csv'), decayData);
console.log('Created exponential_decay.csv');

// 4. Random Distribution (For Stats)
let distData = 'Index,Value\n';
for (let i = 0; i < 100; i++) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const val = 50 + z * 10;
    distData += `${i},${val.toFixed(2)}\n`;
}
fs.writeFileSync(path.join(samplesDir, 'random_distribution.csv'), distData);
console.log('Created random_distribution.csv');

// 5. Polynomial Curve (For Derivatives)
let polyData = 'x,y\n';
for (let i = -100; i <= 100; i++) {
    const x = i * 0.05;
    // y = 0.5x^3 - 2x^2 + x + 5
    const y = 0.5 * Math.pow(x, 3) - 2 * Math.pow(x, 2) + x + 5;
    polyData += `${x.toFixed(3)},${y.toFixed(4)}\n`;
}
fs.writeFileSync(path.join(samplesDir, 'polynomial_curve.csv'), polyData);
console.log('Created polynomial_curve.csv');

console.log('All sample files generated successfully in samples/ directory.');
