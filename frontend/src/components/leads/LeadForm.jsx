import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import Modal from "../common/Modal";

import leadService from "../../services/leadService";

import userService from "../../services/userService";

import { useAuth } from "../../context/AuthContext";

const stages = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "SITE_VISIT", label: "Site Visit" },
  { value: "INTERESTED", label: "Interested" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "BOOKED", label: "Booked" },
  { value: "LOST", label: "Lost" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  stage: "NEW",
  assigned_to: "",
  follow_up_date: "",
};

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 15;
}

export default function LeadForm({
  open,
  onClose,
  lead,
  onSaved,
}) {
  const { user } = useAuth();

  const [form, setForm] =
    useState(initialForm);

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [employeeLoading, setEmployeeLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const isEditing = Boolean(lead);
  const isAdmin = user?.role === "ADMIN";

  // =====================================================
  // LOAD LEAD DATA
  // =====================================================

  useEffect(() => {
    if (!open) return;

    if (lead) {
      setForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        stage: lead.stage || "NEW",
        assigned_to: lead.assigned_to
          ? String(lead.assigned_to)
          : "",
        follow_up_date:
          lead.follow_up_date || "",
      });
    } else {
      setForm({
        ...initialForm,
      });
    }

    setErrors({});
  }, [open, lead]);

  // =====================================================
  // LOAD SALES EMPLOYEES
  // =====================================================

  useEffect(() => {
    if (!open || !isAdmin) return;

    const loadEmployees = async () => {
      try {
        setEmployeeLoading(true);

        const result =
          await userService.getSalesEmployees();

        setEmployees(result);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.detail ||
            "Unable to load sales employees."
        );
      } finally {
        setEmployeeLoading(false);
      }
    };

    loadEmployees();
  }, [open, isAdmin]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

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

  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    const nextErrors = {};

    // -----------------------------------------------
    // NAME
    // -----------------------------------------------

    const name = form.name.trim();

    if (!name) {
      nextErrors.name =
        "Lead name is required.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Lead name must be at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name =
        "Lead name cannot exceed 100 characters.";
    }

    // -----------------------------------------------
    // PHONE
    // -----------------------------------------------

    const phone = form.phone.trim();

    if (!phone) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (!isValidPhone(phone)) {
      nextErrors.phone =
        "Enter a valid phone number with 10–15 digits.";
    }

    // -----------------------------------------------
    // EMAIL
    // -----------------------------------------------

    const email = form.email.trim();

    if (email && !isValidEmail(email)) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    // -----------------------------------------------
    // STAGE
    // -----------------------------------------------

    const validStage = stages.some(
      (stage) => stage.value === form.stage
    );

    if (!validStage) {
      nextErrors.stage =
        "Please select a valid lead stage.";
    }

    // -----------------------------------------------
    // FOLLOW-UP DATE
    // -----------------------------------------------

    if (form.follow_up_date) {
      const today = getToday();

      if (
        form.follow_up_date < today
      ) {
        nextErrors.follow_up_date =
          "Follow-up date cannot be in the past.";
      }
    }

    // -----------------------------------------------
    // ASSIGNMENT
    // -----------------------------------------------

    if (
      isAdmin &&
      form.assigned_to &&
      !employees.some(
        (employee) =>
          String(employee.id) ===
          String(form.assigned_to)
      )
    ) {
      nextErrors.assigned_to =
        "Please select a valid sales employee.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!validate()) {
      toast.error(
        "Please correct the highlighted fields."
      );

      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),

        email:
          form.email.trim() || null,

        phone: form.phone.trim(),

        stage: form.stage,

        follow_up_date:
          form.follow_up_date || null,
      };

      // ADMIN CAN ASSIGN EMPLOYEE
      if (isAdmin) {
        payload.assigned_to =
          form.assigned_to
            ? Number(form.assigned_to)
            : null;
      }

      let result;

      // =================================================
      // UPDATE EXISTING LEAD
      // =================================================

      if (isEditing) {
        result =
          await leadService.updateLead(
            lead.id,
            payload
          );

        toast.success(
          "Lead updated successfully."
        );
      }

      // =================================================
      // CREATE NEW LEAD
      // =================================================

      else {
        result =
          await leadService.createLead(
            payload
          );

        toast.success(
          "Lead created successfully."
        );
      }

      // SEND RESULT BACK TO LEADS PAGE
      if (onSaved) {
        onSaved(result);
      }

      onClose();
    } catch (error) {
      console.error(
        "Save lead error:",
        error
      );

      // Validation error from FastAPI
      if (
        error.response?.status === 422
      ) {
        toast.error(
          "Please check the entered information."
        );
      } else {
        toast.error(
          error.response?.data?.detail ||
            "Unable to save lead."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      title={
        isEditing
          ? "Edit Lead"
          : "Create New Lead"
      }
      description={
        isEditing
          ? "Update lead information and sales activity."
          : "Add a new prospect to your sales pipeline."
      }
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">

          {/* NAME */}
          <FormField
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Arjun Kumar"
            error={errors.name}
            required
          />

          {/* PHONE */}
          <FormField
            label="Phone number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            error={errors.phone}
            required
          />

          {/* EMAIL */}
          <FormField
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="customer@example.com"
            error={errors.email}
          />

          {/* STAGE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Lead stage
            </label>

            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className={`input ${
                errors.stage
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : ""
              }`}
            >
              {stages.map((stage) => (
                <option
                  key={stage.value}
                  value={stage.value}
                >
                  {stage.label}
                </option>
              ))}
            </select>

            {errors.stage && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.stage}
              </p>
            )}
          </div>

          {/* FOLLOW-UP */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Follow-up date
            </label>

            <input
              type="date"
              name="follow_up_date"
              value={form.follow_up_date}
              min={getToday()}
              onChange={handleChange}
              className={`input ${
                errors.follow_up_date
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : ""
              }`}
            />

            {errors.follow_up_date && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.follow_up_date}
              </p>
            )}
          </div>

          {/* ASSIGN EMPLOYEE */}
          {isAdmin && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assign to
              </label>

              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                disabled={employeeLoading}
                className={`input disabled:bg-slate-50 ${
                  errors.assigned_to
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : ""
                }`}
              >
                <option value="">
                  Unassigned
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name} —{" "}
                      {employee.email}
                    </option>
                  )
                )}
              </select>

              {employeeLoading && (
                <p className="mt-1 text-xs text-slate-400">
                  Loading employees...
                </p>
              )}

              {errors.assigned_to && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.assigned_to}
                </p>
              )}
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}

            {loading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Lead"
                : "Create Lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// =====================================================
// FORM FIELD
// =====================================================

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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