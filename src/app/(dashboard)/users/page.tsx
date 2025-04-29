"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import UserForm from "./UserForm";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  useEffect(() => {
    // Only allow admins
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      toast.error("Access denied: Admins only");
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: { name: string; email: string; role: string; password?: string }) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, password: data.password ?? "" }),
      });
      if (!res.ok) throw new Error("Failed to create user");
      toast.success("User created");
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  const handleEdit = async (data: { name: string; email: string; role: string }) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editUser?.id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success("User updated");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}?`)) return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast.success("User deleted");
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => {
          setShowForm(true);
          setEditUser(null);
        }}
      >
        + Add User
      </button>
      {showForm && (
        <div className="mb-6">
          <UserForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isEdit={false}
          />
        </div>
      )}
      {editUser && (
        <div className="mb-6">
          <UserForm
            initialData={editUser}
            onSubmit={handleEdit}
            onCancel={() => setEditUser(null)}
            isEdit={true}
          />
        </div>
      )}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => setEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(user)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
