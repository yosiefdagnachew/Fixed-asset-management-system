'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import DisposalForm from './DisposalForm';
import { RoleBasedBadge } from '@/components/ui/RoleBasedBadge';
import { RoleBasedButton } from '@/components/ui/RoleBasedButton';
import { RoleBasedTable } from '@/components/ui/RoleBasedTable';
import type { DisposalRequest, DisposalStatus } from '@/types/disposals';
import type { Column } from '@/types/reports';

export default function DisposalsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [disposals, setDisposals] = useState<DisposalRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editDisposal, setEditDisposal] = useState<DisposalRequest | null>(null);
  const [assets, setAssets] = useState<{ id: keyof DisposalRequest; name: string }[]>([]);

  useEffect(() => {
    fetchDisposals();
    fetchAssets();
  }, []);

  const fetchDisposals = async () => {
    try {
      const response = await fetch('/api/disposals');
      if (!response.ok) throw new Error('Failed to fetch disposals');
      const data = await response.json();
      setDisposals(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      setAssets(data.map((a: any) => ({ id: a.id, name: a.name })));
    } catch (error) {
      toast.error('Failed to load assets');
    }
  };

  const handleCreate = async (data: { assetId: keyof DisposalRequest; reason: keyof DisposalRequest; method: keyof DisposalRequest; proceeds?: number | string }) => {
    try {
      const response = await fetch('/api/disposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log('Create Disposal response:', response.status, result);
      if (!response.ok) {
        toast.error(result.error || 'Failed to create disposal');
        return;
      }
      toast.success('Disposal created');
      setShowForm(false);
      fetchDisposals();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create disposal');
    }
  };

  const handleEdit = async (data: { assetId: keyof DisposalRequest; reason: keyof DisposalRequest; method: keyof DisposalRequest; proceeds?: number | string }) => {
    if (!editDisposal) return;
    try {
      const response = await fetch(`/api/disposals/${editDisposal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update disposal');
      toast.success('Disposal updated');
      setEditDisposal(null);
      fetchDisposals();
    } catch (error) {
      toast.error('Failed to update disposal');
    }
  };

  const handleDelete = async (disposal: DisposalRequest) => {
    if (!window.confirm('Are you sure you want to delete this disposal request?')) return;
    try {
      const response = await fetch(`/api/disposals/${disposal.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete disposal');
      toast.success('Disposal deleted');
      fetchDisposals();
    } catch (error) {
      toast.error('Failed to delete disposal');
    }
  };

  const getStatusVariant = (status: DisposalStatus): 'success' | 'warning' | 'danger' | 'default' => {
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

  const columns: Column<DisposalRequest>[] = [
  {
    key: 'assetId',
    header: 'Asset',
    render: (value: any, item: DisposalRequest) => typeof item.asset?.name === 'string' ? item.asset.name : String(value),
  },
  {
    key: 'method',
    header: 'Method',
    render: (value: any) => <span className="capitalize">{(value as string).toLowerCase()}</span>,
  },
  {
    key: 'expectedValue',
    header: 'Expected Value',
    render: (value: any) => typeof value === 'number' ? `$${value.toFixed(2)}` : '-',
  },
  {
    key: 'actualValue',
    header: 'Actual Value',
    render: (value: any) => typeof value === 'number' ? `$${value.toFixed(2)}` : '-',
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: any) => <RoleBasedBadge variant={getStatusVariant(value)} label={String(value)} />,
  },
];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Asset Disposals</h1>
        <RoleBasedButton
          onClick={() => router.push('/disposals/new')}
          variant="primary"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          New Disposal Request
        </RoleBasedButton>
      </div>

      <RoleBasedTable
        data={disposals}
        columns={columns}
        loading={loading}
        onRowClick={(value: DisposalRequest) => router.push(`/disposals/${value.id}`)}
      />
    </div>
  );
}