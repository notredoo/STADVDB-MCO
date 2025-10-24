export const chartColors = {
  primary: '#3b82f6',   // soft blue
  secondary: '#06b6d4', // cyan / teal
  accent: '#8b5cf6',    // violet for highlights
  background: '#f9fafb', // light neutral background
  text: '#111827',      // dark gray for text
  grid: '#d1d5db',      // light gray grid lines
  tooltipBg: '#ffffff',
  tooltipBorder: '#e5e7eb',
};

export const chartTheme = {
  fontSize: 12,
  axisColor: chartColors.text,
  gridColor: chartColors.grid,
  tooltip: {
    background: chartColors.tooltipBg,
    color: chartColors.text,
    border: chartColors.tooltipBorder,
  },
};
