'use client';

import { useState, useEffect } from 'react';
import { RoleBasedTable } from '@/components/ui/RoleBasedTable';
import { RoleBasedChart } from '@/components/ui/RoleBasedChart';
import { RoleBasedStats } from '@/components/ui/RoleBasedStats';
import { ExportButton } from '@/components/ui/ExportButton';
import type {
  MaintenanceStats,
  MaintenanceStatusData,
  MaintenanceTrendData,
  MaintenanceAssetData,
  Column,
} from '@/types/reports';

export default function MaintenanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [maintenanceStats, setMaintenanceStats] = useState<MaintenanceStats | null>(null);
  const [maintenanceByStatus, setMaintenanceByStatus] = useState<MaintenanceStatusData[]>([]);
  const [maintenanceTrend, setMaintenanceTrend] = useState<MaintenanceTrendData[]>([]);
  const [maintenanceByAsset, setMaintenanceByAsset] = useState<MaintenanceAssetData[]>([]);

  useEffect(() => {
    fetchMaintenanceReports();
  }, []);

  const fetchMaintenanceReports = async () => {
    try {
      const response = await fetch('/api/reports/maintenance');
      if (!response.ok) throw new Error('Failed to fetch maintenance reports');
      const data = await response.json();
      
      setMaintenanceStats(data.stats);
      setMaintenanceByStatus(data.byStatus || []);
      setMaintenanceTrend(data.trend || []);
      setMaintenanceByAsset(data.byAsset || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColumns = [
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
    },
    {
      key: 'count',
      header: 'Count',
      accessorKey: 'count',
    },
    {
      key: 'percentage',
      header: 'Percentage',
      accessorKey: 'count',
      cell: ({ row }: { row: { original: MaintenanceStatusData } }) => {
        const total = maintenanceByStatus.reduce((sum, item) => sum + item.count, 0);
        return `${((row.original.count / total) * 100).toFixed(1)}%`;
      },
    },
  ] as Column<MaintenanceStatusData>[];

  const assetColumns = [
    {
      key: 'name',
      header: 'Asset Name',
      accessorKey: 'name',
    },
    {
      key: 'totalRequests',
      header: 'Total Requests',
      accessorKey: 'totalRequests',
    },
    {
      key: 'lastMaintenance',
      header: 'Last Maintenance',
      accessorKey: 'lastMaintenance',
    },
    {
      key: 'averageCost',
      header: 'Average Cost',
      accessorKey: 'averageCost',
      cell: ({ row }: { row: { original: MaintenanceAssetData } }) => 
        row.original.averageCost ? `$${row.original.averageCost.toFixed(2)}` : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
    },
  ] as Column<MaintenanceAssetData>[];

  const exportColumns = statusColumns.map(col => ({
    header: col.header,
    accessorKey: col.accessorKey as string,
  }));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Maintenance Reports</h1>
        <ExportButton
          data={maintenanceByStatus}
          columns={exportColumns}
          fileName="Maintenance_Report"
        />
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RoleBasedStats
          name="Total Requests"
          value={maintenanceStats?.totalRequests || 0}
          trend={maintenanceStats?.requestGrowth || 0}
          trendLabel="vs last month"
          variant="default"
        />
        <RoleBasedStats
          name="Pending Requests"
          value={maintenanceStats?.pendingRequests || 0}
          variant="warning"
        />
        <RoleBasedStats
          name="Average Resolution"
          value={`${maintenanceStats?.avgResolutionDays || 0} days`}
          variant="default"
        />
        <RoleBasedStats
          name="Completion Rate"
          value={`${maintenanceStats?.completionRate || 0}%`}
          variant="success"
        />
      </div>

      {/* Maintenance Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Maintenance by Status</h2>
          <RoleBasedChart
            type="pie"
            data={{
              labels: maintenanceByStatus.map((item) => item.status),
              datasets: [{
                data: maintenanceByStatus.map((item) => item.count),
              }],
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Maintenance Trend</h2>
          <RoleBasedChart
            type="line"
            data={{
              labels: maintenanceTrend.map((item) => item.month),
              datasets: [
                {
                  label: 'Total Requests',
                  data: maintenanceTrend.map((item) => item.count),
                },
                {
                  label: 'Completed',
                  data: maintenanceTrend.map((item) => item.completed),
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Maintenance by Asset Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Maintenance by Asset</h2>
            <ExportButton
              data={maintenanceByAsset}
              columns={assetColumns.map(col => ({
                header: col.header,
                accessorKey: col.accessorKey as string,
              }))}
              fileName="Maintenance_Asset_Details"
            />
          </div>
          <RoleBasedTable
            data={maintenanceByAsset}
            columns={assetColumns}
          />
        </div>
      </div>
    </div>
  );
}
