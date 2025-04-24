'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedTable } from '@/components/ui/RoleBasedTable';
import { RoleBasedButton } from '@/components/ui/RoleBasedButton';
import { RoleBasedBadge } from '@/components/ui/RoleBasedBadge';
import type { TransferRequest, TransferStatus } from '@/types/transfers';
import type { Column } from '@/types/reports';

export default function TransfersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/transfers');
      if (!response.ok) throw new Error('Failed to fetch transfers');
      const data = await response.json();
      setTransfers(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: TransferStatus): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns: Column<TransferRequest>[] = [
    {
      key: 'assetId',
      header: 'Asset',
      render: (value, item) => (item.asset?.name || value) as string,
    },
    {
      key: 'requesterId',
      header: 'Requester',
      render: (value, item) => (item.requester?.name || 'Unknown') as string,
    },
    {
      key: 'fromDepartment',
      header: 'From',
    },
    {
      key: 'toDepartment',
      header: 'To',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, item) => (
        <RoleBasedBadge
          label={value as string}
          variant={getStatusVariant(value as TransferStatus)}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (value) => new Date(value as Date).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value) => (
        <div className="flex space-x-2">
          <RoleBasedButton
            onClick={() => router.push(`/transfers/${value}`)}
            variant="secondary"
            size="sm"
          >
            View
          </RoleBasedButton>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Asset Transfers</h1>
        <RoleBasedButton
          onClick={() => router.push('/transfers/new')}
          variant="primary"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          New Transfer
        </RoleBasedButton>
      </div>

      <RoleBasedTable
        data={transfers}
        columns={columns}
        loading={loading}
        onRowClick={(row) => router.push(`/transfers/${row.id}`)}
      />
    </div>
  );
}