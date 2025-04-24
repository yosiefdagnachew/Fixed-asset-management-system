'use client';

import { useState, useEffect } from 'react';
import { RoleBasedTable } from '@/components/ui/RoleBasedTable';
import { RoleBasedChart } from '@/components/ui/RoleBasedChart';
import { RoleBasedStats } from '@/components/ui/RoleBasedStats';
import { generatePdf } from '@/lib/generatePdf';
import { Download } from 'lucide-react';
import type {
  AssetStats,
  AssetStatusData,
  AssetValueData,
  AssetCategoryData,
  AssetDepartmentData,
  Column,
} from '@/types/reports';

export default function AssetReportsPage() {
  const [loading, setLoading] = useState(true);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [assetsByCategory, setAssetsByCategory] = useState<AssetCategoryData[]>([]);
  const [assetsByDepartment, setAssetsByDepartment] = useState<AssetDepartmentData[]>([]);
  const [depreciationData, setDepreciationData] = useState<AssetValueData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<AssetStatusData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [filterType, setFilterType] = useState<'category' | 'department'>('category');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAssetReports();
  }, []);

  const fetchAssetReports = async () => {
    try {
      const response = await fetch('/api/reports/assets');
      if (!response.ok) throw new Error('Failed to fetch asset reports');
      const data = await response.json();
      
      setAssetStats(data.stats);
      setAssetsByCategory(data.byCategory || []);
      setAssetsByDepartment(data.byDepartment || []);
      setDepreciationData(data.depreciation || []);
      setStatusDistribution(data.statusDistribution || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterOptions = () => {
    if (filterType === 'category') {
      return assetsByCategory.map(item => item.category);
    }
    return assetsByDepartment.map(item => item.category);
  };

  const getFilteredData = () => {
    let filteredData = filterType === 'category' ? assetsByCategory : assetsByDepartment;
    
    if (selectedFilter !== 'all') {
      filteredData = filteredData.filter(item => item.category === selectedFilter);
    }

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }

    return filteredData;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const detailedColumns = [
    {
      key: 'category',
      header: 'Category',
      accessorKey: 'category',
    },
    {
      key: 'count',
      header: 'Total Assets',
      accessorKey: 'count',
    },
    {
      key: 'value',
      header: 'Total Value',
      accessorKey: 'value',
      cell: ({ row }: { row: { original: AssetCategoryData } }) => 
        `$${row.original.value.toFixed(2)}`,
    },
    {
      key: 'avgValue',
      header: 'Average Value',
      accessorKey: 'value',
      cell: ({ row }: { row: { original: AssetCategoryData } }) => 
        `$${(row.original.value / row.original.count).toFixed(2)}`,
    },
    {
      key: 'valuePerAsset',
      header: 'Value per Asset',
      accessorKey: 'value',
      cell: ({ row }: { row: { original: AssetCategoryData } }) => 
        `$${(row.original.value / row.original.count).toFixed(2)}`,
    },
  ] as Column<AssetCategoryData>[];

  const departmentColumns = [
    {
      key: 'department',
      header: 'Department',
      accessorKey: 'department',
    },
    {
      key: 'count',
      header: 'Asset Count',
      accessorKey: 'count',
    },
    {
      key: 'value',
      header: 'Total Value',
      accessorKey: 'value',
      cell: ({ row }: { row: { original: AssetDepartmentData } }) => 
        `$${row.original.value.toFixed(2)}`,
    },
    {
      key: 'avgValue',
      header: 'Average Value',
      accessorKey: 'value',
      cell: ({ row }: { row: { original: AssetDepartmentData } }) => 
        `$${(row.original.value / row.original.count).toFixed(2)}`,
    },
  ] as Column<AssetDepartmentData>[];

  const exportColumns = detailedColumns.map(col => ({
    header: col.header,
    accessorKey: col.accessorKey as string,
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Asset Reports</h1>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'category' | 'department');
              setSelectedFilter('all');
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="category">Category</option>
            <option value="department">Department</option>
          </select>
        </div>
        
        <div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All {filterType}s</option>
            {getFilterOptions().map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="DISPOSED">Disposed</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setSelectedFilter('all');
              setStatusFilter('all');
            }}
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RoleBasedStats
          name="Total Assets"
          value={assetStats?.totalAssets || 0}
          trend={assetStats?.assetGrowth || 0}
          trendLabel="vs last month"
          variant="default"
        />
        <RoleBasedStats
          name="Total Value"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }).format(assetStats?.totalValue || 0)}
          trend={Number(((assetStats?.valueGrowth || 0) / (assetStats?.totalValue || 1) * 100).toFixed(1))}
          trendLabel="vs last month"
          variant="success"
        />
        <RoleBasedStats
          name="Asset Utilization"
          value={assetStats?.activeAssets || 0}
          description={`${((assetStats?.activeAssets || 0) / (assetStats?.totalAssets || 1) * 100).toFixed(1)}% Active`}
          variant="default"
        />
        <RoleBasedStats
          name="Maintenance Cost"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }).format(assetStats?.maintenanceCost || 0)}
          variant="warning"
        />
      </div>

      {/* Asset Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Assets by Category/Department */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedFilter === 'all' 
                ? `Assets by ${filterType === 'category' ? 'Category' : 'Department'}`
                : `Assets in ${selectedFilter}`}
              {statusFilter !== 'all' && ` (${statusFilter})`}
            </h2>
            {getFilteredData().length > 0 && (
              <button
                onClick={() => generatePdf({
                  title: `Assets by ${filterType === 'category' ? 'Category' : 'Department'} Report`,
                  data: getFilteredData(),
                  type: filterType
                })}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <Download size={16} />
                Download PDF
              </button>
            )}
          </div>
          {getFilteredData().length > 0 ? (
            <RoleBasedChart
              type={selectedFilter === 'all' ? 'pie' : 'bar'}
              data={getFilteredData()}
              options={{
                labels: getFilteredData().map((item) => item.category),
                values: getFilteredData().map((item) => item.count),
              }}
            />
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Asset Status Distribution</h2>
          {statusDistribution.length > 0 ? (
            <RoleBasedChart
              type="pie"
              data={statusDistribution}
              options={{
                labels: statusDistribution.map((item) => item.status),
                values: statusDistribution.map((item) => item.count),
              }}
            />
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Depreciation Trend */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Asset Value & Depreciation Trend</h2>
        {depreciationData.length > 0 ? (
          <RoleBasedChart
            type="line"
            data={depreciationData}
            options={{
              xAxis: depreciationData.map((item) => item.month),
              series: [
                {
                  name: 'Book Value',
                  data: depreciationData.map((item) => item.value),
                },
                {
                  name: 'Depreciation',
                  data: depreciationData.map((item) => item.depreciation),
                },
              ],
            }}
          />
        ) : (
          <div className="text-center text-gray-500">No data available</div>
        )}
      </div>

      {/* Asset Value Table */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Asset Value Details by Category</h2>
            <ExportButton
              data={assetsByCategory}
              columns={exportColumns}
              fileName="Asset_Category_Details"
            />
          </div>
          <RoleBasedTable
            data={assetsByCategory}
            columns={detailedColumns}
          />
        </div>
      </div>

      {/* Department Asset Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedFilter === 'all'
                ? `Asset Value Details by ${filterType === 'category' ? 'Category' : 'Department'}`
                : `Asset Value Details for ${selectedFilter}`}
              {statusFilter !== 'all' && ` (${statusFilter})`}
            </h2>
            <button
              onClick={() => generatePdf({
                title: `Asset Value Details by ${filterType === 'category' ? 'Category' : 'Department'}`,
                data: getFilteredData(),
                type: filterType
              })}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
          {getFilteredData().length > 0 ? (
            <RoleBasedTable
              data={getFilteredData()}
              columns={[
                {
                  header: filterType === 'category' ? 'Category' : 'Department',
                  accessorKey: 'category',
                },
                {
                  header: 'Status',
                  accessorKey: 'status',
                },
                {
                  header: 'Total Assets',
                  accessorKey: 'count',
                },
                {
                  header: 'Total Value',
                  accessorKey: 'value',
                  cell: ({ row }: { row: { original: AssetCategoryData } }) => 
                    `$${row.original.value.toFixed(2)}`,
                },
                {
                  header: 'Average Value',
                  accessorKey: 'value',
                  cell: ({ row }: { row: { original: AssetCategoryData } }) => 
                    `$${(row.original.value / row.original.count).toFixed(2)}`,
                },
              ].map((col) => ({ ...col, key: col.accessorKey })) as Column<AssetCategoryData>[]}
            />
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
