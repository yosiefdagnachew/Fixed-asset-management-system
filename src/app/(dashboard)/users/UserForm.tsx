"use client";
import React, { useState } from "react";

interface UserFormProps {
  initialData?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  onSubmit: (data: { name: string; email: string; role: string; password?: string | undefined }) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function UserForm({ initialData = {}, onSubmit, onCancel, isEdit }: UserFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [role, setRole] = useState(initialData.role || "USER");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ name, email, role, ...(isEdit ? {} : { password }) });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1">Name</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input
          className="border px-2 py-1 rounded w-full"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isEdit}
        />
      </div>
      <div>
        <label className="block mb-1">Role</label>
        <select className="border px-2 py-1 rounded w-full" value={role} onChange={e => setRole(e.target.value)}>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="USER">User</option>
        </select>
      </div>
      {!isEdit && (
        <div>
          <label className="block mb-1">Password</label>
          <input
            className="border px-2 py-1 rounded w-full"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEdit ? "Update" : "Create"} User
        </button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
