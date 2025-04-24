'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedBadge } from '@/components/ui/RoleBasedBadge';
import { RoleBasedButton } from '@/components/ui/RoleBasedButton';
import { toast } from 'react-hot-toast';

interface MaintenanceRequest {
  id: string;
  assetId: string;
  description: string;
  status: string;
  requestedById: string;
  createdAt: string;
  asset?: {
    name: string;
    serialNumber: string;
  };
  requestedBy?: {
    name: string;
    email: string;
  };
}

export default function MaintenanceRequestDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`/api/maintenance/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch maintenance request details');
      const data = await response.json();
      setRequest(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load maintenance request details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/maintenance/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      fetchRequestDetails();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!request) {
    return <div>Maintenance request not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Maintenance Request Details</h1>
          <RoleBasedBadge 
            label={request.status} 
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">Asset Information</h2>
            <p className="text-gray-600">
              {request.asset?.name} ({request.asset?.serialNumber})
            </p>
          </div>

          <div>
            <h3 className="font-medium">Description</h3>
            <p className="text-gray-600">{request.description}</p>
          </div>

          <div>
            <h3 className="font-medium">Requested By</h3>
            <p className="text-gray-600">
              {request.requestedBy?.name} ({request.requestedBy?.email})
            </p>
          </div>

          <div>
            <h3 className="font-medium">Request Date</h3>
            <p className="text-gray-600">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <RoleBasedButton
              variant="secondary"
              onClick={() => router.push('/maintenance')}
            >
              Back to List
            </RoleBasedButton>
            
            {request.status === 'PENDING' && (
              <RoleBasedButton
                variant="primary"
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                loading={loading}
              >
                Start Maintenance
              </RoleBasedButton>
            )}
            
            {request.status === 'IN_PROGRESS' && (
              <RoleBasedButton
                variant="success"
                onClick={() => handleUpdateStatus('COMPLETED')}
                loading={loading}
              >
                Complete Maintenance
              </RoleBasedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
