'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'react-hot-toast';

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { canManageAssets } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    status: 'ACTIVE',
    location: '',
    department: '',
    category: '',
    supplier: '',
    warrantyExpiry: '',
    lastMaintenance: '',
    nextMaintenance: '',
  });

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await fetch(`/api/assets/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch asset');
        }
        const asset = await response.json();
        
        // Format dates for input fields
        setFormData({
          ...asset,
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
          warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
          lastMaintenance: asset.lastMaintenance ? new Date(asset.lastMaintenance).toISOString().split('T')[0] : '',
          nextMaintenance: asset.nextMaintenance ? new Date(asset.nextMaintenance).toISOString().split('T')[0] : '',
        });
      } catch (error) {
        toast.error('Failed to fetch asset details');
        console.error('Error fetching asset:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/assets/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice),
          currentValue: parseFloat(formData.currentValue),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      toast.success('Asset updated successfully');
      router.push('/assets');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update asset');
      console.error('Error updating asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!canManageAssets()) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to edit assets.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Asset</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update asset information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              id="serialNumber"
              required
              value={formData.serialNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              id="purchaseDate"
              required
              value={formData.purchaseDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
              Purchase Price
            </label>
            <input
              type="number"
              name="purchasePrice"
              id="purchasePrice"
              required
              step="0.01"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700">
              Current Value
            </label>
            <input
              type="number"
              name="currentValue"
              id="currentValue"
              required
              step="0.01"
              value={formData.currentValue}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              id="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="DISPOSED">Disposed</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              name="department"
              id="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              id="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="warrantyExpiry" className="block text-sm font-medium text-gray-700">
              Warranty Expiry Date
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              id="warrantyExpiry"
              value={formData.warrantyExpiry}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700">
              Last Maintenance Date
            </label>
            <input
              type="date"
              name="lastMaintenance"
              id="lastMaintenance"
              value={formData.lastMaintenance}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="nextMaintenance" className="block text-sm font-medium text-gray-700">
              Next Maintenance Date
            </label>
            <input
              type="date"
              name="nextMaintenance"
              id="nextMaintenance"
              value={formData.nextMaintenance}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 