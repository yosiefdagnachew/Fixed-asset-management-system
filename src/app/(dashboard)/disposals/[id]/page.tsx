'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedBadge } from '@/components/ui/RoleBasedBadge';
import { RoleBasedButton } from '@/components/ui/RoleBasedButton';
import { toast } from 'react-hot-toast';

interface DisposalRequest {
  id: string;
  assetId: string;
  reason: string;
  method: string;
  proceeds: number | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  asset?: {
    name: string;
    serialNumber: string;
    purchasePrice: number;
  };
}

export default function DisposalDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [disposal, setDisposal] = useState<DisposalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDisposalDetails();
  }, [params.id]);

  const fetchDisposalDetails = async () => {
    try {
      const response = await fetch(`/api/disposals/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch disposal details');
      const data = await response.json();
      setDisposal(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load disposal details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/disposals/${params.id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to approve disposal');

      toast.success('Disposal approved successfully');
      fetchDisposalDetails();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to approve disposal');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/disposals/${params.id}/reject`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reject disposal');

      toast.success('Disposal rejected successfully');
      fetchDisposalDetails();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject disposal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!disposal) {
    return <div>Disposal request not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Disposal Request Details</h1>
          <RoleBasedBadge status={disposal.status} label={disposal.status} />
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">Asset Information</h2>
            <p className="text-gray-600">
              {disposal.asset?.name} ({disposal.asset?.serialNumber})
            </p>
            <p className="text-gray-600">
              Purchase Price: ${disposal.asset?.purchasePrice.toFixed(2)}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Disposal Method</h3>
            <p className="text-gray-600">{disposal.method.replace('_', ' ')}</p>
          </div>

          <div>
            <h3 className="font-medium">Reason for Disposal</h3>
            <p className="text-gray-600">{disposal.reason}</p>
          </div>

          {disposal.proceeds !== null && (
            <div>
              <h3 className="font-medium">Expected Proceeds</h3>
              <p className="text-gray-600">${disposal.proceeds.toFixed(2)}</p>
            </div>
          )}

          <div>
            <h3 className="font-medium">Request Date</h3>
            <p className="text-gray-600">
              {new Date(disposal.createdAt).toLocaleDateString()}
            </p>
          </div>

          {disposal.approvedAt && (
            <div>
              <h3 className="font-medium">Approval Date</h3>
              <p className="text-gray-600">
                {new Date(disposal.approvedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <RoleBasedButton
              variant="secondary"
              onClick={() => router.push('/disposals')}
            >
              Back to List
            </RoleBasedButton>
            
            {disposal.status === 'PENDING' && (
              <>
                <RoleBasedButton
                  variant="danger"
                  onClick={handleReject}
                  loading={loading}
                >
                  Reject
                </RoleBasedButton>
                <RoleBasedButton
                  variant="success"
                  onClick={handleApprove}
                  loading={loading}
                >
                  Approve
                </RoleBasedButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
