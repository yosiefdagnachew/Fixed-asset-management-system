'use client';

import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Import chart registration
import '@/lib/chart-registry';

const ClientChart = dynamic(() => import("./ClientChart").then(mod => mod.ClientChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg" />,
});

import { ChartType } from '@/types/chart';

interface RoleBasedChartProps {
  type: ChartType;
  data: any[] | {
    labels: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
    }>;
  };
  options?: {
    labels?: string[];
    values?: number[];
    xAxis?: string[];
    yAxis?: number[];
    series?: Array<{
      name: string;
      data: number[];
    }>;
  };
  permission?: string;
  className?: string;
  title?: string;
  description?: string;
}

// Default empty data structure
const defaultData = {
  labels: [],
  datasets: [{
    data: [],
  }],
};

export function RoleBasedChart({
  type,
  data,
  options,
  permission,
  className,
  title,
  description,
}: RoleBasedChartProps) {
  const { checkPermission } = usePermissions();

  if (permission && !checkPermission(permission)) {
    return null;
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={cn("bg-white p-4 rounded-lg shadow", className)}>
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // Format data based on chart type
  const formattedData = (() => {
    switch (type) {
      case 'pie':
        return {
          labels: data.map(item => item.category || item.status),
          datasets: [{
            data: data.map(item => item.count || item.value),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40'
            ],
          }]
        };
      case 'bar':
        return {
          labels: data.map(item => item.category),
          datasets: [{
            label: 'Value',
            data: data.map(item => item.value),
            backgroundColor: '#36A2EB',
          }]
        };
      case 'line':
        return {
          labels: data.map(item => item.month),
          datasets: [
            {
              label: 'Book Value',
              data: data.map(item => item.value),
              borderColor: '#36A2EB',
              tension: 0.1
            },
            {
              label: 'Depreciation',
              data: data.map(item => item.depreciation),
              borderColor: '#FF6384',
              tension: 0.1
            }
          ]
        };
      default:
        return {
          labels: [],
          datasets: []
        };
    }
  })();

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow", className)}>
      {title && (
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      <div className="relative h-[300px]">
        <ClientChart key={type} type={type} data={formattedData} options={mergedOptions} />
      </div>
    </div>
  );
} 