'use client';

// Import the chart registration file first
import '@/lib/chart-registry';

import { Bar, Line, Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

import { ChartType } from '@/types/chart';

interface ClientChartProps {
  type: ChartType;
  data: any;
  options?: any;
}

// Define specific chart components with their types
const ChartComponents = {
  line: Line as any,
  bar: Bar as any,
  pie: Pie as any,
  heatmap: Bar as any, // Using Bar as base for heatmap
} as const;

// Default empty data structure
const defaultData = {
  labels: [],
  datasets: [{
    data: [],
  }],
};

export function ClientChart({ type, data, options }: ClientChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Force a re-render after component mounts
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const ChartComponent = ChartComponents[type];

  if (!ChartComponent) {
    console.error(`Invalid chart type: ${type}`);
    return null;
  }

  // Ensure data is properly structured
  const chartData = data?.datasets ? data : defaultData;

  // Use a key to force re-render when type changes
  return <ChartComponent key={type} data={chartData} options={options} />;
} 