import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../components/common/Modal";
import userService from "../services/userService";

import { isValidEmail, required } from "../utils/validation";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "SALES_EMPLOYEE",
};

const validRoles = ["ADMIN", "SALES_EMPLOYEE"];

export default function Employees() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Load employees error:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Failed to load employees."
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
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "SALES_EMPLOYEE",
    });

    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    // Name
    if (!required(form.name)) {
      nextErrors.name = "Employee name is required.";
    } else if (form.name.trim().length < 2) {
      nextErrors.name =
        "Employee name must be at least 2 characters.";
    }

    // Email
    if (!required(form.email)) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    // Password only required when creating
    if (!editingUser) {
      if (!required(form.password)) {
        nextErrors.password = "Password is required.";
      } else if (form.password.length < 8) {
        nextErrors.password =
          "Password must be at least 8 characters.";
      }
    }

    // Role
    if (!validRoles.includes(form.role)) {
      nextErrors.role = "Please select a valid employee role.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });

        toast.success("Employee updated successfully.");
      } else {
        await userService.createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });

        toast.success("Employee created successfully.");
      }

      setModalOpen(false);
      setEditingUser(null);
      setForm(initialForm);
      setErrors({});

      await loadUsers();
    } catch (error) {
      console.error("Save employee error:", error);

      if (error?.response?.status === 409) {
        const detail =
          error?.response?.data?.detail ||
          "A user with this email already exists.";

        setErrors((previous) => ({
          ...previous,
          email: detail,
        }));

        return;
      }

      toast.error(
        error?.response?.data?.detail ||
          "Unable to save employee."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value)
      );
    });
  }, [users, search]);

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
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
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
                    className="px-6 py-12 text-center"
                  >
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary-600" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      Loading employees...
                    </p>
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
                      Try changing your search or add a new
                      employee.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
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
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          user.role === "ADMIN"
                            ? "bg-violet-50 text-violet-700 ring-violet-600/10"
                            : "bg-blue-50 text-blue-700 ring-blue-600/10"
                        }`}
                      >
                        {user.role === "ADMIN"
                          ? "Admin"
                          : "Sales Employee"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit employee"
                        >
                          <Pencil size={17} />
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
        onClose={closeModal}
        title={editingUser ? "Edit Employee" : "Add Employee"}
        description={
          editingUser
            ? "Update employee information and role."
            : "Create a new CRM team member."
        }
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          {/* Name */}
          <FormField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            error={errors.name}
            required
          />

          {/* Email */}
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="employee@example.com"
            error={errors.email}
            required
          />

          {/* Password */}
          {!editingUser && (
            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              error={errors.password}
              required
            />
          )}

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              aria-invalid={Boolean(errors.role)}
              className={`input ${
                errors.role
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : ""
              }`}
            >
              <option value="SALES_EMPLOYEE">
                Sales Employee
              </option>

              <option value="ADMIN">Admin</option>
            </select>

            {errors.role && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.role}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {saving
                ? editingUser
                  ? "Saving..."
                  : "Creating..."
                : editingUser
                  ? "Save Changes"
                  : "Create Employee"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required: isRequired = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {isRequired && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`input ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : ""
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}