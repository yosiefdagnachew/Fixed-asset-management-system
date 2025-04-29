"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
=======
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
>>>>>>> 56d1f01 (user management)

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
<<<<<<< HEAD
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error fetching users:", err);
=======
    } catch (err) {
      toast.error("Failed to load users");
>>>>>>> 56d1f01 (user management)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
=======
  const handleCreate = async (data: { name: string; email: string; role: string; password?: string }) => {
>>>>>>> 56d1f01 (user management)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create user");
      setForm({ name: "", email: "", password: "", role: "USER" });
      setShowModal(false);
      fetchUsers();
      toast.success("User added successfully!");
    } catch (err) {
      toast.error("Error creating user");
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      const res = await fetch(`/api/users/${deleteUserId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers(); // Refresh the user list
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error("Error deleting user");
      console.error(err);
    } finally {
      setDeleteUserId(null); // Close confirmation modal
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Add New User
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Role</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{user.name || "-"}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2 capitalize">{user.role}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => setDeleteUserId(user.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this user?</p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer />
=======
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
>>>>>>> 56d1f01 (user management)
    </div>
  );
}
