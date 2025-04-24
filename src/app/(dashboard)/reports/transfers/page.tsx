'use client';

import { useState, useEffect } from 'react';
import { RoleBasedTable } from '@/components/ui/RoleBasedTable';
import { RoleBasedChart } from '@/components/ui/RoleBasedChart';
import { RoleBasedStats } from '@/components/ui/RoleBasedStats';
import { ExportButton } from '@/components/ui/ExportButton';
import type {
  TransferStats,
  LocationTransferData,
  TransferTrendData,
  DepartmentTransferData,
  Column,
} from '@/types/reports';

export default function TransferReportsPage() {
  const [loading, setLoading] = useState(true);
  const [transferStats, setTransferStats] = useState<TransferStats | null>(null);
  const [locationTransfers, setLocationTransfers] = useState<LocationTransferData[]>([]);
  const [transferTrend, setTransferTrend] = useState<TransferTrendData[]>([]);
  const [departmentTransfers, setDepartmentTransfers] = useState<DepartmentTransferData[]>([]);

  useEffect(() => {
    fetchTransferReports();
  }, []);

  const fetchTransferReports = async () => {
    try {
      const response = await fetch('/api/reports/transfers');
      if (!response.ok) throw new Error('Failed to fetch transfer reports');
      const data = await response.json();
      
      setTransferStats(data.stats);
      setLocationTransfers(data.byLocation || []);
      setTransferTrend(data.trend || []);
      setDepartmentTransfers(data.byDepartment || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const locationColumns = [
    {
      key: 'fromLocation',
      header: 'From Location',
      accessorKey: 'fromLocation',
    },
    {
      key: 'toLocation',
      header: 'To Location',
      accessorKey: 'toLocation',
    },
    {
      key: 'count',
      header: 'Transfer Count',
      accessorKey: 'count',
    },
    {
      key: 'percentage',
      header: 'Percentage',
      accessorKey: 'count',
      cell: ({ row }: { row: { original: LocationTransferData } }) => {
        const total = locationTransfers.reduce((sum, item) => sum + item.count, 0);
        return `${((row.original.count / total) * 100).toFixed(1)}%`;
      },
    },
  ] as Column<LocationTransferData>[];

  const departmentColumns = [
    {
      key: 'department',
      header: 'Department',
      accessorKey: 'department',
    },
    {
      key: 'outgoing',
      header: 'Outgoing Transfers',
      accessorKey: 'outgoing',
    },
    {
      key: 'incoming',
      header: 'Incoming Transfers',
      accessorKey: 'incoming',
    },
    {
      key: 'netTransfer',
      header: 'Net Transfer',
      accessorKey: 'outgoing',
      cell: ({ row }: { row: { original: DepartmentTransferData } }) => 
        row.original.incoming - row.original.outgoing,
    },
    {
      key: 'avgProcessingDays',
      header: 'Avg Processing Time',
      accessorKey: 'avgProcessingDays',
      cell: ({ row }: { row: { original: DepartmentTransferData } }) => 
        `${row.original.avgProcessingDays} days`,
    },
  ] as Column<DepartmentTransferData>[];

  const exportColumns = locationColumns.map(col => ({
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
        <h1 className="text-2xl font-semibold">Transfer Reports</h1>
        <ExportButton
          data={locationTransfers}
          columns={exportColumns}
          fileName="Transfer_Report"
        />
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RoleBasedStats
          name="Total Transfers"
          value={transferStats?.totalTransfers || 0}
          trend={transferStats?.transferGrowth || 0}
          trendLabel="vs last month"
          variant="default"
        />
        <RoleBasedStats
          name="Pending Transfers"
          value={transferStats?.pendingTransfers || 0}
          variant="warning"
        />
        <RoleBasedStats
          name="Average Processing"
          value={`${transferStats?.avgProcessingDays || 0} days`}
          variant="default"
        />
        <RoleBasedStats
          name="Approval Rate"
          value={`${transferStats?.approvalRate || 0}%`}
          variant="success"
        />
      </div>

      {/* Transfer Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transfers by Location</h2>
          <RoleBasedChart
            type="bar"
            data={{
              labels: locationTransfers.map((item) => `${item.fromLocation} → ${item.toLocation}`),
              datasets: [{
                data: locationTransfers.map((item) => item.count),
              }],
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transfer Trend</h2>
          <RoleBasedChart
            type="line"
            data={{
              labels: transferTrend.map((item) => item.month),
              datasets: [
                {
                  label: 'Total Transfers',
                  data: transferTrend.map((item) => item.count),
                },
                {
                  label: 'Approved',
                  data: transferTrend.map((item) => item.approved),
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Department Transfer Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Transfers by Department</h2>
            <ExportButton
              data={departmentTransfers}
              columns={departmentColumns.map(col => ({
                header: col.header,
                accessorKey: col.accessorKey as string,
              }))}
              fileName="Transfer_Department_Details"
            />
          </div>
          <RoleBasedTable
            data={departmentTransfers}
            columns={departmentColumns}
          />
        </div>
      </div>
    </div>
  );
}
