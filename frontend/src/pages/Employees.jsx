import { useEffect, useState } from "react";
import {
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import userService from "../services/userService";


export default function Employees() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "SALES_EMPLOYEE",
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Failed to load employees"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const openCreateModal = () => {
        setEditingUser(null);

        setForm({
            name: "",
            email: "",
            password: "",
            role: "SALES_EMPLOYEE",
        });

        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);

        setForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
        });

        setModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                });

                toast.success("Employee updated successfully");
            } else {
                if (!form.password) {
                    toast.error("Password is required");
                    return;
                }

                await userService.createUser({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                });

                toast.success("Employee created successfully");
            }

            setModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Something went wrong"
            );
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.name}?`
        );

        if (!confirmed) return;

        try {
            await userService.deleteUser(user.id);

            toast.success("Employee deleted successfully");
            loadUsers();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Unable to delete employee"
            );
        }
    };

    const filteredUsers = users.filter((user) => {
        const value = search.toLowerCase();

        return (
            user.name.toLowerCase().includes(value) ||
            user.email.toLowerCase().includes(value) ||
            user.role.toLowerCase().includes(value)
        );
    });

    const totalEmployees = users.length;

    const salesEmployees = users.filter(
        (user) => user.role === "SALES_EMPLOYEE"
    ).length;

    const admins = users.filter(
        (user) => user.role === "ADMIN"
    ).length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary-600">
                        <Users size={16} />
                        Team Management
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Employees
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage admins and sales employees in your CRM.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={loadUsers}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                    >
                        <Plus size={17} />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Total Employees
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {totalEmployees}
                    </p>
                </div>

                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Sales Employees
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {salesEmployees}
                    </p>
                </div>

                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Administrators
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {admins}
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="card overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Team Members
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {filteredUsers.length} employee
                            {filteredUsers.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search employees..."
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Employee
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-12 text-center text-sm text-slate-500"
                                    >
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-12 text-center"
                                    >
                                        <Users
                                            size={32}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 text-sm font-medium text-slate-700">
                                            No employees found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Try changing your search or add a new employee.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary-700">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {user.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        ID #{user.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${user.role === "ADMIN"
                                                        ? "bg-violet-50 text-violet-700 ring-violet-600/10"
                                                        : "bg-blue-50 text-blue-700 ring-blue-600/10"
                                                    }`}
                                            >
                                                {user.role === "ADMIN" ? "Admin" : "Sales Employee"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    title="Edit employee"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    title="Delete employee"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Employee Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingUser ? "Edit Employee" : "Add Employee"}
            >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Full Name
                        </label>

                        <input
                            className="input"
                            value={form.name}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    name: event.target.value,
                                })
                            }
                            placeholder="Enter employee name"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email
                        </label>

                        <input
                            type="email"
                            className="input"
                            value={form.email}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    email: event.target.value,
                                })
                            }
                            placeholder="employee@example.com"
                            required
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>

                            <input
                                type="password"
                                className="input"
                                value={form.password}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        password: event.target.value,
                                    })
                                }
                                placeholder="Create password"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Role
                        </label>

                        <select
                            className="input"
                            value={form.role}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    role: event.target.value,
                                })
                            }
                        >
                            <option value="SALES_EMPLOYEE">
                                Sales Employee
                            </option>

                            <option value="ADMIN">
                                Admin
                            </option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                        >
                            {editingUser ? "Save Changes" : "Create Employee"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}