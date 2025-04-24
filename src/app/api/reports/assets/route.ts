import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

type AssetWithStatus = {
  currentValue: number | null;
  status: string;
};

type AssetWithValue = {
  currentValue: number | null;
};

type DepreciationData = {
  date: Date;
  amount: number;
  depreciationRate: number;
};

type GroupedAsset = {
  category?: string | null;
  department?: string | null;
  _count: {
    id: number;
  };
  _sum: {
    currentValue: number | null;
  };
};

// GET /api/reports/assets
export async function GET() {
  try {
    // Get current date and last month's date
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Fetch all required data in parallel
    const [
      currentAssets,
      lastMonthAssets,
      assetsByCategory,
      assetsByDepartment,
      maintenanceDue,
      depreciationData,
      statusDistribution,
    ] = await Promise.all([
      // Current month's assets
      prisma.asset.findMany({
        where: {
          createdAt: {
            lte: now,
          },
        },
        select: {
          currentValue: true,
          status: true,
        },
      }) as Promise<AssetWithStatus[]>,

      // Last month's assets
      prisma.asset.findMany({
        where: {
          createdAt: {
            lte: lastMonth,
          },
        },
        select: {
          currentValue: true,
        },
      }) as Promise<AssetWithValue[]>,

      // Assets grouped by category
      prisma.asset.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        _sum: {
          currentValue: true,
        },
      }) as Promise<GroupedAsset[]>,

      // Assets grouped by department
      prisma.asset.groupBy({
        by: ['department'],
        _count: {
          id: true,
        },
        _sum: {
          currentValue: true,
        },
      }) as Promise<GroupedAsset[]>,

      // Assets due for maintenance
      prisma.asset.count({
        where: {
          nextMaintenance: {
            lte: now,
          },
          status: 'ACTIVE',
        },
      }),

      // Depreciation data for the last 12 months
      (prisma as any).depreciation.findMany({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
        },
        select: {
          date: true,
          amount: true,
          depreciationRate: true,
        },
        orderBy: {
          date: 'asc',
        },
      }) as Promise<DepreciationData[]>,

      // Status distribution
      prisma.asset.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
    ]);

    // Calculate total values and growth
    const currentTotalValue = currentAssets.reduce((sum: number, asset: AssetWithStatus) => sum + (asset.currentValue || 0), 0);
    const lastMonthTotalValue = lastMonthAssets.reduce((sum: number, asset: AssetWithValue) => sum + (asset.currentValue || 0), 0);
    const valueGrowth = lastMonthTotalValue > 0 ? ((currentTotalValue - lastMonthTotalValue) / lastMonthTotalValue) * 100 : 0;
    const assetGrowth = lastMonthAssets.length > 0 ? ((currentAssets.length - lastMonthAssets.length) / lastMonthAssets.length) * 100 : 0;

    // Process category data
    const categoryData = assetsByCategory.map((category: GroupedAsset) => ({
      category: category.category || 'Uncategorized',
      count: category._count.id,
      value: category._sum.currentValue || 0,
    }));

    // Process department data
    const departmentData = assetsByDepartment.map((dept: GroupedAsset) => ({
      department: dept.department || 'Unassigned',
      count: dept._count.id,
      value: dept._sum.currentValue || 0,
    }));

    // Process status distribution
    const statusData = statusDistribution.map((status: any) => ({
      status: status.status || 'Unknown',
      count: status._count.id,
    }));

    // Process depreciation data by month
    const depreciationByMonth = new Map<string, { depreciation: number; rate: number }>();
    depreciationData.forEach((dep: DepreciationData) => {
      const monthKey = dep.date.toISOString().slice(0, 7); // YYYY-MM format
      const existing = depreciationByMonth.get(monthKey) || { depreciation: 0, rate: 0 };
      depreciationByMonth.set(monthKey, {
        depreciation: existing.depreciation + dep.amount,
        rate: dep.depreciationRate, // Use the latest rate for the month
      });
    });

    const depreciationTrend = Array.from(depreciationByMonth.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));

    return NextResponse.json({
      stats: {
        totalAssets: currentAssets.length,
        totalValue: Math.round(currentTotalValue * 100) / 100,
        activeAssets: currentAssets.filter((a: AssetWithStatus) => a.status === 'ACTIVE').length,
        maintenanceDue,
        assetGrowth: Math.round(assetGrowth * 10) / 10,
        valueGrowth: Math.round(valueGrowth * 10) / 10,
      },
      byCategory: categoryData,
      byDepartment: departmentData,
      depreciation: depreciationTrend,
      statusDistribution: statusData,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate asset reports' },
      { status: 500 }
    );
  }
}
