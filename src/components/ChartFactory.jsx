import React from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Label
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

// Scientific tick formatter: use exponential for very large/small numbers
function formatScientificTick(value) {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 10000 || (abs > 0 && abs < 0.01)) {
    return value.toExponential(1);
  }
  if (Number.isInteger(value)) return value.toString();
  return parseFloat(value.toPrecision(4)).toString();
}

// Chart type definitions
export const CHART_TYPES = [
  { id: 'line', name: 'Line' },
  { id: 'line-dots', name: 'Line + Dots' },
  { id: 'scatter', name: 'Scatter' },
  { id: 'area', name: 'Area' },
  { id: 'step', name: 'Step' },
  { id: 'bar', name: 'Bar' },
];

const ChartFactory = ({ data, config }) => {
  const chartType = config.chartType || 'line';
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  const colors = isDark ? {
    grid: '#52525b',
    axis: '#a1a1aa',
    tick: '#e4e4e7',
    label: '#f4f4f5',
    tooltipBg: '#1c1c1f',
    tooltipBorder: '#52525b',
    tooltipText: '#fafafa',
    line: '#60a5fa',
    cursor: '#60a5fa',
  } : {
    grid: '#d4d4d8',
    axis: '#71717a',
    tick: '#27272a',
    label: '#18181b',
    tooltipBg: '#ffffff',
    tooltipBorder: '#d4d4d8',
    tooltipText: '#09090b',
    line: '#1d4ed8',
    cursor: '#1d4ed8',
  };

  const xLabel = config.xAxis || '';
  const yLabel = config.yAxis || '';

  const zoom = config.zoomLevel || 1;
  const xTickCount = Math.round(8 * zoom * zoom);
  const yTickCount = Math.round(6 * zoom * zoom);

  // Shared axis and tooltip config
  const xAxisProps = {
    dataKey: config.xAxis,
    stroke: colors.axis,
    tick: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: colors.tick },
    tickFormatter: formatScientificTick,
    type: 'number',
    domain: ['dataMin', 'dataMax'],
    tickCount: xTickCount,
  };

  const yAxisProps = {
    stroke: colors.axis,
    tick: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: colors.tick },
    tickFormatter: formatScientificTick,
    type: 'number',
    domain: ['dataMin', 'dataMax'],
    tickCount: yTickCount,
  };

  const tooltipProps = {
    contentStyle: {
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      borderRadius: '6px',
      color: colors.tooltipText,
      fontSize: '11px',
      fontFamily: "'JetBrains Mono', monospace",
    },
    itemStyle: { color: colors.tooltipText },
    formatter: (value) => [formatScientificTick(value)],
    cursor: { stroke: colors.cursor, strokeWidth: 1, strokeDasharray: '4 4' },
  };

  const regionOverlay = config.selectedRegion && (
    <ReferenceArea
      x1={config.selectedRegion.start}
      x2={config.selectedRegion.end}
      strokeOpacity={0.3}
      fill={colors.line}
      fillOpacity={0.1}
    />
  );

  const mouseHandlers = {
    onMouseDown: config.onMouseDown,
    onMouseMove: config.onMouseMove,
    onMouseUp: config.onMouseUp,
  };

  const margin = { top: 20, right: 30, left: 25, bottom: 40 };

  // ── Line / Line+Dots ──
  if (chartType === 'line' || chartType === 'line-dots') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} {...mouseHandlers} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.7} />
          <XAxis {...xAxisProps}>
            <Label value={xLabel} position="bottom" offset={15}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500 }} />
          </XAxis>
          <YAxis {...yAxisProps}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={-10}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500, textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip {...tooltipProps} />
          <Line
            type="monotone"
            dataKey={config.yAxis}
            stroke={colors.line}
            strokeWidth={1.5}
            dot={chartType === 'line-dots' ? { r: 3, fill: colors.line, strokeWidth: 0 } : false}
            activeDot={{ r: 4, fill: colors.line, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {regionOverlay}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ── Scatter (dots only) ──
  if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart {...mouseHandlers} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.7} />
          <XAxis {...xAxisProps} name={xLabel}>
            <Label value={xLabel} position="bottom" offset={15}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500 }} />
          </XAxis>
          <YAxis {...yAxisProps} dataKey={config.yAxis} name={yLabel}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={-10}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500, textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip {...tooltipProps} />
          <Scatter
            data={data}
            fill={colors.line}
            shape="circle"
            isAnimationActive={false}
          />
          {regionOverlay}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // ── Area ──
  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} {...mouseHandlers} margin={margin}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.line} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.line} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.7} />
          <XAxis {...xAxisProps}>
            <Label value={xLabel} position="bottom" offset={15}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500 }} />
          </XAxis>
          <YAxis {...yAxisProps}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={-10}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500, textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip {...tooltipProps} />
          <Area
            type="monotone"
            dataKey={config.yAxis}
            stroke={colors.line}
            strokeWidth={1.5}
            fill="url(#areaGradient)"
            dot={false}
            activeDot={{ r: 4, fill: colors.line, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {regionOverlay}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // ── Step ──
  if (chartType === 'step') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} {...mouseHandlers} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.7} />
          <XAxis {...xAxisProps}>
            <Label value={xLabel} position="bottom" offset={15}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500 }} />
          </XAxis>
          <YAxis {...yAxisProps}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={-10}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500, textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip {...tooltipProps} />
          <Line
            type="stepAfter"
            dataKey={config.yAxis}
            stroke={colors.line}
            strokeWidth={1.5}
            dot={{ r: 2.5, fill: colors.line, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: colors.line, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {regionOverlay}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ── Bar ──
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} {...mouseHandlers} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.7} />
          <XAxis {...xAxisProps}>
            <Label value={xLabel} position="bottom" offset={15}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500 }} />
          </XAxis>
          <YAxis {...yAxisProps}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={-10}
              style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: colors.label, fontWeight: 500, textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip {...tooltipProps} />
          <Bar
            dataKey={config.yAxis}
            fill={colors.line}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
          {regionOverlay}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return <div className="text-sm" style={{ color: 'var(--text-4)' }}>Chart type '{chartType}' not yet supported.</div>;
};

export default ChartFactory;
