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


export default function LeadForm({
  open,
  onClose,
  lead,
  onSaved,
}) {

  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);

  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [errors, setErrors] = useState({});


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

      setForm(initialForm);

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


    if (!form.name.trim()) {

      nextErrors.name =
        "Lead name is required.";

    }


    if (!form.phone.trim()) {

      nextErrors.phone =
        "Phone number is required.";

    }


    if (
      form.email &&
      !/^\S+@\S+\.\S+$/.test(form.email)
    ) {

      nextErrors.email =
        "Enter a valid email address.";

    }


    setErrors(nextErrors);


    return Object.keys(nextErrors).length === 0;

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!validate()) return;


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


      toast.error(
        error.response?.data?.detail ||
          "Unable to save lead."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <Modal
      open={open}
      onClose={onClose}
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
              className="input"
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

          </div>


          {/* FOLLOW UP */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">

              Follow-up date

            </label>


            <input
              type="date"
              name="follow_up_date"
              value={form.follow_up_date}
              onChange={handleChange}
              className="input"
            />

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
                className="input disabled:bg-slate-50"
              >

                <option value="">
                  Unassigned
                </option>


                {employees.map((employee) => (

                  <option
                    key={employee.id}
                    value={employee.id}
                  >

                    {employee.name} — {employee.email}

                  </option>

                ))}

              </select>


              {employeeLoading && (

                <p className="mt-1 text-xs text-slate-400">
                  Loading employees...
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
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
