// Common Types
export type ChartType = 'bar' | 'line' | 'pie' | 'heatmap';

// Asset Reports
export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  activeAssets: number;
  maintenanceDue: number;
  assetGrowth: number;
  valueGrowth: number;
}

export interface AssetCategoryData {
  category: string;
  count: number;
  value: number;
  status?: string;
}

export interface AssetStatusData {
  status: string;
  count: number;
}

export interface AssetValueData {
  month: string;
  value: number;
  depreciation: number;
}

export interface AssetDepartmentData {
  department: string;
  count: number;
  value: number;
}

export interface DepreciationData {
  month: string;
  bookValue: number;
  depreciation: number;
}

// Maintenance Reports
export interface MaintenanceStats {
  totalRequests: number;
  pendingRequests: number;
  avgResolutionDays: number;
  completionRate: number;
  requestGrowth: number;
}

export interface MaintenanceStatusData {
  status: string;
  count: number;
}

export interface MaintenanceTrendData {
  month: string;
  count: number;
  completed: number;
}

export interface MaintenanceAssetData {
  name: string;
  totalRequests: number;
  lastMaintenance: string | null;
  averageCost: number | null;
  status: 'Due' | 'OK';
}

// Transfer Reports
export interface TransferStats {
  totalTransfers: number;
  pendingTransfers: number;
  avgProcessingDays: number;
  approvalRate: number;
  transferGrowth: number;
}

export interface LocationTransferData {
  fromLocation: string;
  toLocation: string;
  count: number;
}

export interface TransferTrendData {
  month: string;
  count: number;
  approved: number;
}

export interface DepartmentTransferData {
  department: string;
  outgoing: number;
  incoming: number;
  avgProcessingDays: number;
}

// Disposal Reports
export interface DisposalStats {
  totalDisposals: number;
  totalRecovered: number;
  recoveryRate: number;
  pendingDisposals: number;
  disposalGrowth: number;
  recoveryGrowth: number;
  pendingGrowth: number;
}

export interface DisposalMethodData {
  method: string;
  count: number;
}

export interface DisposalTrendData {
  month: string;
  count: number;
}

export interface ValueRecoveryData {
  month: string;
  expected: number;
  actual: number;
  rate?: number;
}

// Component Props Types
export interface RoleBasedBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'default';
}

export interface RoleBasedStatsProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  description?: string;
  variant?: 'success' | 'warning' | 'danger' | 'default';
}

export interface RoleBasedChartProps {
  type: ChartType;
  data: any[];
  options: {
    labels?: string[];
    values?: number[];
    xAxis?: string[];
    yAxis?: number[];
    series?: Array<{
      name: string;
      data: number[];
    }>;
  };
}

export interface RoleBasedCardProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface Column<T> {
  key: keyof T;
  header: string;
  accessorKey?: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  permission?: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  className?: string;
}
