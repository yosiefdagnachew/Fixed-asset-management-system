"use client";
import React, { useState } from "react";

interface DisposalFormProps {
  assets: { id: string; name: string }[];
  initialData?: {
    id?: string;
    assetId?: string;
    reason?: string;
    method?: string;
    proceeds?: number | string;
  };
  onSubmit: (data: { assetId: string; reason: string; method: string; proceeds?: number | string }) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const DISPOSAL_METHODS = [
  "SALE",
  "DONATION",
  "RECYCLING",
  "SCRAPPING",
  "TRADE_IN",
];

export default function DisposalForm({ assets, initialData = {}, onSubmit, onCancel, isEdit }: DisposalFormProps) {
  const [assetId, setAssetId] = useState(initialData.assetId || (assets[0]?.id ?? ""));
  const [reason, setReason] = useState(initialData.reason || "");
  const [method, setMethod] = useState(initialData.method || DISPOSAL_METHODS[0]);
  const [proceeds, setProceeds] = useState(initialData.proceeds || "");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ assetId, reason, method, proceeds });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1">Asset</label>
        <select
          className="border px-2 py-1 rounded w-full"
          value={assetId}
          onChange={e => setAssetId(e.target.value)}
          required
          disabled={isEdit}
        >
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>{asset.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Reason</label>
        <textarea
          className="border px-2 py-1 rounded w-full"
          value={reason}
          onChange={e => setReason(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1">Method</label>
        <select className="border px-2 py-1 rounded w-full" value={method} onChange={e => setMethod(e.target.value)}>
          {DISPOSAL_METHODS.map(m => (
            <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Proceeds (optional)</label>
        <input
          className="border px-2 py-1 rounded w-full"
          type="number"
          value={proceeds}
          onChange={e => setProceeds(e.target.value)}
          min="0"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEdit ? "Update" : "Create"} Disposal
        </button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
