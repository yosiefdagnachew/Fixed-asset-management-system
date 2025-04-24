'use client';

import { useState, useEffect } from 'react';
import { RoleBasedTable } from '@/components/ui/RoleBasedTable';
import { RoleBasedChart } from '@/components/ui/RoleBasedChart';
import { RoleBasedStats } from '@/components/ui/RoleBasedStats';
import { ExportButton } from '@/components/ui/ExportButton';
import type {
  DisposalStats,
  DisposalMethodData,
  DisposalTrendData,
  ValueRecoveryData,
  Column,
} from '@/types/reports';

export default function DisposalReportsPage() {
  const [loading, setLoading] = useState(true);
  const [disposalStats, setDisposalStats] = useState<DisposalStats | null>(null);
  const [disposalByMethod, setDisposalByMethod] = useState<DisposalMethodData[]>([]);
  const [disposalTrend, setDisposalTrend] = useState<DisposalTrendData[]>([]);
  const [valueRecovery, setValueRecovery] = useState<ValueRecoveryData[]>([]);

  useEffect(() => {
    fetchDisposalReports();
  }, []);

  const fetchDisposalReports = async () => {
    try {
      const response = await fetch('/api/reports/disposals');
      if (!response.ok) throw new Error('Failed to fetch disposal reports');
      const data = await response.json();
      
      setDisposalStats(data.stats);
      setDisposalByMethod(data.byMethod || []);
      setDisposalTrend(data.trend || []);
      setValueRecovery(data.valueRecovery || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const methodColumns = [
    {
      key: 'method',
      header: 'Disposal Method',
      accessorKey: 'method',
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
      cell: ({ row }: { row: { original: DisposalMethodData } }) => {
        const total = disposalByMethod.reduce((sum, item) => sum + item.count, 0);
        return `${((row.original.count / total) * 100).toFixed(1)}%`;
      },
    },
  ] as Column<DisposalMethodData>[];

  const recoveryColumns = [
    {
      key: 'month',
      header: 'Month',
      accessorKey: 'month',
    },
    {
      key: 'expected',
      header: 'Expected Recovery',
      accessorKey: 'expected',
      cell: ({ row }: { row: { original: ValueRecoveryData } }) => 
        `$${row.original.expected.toFixed(2)}`,
    },
    {
      key: 'actual',
      header: 'Actual Recovery',
      accessorKey: 'actual',
      cell: ({ row }: { row: { original: ValueRecoveryData } }) => 
        `$${row.original.actual.toFixed(2)}`,
    },
    {
      key: 'rate',
      header: 'Recovery Rate',
      accessorKey: 'rate',
      cell: ({ row }: { row: { original: ValueRecoveryData } }) => 
        `${(row.original.rate || 0).toFixed(1)}%`,
    },
  ] as Column<ValueRecoveryData>[];

  const exportColumns = methodColumns.map(col => ({
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
        <h1 className="text-2xl font-semibold">Disposal Reports</h1>
        <ExportButton
          data={disposalByMethod}
          columns={exportColumns}
          fileName="Disposal_Report"
        />
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RoleBasedStats
          name="Total Disposals"
          value={disposalStats?.totalDisposals || 0}
          trend={disposalStats?.disposalGrowth || 0}
          trendLabel="vs last month"
          variant="default"
        />
        <RoleBasedStats
          name="Total Recovered"
          value={`$${disposalStats?.totalRecovered?.toLocaleString() || 0}`}
          trend={disposalStats?.recoveryGrowth || 0}
          trendLabel="vs last month"
          variant="success"
        />
        <RoleBasedStats
          name="Recovery Rate"
          value={`${disposalStats?.recoveryRate || 0}%`}
          variant="default"
        />
        <RoleBasedStats
          name="Pending Disposals"
          value={disposalStats?.pendingDisposals || 0}
          variant="warning"
        />
      </div>

      {/* Disposal Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Disposals by Method</h2>
          <RoleBasedChart
            type="pie"
            data={{
              labels: disposalByMethod.map((item) => item.method),
              datasets: [{
                data: disposalByMethod.map((item) => item.count),
              }],
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Disposal Trend</h2>
          <RoleBasedChart
            type="line"
            data={{
              labels: disposalTrend.map((item) => item.month),
              datasets: [{
                data: disposalTrend.map((item) => item.count),
              }],
            }}
          />
        </div>
      </div>

      {/* Value Recovery Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Value Recovery Details</h2>
            <ExportButton
              data={valueRecovery}
              columns={recoveryColumns.map(col => ({
                header: col.header,
                accessorKey: col.accessorKey as string,
              }))}
              fileName="Value_Recovery_Details"
            />
          </div>
          <RoleBasedTable
            data={valueRecovery}
            columns={recoveryColumns}
          />
        </div>
      </div>
    </div>
  );
}
