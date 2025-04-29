'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js/auto';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { RoleBasedChart } from '@/components/ui/RoleBasedChart';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

<<<<<<< HEAD
interface DashboardData {
  stats: {
    totalAssets: number;
    activeAssets: number;
    underMaintenanceAssets: number;
    totalValue: number;
  };
  monthlyDepreciation: Array<{
    month: string;
    depreciation: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
=======
const monthlyDepreciationData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Monthly Depreciation',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    },
  ],
};

import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  name: string;
  description?: string | null;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: string;
  location?: string | null;
  department?: string | null;
  category?: string | null;
  supplier?: string | null;
  warrantyExpiry?: string | null;
  lastMaintenance?: string | null;
  nextMaintenance?: string | null;
  createdAt: string;
  updatedAt: string;
>>>>>>> 56d1f01 (user management)
}

export default function DashboardPage() {
  const { data: session } = useSession();
<<<<<<< HEAD
  
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Assets', value: dashboardData?.stats.totalAssets.toString() || '0' },
    { name: 'Active Assets', value: dashboardData?.stats.activeAssets.toString() || '0' },
    { name: 'Under Maintenance', value: dashboardData?.stats.underMaintenanceAssets.toString() || '0' },
    { 
      name: 'Total Value', 
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(dashboardData?.stats.totalValue || 0)
    },
  ];

  const statusDistributionData = {
    labels: dashboardData?.statusDistribution.map((item) => item.status) || [],
    datasets: [
      {
        data: dashboardData?.statusDistribution.map((item) => item.count) || [],
=======
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/assets');
        if (!response.ok) throw new Error('Failed to fetch assets');
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const activeAssets = assets.filter(a => a.status === 'ACTIVE').length;
  const maintenanceAssets = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
  const totalValue = assets.reduce((acc, a) => acc + (a.currentValue || 0), 0);

  const stats = [
    { name: 'Total Assets', value: assets.length },
    { name: 'Active Assets', value: activeAssets },
    { name: 'Under Maintenance', value: maintenanceAssets },
    { name: 'Total Value', value: `$${totalValue.toLocaleString()}` },
  ];

  const assetStatusData = {
    labels: ['Active', 'Under Maintenance', 'Transferred', 'Disposed'],
    datasets: [
      {
        data: [
          assets.filter(a => a.status === 'ACTIVE').length,
          assets.filter(a => a.status === 'UNDER_MAINTENANCE').length,
          assets.filter(a => a.status === 'TRANSFERRED').length,
          assets.filter(a => a.status === 'DISPOSED').length,
        ],
>>>>>>> 56d1f01 (user management)
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
<<<<<<< HEAD

  const monthlyDepreciationData = {
    labels: dashboardData?.monthlyDepreciation.map((item) => {
      const date = new Date(item.month);
      return date.toLocaleString('default', { month: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Monthly Depreciation',
        data: dashboardData?.monthlyDepreciation.map((item) => item.depreciation) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };
=======
>>>>>>> 56d1f01 (user management)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, <span className="font-bold text-red-600">{session?.user?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Asset Status Distribution
          </h2>
          <div className="h-80">
            <Pie data={statusDistributionData} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Depreciation
          </h2>
          <div className="h-80">
            <Bar
              data={monthlyDepreciationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => {
                        if (typeof value === 'number') {
                          return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(value);
                        }
                        return '';
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RoleBasedChart
          type="bar"
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Asset Value',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
            ],
          }}
          title="Asset Value Distribution"
          permission="view_analytics"
        />
        <RoleBasedChart
          type="line"
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Asset Growth',
                data: [0, 10, 5, 15, 10, 20],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
              },
            ],
          }}
          title="Asset Growth Trend"
          permission="view_analytics"
        />
      </div>
    </div>
  );
} 