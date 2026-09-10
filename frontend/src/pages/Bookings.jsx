import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import bookingService from "../services/bookingService";
import leadService from "../services/leadService";
import propertyService from "../services/propertyService";
import { useAuth } from "../context/AuthContext";


// =========================================================
// HELPERS
// =========================================================

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


// =========================================================
// LOADING STATE
// =========================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary-600" />

      <span className="text-sm text-slate-500">
        Loading bookings...
      </span>
    </div>
  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-slate-50 p-4">
        <CalendarDays className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">
        No bookings found
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        Confirmed and cancelled property bookings will appear here.
      </p>
    </div>
  );
}


// =========================================================
// FIELD ERROR
// =========================================================

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}


// =========================================================
// BOOKINGS PAGE
// =========================================================

export default function Bookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [units, setUnits] = useState([]);

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [form, setForm] = useState({
    lead_id: "",
    unit_id: "",
  });

  const [errors, setErrors] = useState({});


  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  const loadBookings = async () => {
    try {
      setLoading(true);

      const data = await bookingService.getBookings();

      setBookings(data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // LOAD BOOKING FORM DATA
  // IMPORTANT:
  // Load ALL units, not only AVAILABLE units.
  // This allows BOOKED units to remain visible.
  // =========================================================

  const loadFormData = async () => {
    try {
      setLoadingFormData(true);

      const [leadData, projectData, unitData] =
        await Promise.all([
          leadService.getLeads(),
          propertyService.getProjects(),
          propertyService.getAllUnits(),
        ]);

      setLeads(leadData);
      setProjects(projectData);
      setUnits(unitData);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load booking form data."
      );
    } finally {
      setLoadingFormData(false);
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBookings();
  }, []);


  // =========================================================
  // OPEN BOOKING MODAL
  // =========================================================

  const openBookingModal = async () => {
    setForm({
      lead_id: "",
      unit_id: "",
    });

    setErrors({});

    setSelectedProjectId("");
    setSelectedBuildingId("");
    setBuildings([]);

    setBookingModalOpen(true);

    await loadFormData();
  };


  // =========================================================
  // PROJECT CHANGE
  // =========================================================

  const handleProjectChange = async (event) => {
    const projectId = event.target.value;

    setSelectedProjectId(projectId);

    setSelectedBuildingId("");

    setForm((previous) => ({
      ...previous,
      unit_id: "",
    }));

    setErrors((previous) => ({
      ...previous,
      project_id: "",
      building_id: "",
      unit_id: "",
    }));

    if (!projectId) {
      setBuildings([]);
      return;
    }

    try {
      const data =
        await propertyService.getBuildings(projectId);

      setBuildings(data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load buildings."
      );

      setBuildings([]);
    }
  };


  // =========================================================
  // BUILDING CHANGE
  // IMPORTANT:
  // Load ALL units for the building.
  // Do NOT filter BOOKED units out.
  // =========================================================

  const handleBuildingChange = async (event) => {
    const buildingId = event.target.value;

    setSelectedBuildingId(buildingId);

    setForm((previous) => ({
      ...previous,
      unit_id: "",
    }));

    setErrors((previous) => ({
      ...previous,
      building_id: "",
      unit_id: "",
    }));

    if (!buildingId) {
      setUnits([]);
      return;
    }

    try {
      const data =
        await propertyService.getUnits(buildingId);

      // Keep AVAILABLE and BOOKED units visible.
      setUnits(data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load units."
      );

      setUnits([]);
    }
  };


  // =========================================================
  // VALIDATE BOOKING
  // =========================================================

  const validateBooking = () => {
    const newErrors = {};

    if (!form.lead_id) {
      newErrors.lead_id =
        "Please select a customer or lead.";
    }

    if (!selectedProjectId) {
      newErrors.project_id =
        "Please select a project.";
    }

    if (!selectedBuildingId) {
      newErrors.building_id =
        "Please select a building.";
    }

    if (!form.unit_id) {
      newErrors.unit_id =
        "Please select an available unit.";
    }

    if (form.unit_id) {
      const selected = units.find(
        (unit) =>
          String(unit.id) === String(form.unit_id)
      );

      if (!selected) {
        newErrors.unit_id =
          "The selected unit is no longer available.";
      } else if (selected.status !== "AVAILABLE") {
        newErrors.unit_id =
          "This unit is no longer available.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // =========================================================
  // CREATE BOOKING
  // =========================================================

  const handleCreateBooking = async (event) => {
    event.preventDefault();

    if (!validateBooking()) {
      toast.error(
        "Please complete all required fields."
      );

      return;
    }

    try {
      setSaving(true);

      await bookingService.createBooking({
        lead_id: Number(form.lead_id),
        unit_id: Number(form.unit_id),
      });

      toast.success(
        "Booking created successfully."
      );

      setBookingModalOpen(false);

      await loadBookings();

      setForm({
        lead_id: "",
        unit_id: "",
      });

      setErrors({});
    } catch (error) {
      // =====================================================
      // BOOKING CONFLICT
      // Backend returns 409 when another user booked it.
      // =====================================================

      if (error.response?.status === 409) {
        toast.error(
          "This unit has already been booked. Please select another unit."
        );

        setErrors({
          unit_id:
            "This unit was just booked by another user. Please select another unit.",
        });

        // Refresh units so the latest BOOKED status is visible.
        await loadFormData();
      } else {
        toast.error(
          error.response?.data?.detail ||
            "Unable to create booking."
        );
      }
    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // OPEN CANCEL MODAL
  // =========================================================

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };


  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setSaving(true);

      await bookingService.cancelBooking(
        selectedBooking.id
      );

      toast.success(
        "Booking cancelled successfully."
      );

      setCancelModalOpen(false);
      setSelectedBooking(null);

      await loadBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to cancel booking."
      );
    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // FILTER BOOKINGS
  // =========================================================

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      const matchesSearch =
        !query ||
        String(booking.id).includes(query) ||
        String(booking.lead_id).includes(query) ||
        String(booking.unit_id).includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);


  // =========================================================
  // KPI COUNTS
  // =========================================================

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;


  // =========================================================
  // SELECTED UNIT
  // =========================================================

  const selectedUnit = units.find(
    (unit) =>
      String(unit.id) === String(form.unit_id)
  );


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page-container">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />

            <span>Sales Operations</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Bookings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage property reservations and booking status.
          </p>
        </div>

        <button
          type="button"
          onClick={openBookingModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />

          New Booking
        </button>
      </div>


      {/* ===================================================
          KPI CARDS
      =================================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Total */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Bookings
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {bookings.length}
              </p>
            </div>

            <div className="rounded-xl bg-primary-50 p-3">
              <CalendarDays className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>


        {/* Confirmed */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Confirmed
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {confirmedCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>


        {/* Cancelled */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Cancelled
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {cancelledCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

      </div>


      {/* ===================================================
          BOOKING TABLE
      =================================================== */}

      <div className="card overflow-hidden">

        <div className="border-b border-slate-100 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Booking History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View and manage your property bookings.
              </p>
            </div>


            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search booking, lead or unit..."
                  className="input pl-9"
                />
              </div>


              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="input"
              >
                <option value="ALL">
                  All statuses
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

            </div>
          </div>
        </div>


        {loading ? (
          <LoadingState />
        ) : filteredBookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Booking
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Lead
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Unit
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Booking Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-slate-50/60"
                  >

                    {/* Booking ID */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        #{booking.id}
                      </p>
                    </td>


                    {/* Lead */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">

                        <div className="rounded-lg bg-slate-100 p-2">
                          <UserRound className="h-4 w-4 text-slate-500" />
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          Lead #{booking.lead_id}
                        </span>

                      </div>
                    </td>


                    {/* Unit */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">

                        <div className="rounded-lg bg-primary-50 p-2">
                          <Home className="h-4 w-4 text-primary-600" />
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          Unit #{booking.unit_id}
                        </span>

                      </div>
                    </td>


                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {formatDate(
                        booking.booking_date
                      )}
                    </td>


                    {/* Status */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <Badge
                        value={booking.status}
                        type="status"
                      />
                    </td>


                    {/* Action */}
                    <td className="whitespace-nowrap px-5 py-4 text-right">

                      {booking.status ===
                        "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() =>
                            openCancelModal(
                              booking
                            )
                          }
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}

                      {booking.status ===
                        "CANCELLED" && (
                        <span className="text-xs font-medium text-slate-400">
                          Cancelled
                        </span>
                      )}

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* ===================================================
          CREATE BOOKING MODAL
      =================================================== */}

      <Modal
        open={bookingModalOpen}
        onClose={() => {
          if (!saving) {
            setBookingModalOpen(false);
          }
        }}
        title="Create New Booking"
        description="Connect a lead with a property unit."
        size="lg"
      >

        {loadingFormData ? (
          <LoadingState />
        ) : (

          <form
            onSubmit={handleCreateBooking}
            className="space-y-6"
            noValidate
          >

            {/* =================================================
                LEAD
            ================================================= */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Customer / Lead

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <select
                value={form.lead_id}
                onChange={(event) => {

                  setForm((previous) => ({
                    ...previous,
                    lead_id: event.target.value,
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    lead_id: "",
                  }));

                }}
                className={`input ${
                  errors.lead_id
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : ""
                }`}
              >

                <option value="">
                  Select a lead
                </option>

                {leads.map((lead) => (
                  <option
                    key={lead.id}
                    value={lead.id}
                  >
                    {lead.name} — Lead #{lead.id}
                  </option>
                ))}

              </select>


              <FieldError
                message={errors.lead_id}
              />


              {leads.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No leads are available for booking.
                </p>
              )}

            </div>


            {/* =================================================
                PROJECT
            ================================================= */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Project

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                className={`input ${
                  errors.project_id
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : ""
                }`}
              >

                <option value="">
                  Select a project
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name} —{" "}
                    {project.location}
                  </option>
                ))}

              </select>


              <FieldError
                message={errors.project_id}
              />

            </div>


            {/* =================================================
                BUILDING
            ================================================= */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Building

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <select
                value={selectedBuildingId}
                onChange={handleBuildingChange}
                disabled={!selectedProjectId}
                className={`input disabled:cursor-not-allowed disabled:bg-slate-50 ${
                  errors.building_id
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : ""
                }`}
              >

                <option value="">
                  {selectedProjectId
                    ? "Select a building"
                    : "Select a project first"}
                </option>

                {buildings.map((building) => (
                  <option
                    key={building.id}
                    value={building.id}
                  >
                    {building.name}
                  </option>
                ))}

              </select>


              <FieldError
                message={errors.building_id}
              />

            </div>


            {/* =================================================
                UNIT
            ================================================= */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Property Unit

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <select
                value={form.unit_id}
                onChange={(event) => {

                  const unitId = event.target.value;

                  const selected = units.find(
                    (unit) =>
                      String(unit.id) ===
                      String(unitId)
                  );

                  // Safety check:
                  // Never allow BOOKED unit to be selected.
                  if (
                    selected &&
                    selected.status !== "AVAILABLE"
                  ) {
                    setErrors((previous) => ({
                      ...previous,
                      unit_id:
                        "This unit is already booked. Please select another unit.",
                    }));

                    return;
                  }

                  setForm((previous) => ({
                    ...previous,
                    unit_id: unitId,
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    unit_id: "",
                  }));

                }}
                disabled={!selectedBuildingId}
                className={`input disabled:cursor-not-allowed disabled:bg-slate-50 ${
                  errors.unit_id
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : ""
                }`}
              >

                <option value="">
                  {selectedBuildingId
                    ? "Select an available unit"
                    : "Select a building first"}
                </option>


                {units.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                    disabled={
                      unit.status !== "AVAILABLE"
                    }
                  >
                    {unit.unit_number} —{" "}
                    {unit.type} —{" "}
                    {formatPrice(unit.price)} —{" "}
                    {unit.status}
                  </option>
                ))}

              </select>


              <FieldError
                message={errors.unit_id}
              />


              {/* Unit information */}
              {selectedBuildingId &&
                units.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Booked units are shown for visibility
                    but cannot be selected.
                  </p>
                )}


              {selectedBuildingId &&
                units.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No units found in this building.
                  </p>
                )}

            </div>


            {/* =================================================
                SELECTED UNIT PREVIEW
            ================================================= */}

            {selectedUnit && (
              <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-medium text-primary-600">
                      Selected Unit
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedUnit.unit_number}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedUnit.type}
                    </p>

                  </div>


                  <div className="text-right">

                    <p className="text-xs text-slate-500">
                      Price
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatPrice(
                        selectedUnit.price
                      )}
                    </p>

                    <div className="mt-1">

                      <Badge
                        value={
                          selectedUnit.status
                        }
                        type="status"
                      />

                    </div>

                  </div>

                </div>

              </div>
            )}


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

              <button
                type="button"
                onClick={() =>
                  setBookingModalOpen(false)
                }
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  saving ||
                  loadingFormData ||
                  leads.length === 0 ||
                  !form.unit_id
                }
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Creating..."
                  : "Confirm Booking"}
              </button>

            </div>

          </form>

        )}

      </Modal>


      {/* ===================================================
          CANCEL CONFIRMATION
      =================================================== */}

      <Modal
        open={cancelModalOpen}
        onClose={() => {
          if (!saving) {
            setCancelModalOpen(false);
          }
        }}
        title="Cancel Booking"
        description="This will release the unit and make it available again."
        size="sm"
      >

        <div className="space-y-5">

          <div className="rounded-xl bg-red-50 p-4">

            <div className="flex gap-3">

              <XCircle className="h-5 w-5 shrink-0 text-red-600" />

              <div>

                <p className="text-sm font-semibold text-red-800">
                  Cancel this booking?
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  Booking #{selectedBooking?.id} will be
                  cancelled and its unit will become
                  available again.
                </p>

              </div>

            </div>

          </div>


          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                setCancelModalOpen(false)
              }
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep Booking
            </button>


            <button
              type="button"
              onClick={handleCancelBooking}
              disabled={saving}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Cancelling..."
                : "Cancel Booking"}
            </button>

          </div>

        </div>

      </Modal>

    </div>
  );
}