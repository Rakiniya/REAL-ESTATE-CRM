import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  Eye,
  Filter,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import leadService from "../services/leadService";
import { useAuth } from "../context/AuthContext";

import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/common/PageState";

import LeadForm from "../components/leads/LeadForm";
import LeadDetails from "../components/leads/LeadDetails";

const stages = [
  { value: "", label: "All stages" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "SITE_VISIT", label: "Site Visit" },
  { value: "INTERESTED", label: "Interested" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "BOOKED", label: "Booked" },
  { value: "LOST", label: "Lost" },
];

const stageLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site Visit",
  INTERESTED: "Interested",
  NEGOTIATION: "Negotiation",
  BOOKED: "Booked",
  LOST: "Lost",
};

export default function Leads() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [deleteLeadId, setDeleteLeadId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // LOAD LEADS
  // =========================================================

  const loadLeads = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (stage) {
          params.stage = stage;
        }

        const result = await leadService.getLeads(params);

        setLeads(result);
      } catch (error) {
        console.error("Load leads error:", error);

        const message =
          error?.response?.data?.detail ||
          "Unable to load leads.";

        setError(message);

        if (!showRefresh) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, stage]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadLeads]);

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const summary = useMemo(() => {
    const total = leads.length;

    const active = leads.filter(
      (lead) =>
        !["BOOKED", "LOST"].includes(lead.stage)
    ).length;

    const booked = leads.filter(
      (lead) => lead.stage === "BOOKED"
    ).length;

    const followUps = leads.filter(
      (lead) => Boolean(lead.follow_up_date)
    ).length;

    return {
      total,
      active,
      booked,
      followUps,
    };
  }, [leads]);

  // =========================================================
  // ADD
  // =========================================================

  const handleAdd = () => {
    if (!isAdmin) return;

    setEditingLead(null);
    setFormOpen(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (lead) => {
    if (!isAdmin) return;

    setEditingLead(lead);
    setFormOpen(true);
  };

  // =========================================================
  // VIEW
  // =========================================================

  const handleView = (lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLead(null);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!isAdmin || !deleteLeadId) return;

    try {
      setDeleting(true);

      await leadService.deleteLead(deleteLeadId);

      toast.success("Lead deleted successfully.");

      setDeleteLeadId(null);

      await loadLeads();
    } catch (error) {
      console.error("Delete lead error:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to delete lead."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // FORM SUCCESS
  // =========================================================

  const handleFormSuccess = async () => {
    const wasEditing = Boolean(editingLead);

    setFormOpen(false);
    setEditingLead(null);

    toast.success(
      wasEditing
        ? "Lead updated successfully."
        : "Lead created successfully."
    );

    await loadLeads();
  };

  // =========================================================
  // FORM CANCEL
  // =========================================================

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingLead(null);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setStage("");
  };

  const hasFilters = Boolean(search.trim() || stage);

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isFollowUpToday = (date) => {
    if (!date) return false;

    const today = new Date();
    const followUp = new Date(date);

    return (
      today.getFullYear() === followUp.getFullYear() &&
      today.getMonth() === followUp.getMonth() &&
      today.getDate() === followUp.getDate()
    );
  };

  return (
    <div className="page-container">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
              <Users className="h-3.5 w-3.5" />
              Sales Pipeline
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {isAdmin
                ? "Manage prospects, assignments, follow-ups and the complete sales pipeline."
                : "View and manage the leads assigned to you."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadLeads(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Total Leads"
          value={summary.total}
          description="Leads in current view"
        />

        <SummaryCard
          icon={UserCheck}
          label="Active Pipeline"
          value={summary.active}
          description="Open sales opportunities"
        />

        <SummaryCard
          icon={CalendarClock}
          label="Follow-ups"
          value={summary.followUps}
          description="Leads with follow-up dates"
        />

        <SummaryCard
          icon={Filter}
          label="Booked"
          value={summary.booked}
          description="Converted leads"
        />
      </section>

      {/* =====================================================
          SEARCH + FILTER BAR
      ====================================================== */}

      <section className="card mb-6">
        <div className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, phone or email..."
                className="input h-11 pl-10 pr-10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 lg:w-56 lg:flex-none">
                <select
                  value={stage}
                  onChange={(event) =>
                    setStage(event.target.value)
                  }
                  className="input h-11 appearance-none pr-10"
                >
                  {stages.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={() =>
                  setFiltersOpen((current) => !current)
                }
                className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition lg:hidden ${
                  filtersOpen || hasFilters
                    ? "border-primary-200 bg-primary-50 text-primary-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-400">
                Active filters:
              </span>

              {search && (
                <FilterPill
                  label={`Search: ${search}`}
                  onRemove={() => setSearch("")}
                />
              )}

              {stage && (
                <FilterPill
                  label={`Stage: ${
                    stageLabels[stage] || stage
                  }`}
                  onRemove={() => setStage("")}
                />
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          RESULTS HEADER
      ====================================================== */}

      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {loading
              ? "Loading leads..."
              : `${leads.length} ${
                  leads.length === 1 ? "lead" : "leads"
                }`}
          </p>

          {!loading && hasFilters && (
            <p className="mt-0.5 text-xs text-slate-400">
              Filtered results
            </p>
          )}
        </div>

        {!loading && !error && leads.length > 0 && (
          <p className="hidden text-xs text-slate-400 sm:block">
            Select a lead to view details
          </p>
        )}
      </div>

      {/* =====================================================
          LEADS CONTENT
      ====================================================== */}

      <div className="card overflow-hidden">
        {/* LOADING */}

        {loading && (
          <LoadingState message="Loading leads..." />
        )}

        {/* ERROR */}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={() => loadLeads()}
          />
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          leads.length === 0 && (
            <EmptyState
              title={
                hasFilters
                  ? "No matching leads"
                  : "No leads yet"
              }
              message={
                hasFilters
                  ? "Try adjusting your search or stage filter."
                  : isAdmin
                    ? "Create your first lead to start building your sales pipeline."
                    : "You currently have no leads assigned to you."
              }
              action={
                hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </button>
                ) : isAdmin ? (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first lead
                  </button>
                ) : null
              }
            />
          )}

        {/* DESKTOP TABLE */}

        {!loading &&
          !error &&
          leads.length > 0 && (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Lead
                      </th>

                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Contact
                      </th>

                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Stage
                      </th>

                      {isAdmin && (
                        <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Assigned
                        </th>
                      )}

                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Follow-up
                      </th>

                      <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="group transition hover:bg-slate-50/70"
                      >
                        {/* LEAD */}

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleView(lead)}
                            className="text-left"
                          >
                            <div className="flex items-center gap-3">
                              <LeadAvatar
                                name={lead.name}
                              />

                              <div>
                                <p className="font-semibold text-slate-900 group-hover:text-primary-600">
                                  {lead.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Lead #{lead.id}
                                </p>
                              </div>
                            </div>
                          </button>
                        </td>

                        {/* CONTACT */}

                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {lead.phone}
                            </div>

                            {lead.email && (
                              <div className="flex max-w-[220px] items-center gap-2 truncate text-xs text-slate-400">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                  {lead.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* STAGE */}

                        <td className="px-6 py-4">
                          <Badge value={lead.stage} />
                        </td>

                        {/* ASSIGNED */}

                        {isAdmin && (
                          <td className="px-6 py-4">
                            {lead.assigned_to ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                  E
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    Employee
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    #{lead.assigned_to}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                                Unassigned
                              </span>
                            )}
                          </td>
                        )}

                        {/* FOLLOW UP */}

                        <td className="px-6 py-4">
                          {lead.follow_up_date ? (
                            <div>
                              <div
                                className={`flex items-center gap-2 text-sm font-medium ${
                                  isFollowUpToday(
                                    lead.follow_up_date
                                  )
                                    ? "text-primary-600"
                                    : "text-slate-700"
                                }`}
                              >
                                <CalendarClock className="h-4 w-4" />

                                {formatDate(
                                  lead.follow_up_date
                                )}
                              </div>

                              {isFollowUpToday(
                                lead.follow_up_date
                              ) && (
                                <span className="mt-1 inline-block text-[11px] font-bold text-primary-600">
                                  Today
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No follow-up
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                            <ActionButton
                              icon={Eye}
                              label="View lead"
                              onClick={() =>
                                handleView(lead)
                              }
                            />

                            {isAdmin && (
                              <>
                                <ActionButton
                                  icon={Pencil}
                                  label="Edit lead"
                                  onClick={() =>
                                    handleEdit(lead)
                                  }
                                  variant="blue"
                                />

                                <ActionButton
                                  icon={Trash2}
                                  label="Delete lead"
                                  onClick={() =>
                                    setDeleteLeadId(
                                      lead.id
                                    )
                                  }
                                  variant="red"
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARDS */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {leads.map((lead) => (
                  <MobileLeadCard
                    key={lead.id}
                    lead={lead}
                    isAdmin={isAdmin}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(id) =>
                      setDeleteLeadId(id)
                    }
                    formatDate={formatDate}
                    isFollowUpToday={isFollowUpToday}
                  />
                ))}
              </div>
            </>
          )}
      </div>

      {/* =====================================================
          LEAD FORM

          LeadForm owns its own Modal.
          DO NOT wrap LeadForm inside another Modal.
      ====================================================== */}

      {isAdmin && (
        <LeadForm
          open={formOpen}
          onClose={handleFormCancel}
          lead={editingLead}
          onSaved={handleFormSuccess}
        />
      )}

      {/* =====================================================
          LEAD DETAILS

          LeadDetails owns its own Modal.
      ====================================================== */}

      <LeadDetails
        open={detailsOpen}
        onClose={handleCloseDetails}
        lead={selectedLead}
      />

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {isAdmin && (
        <Modal
          open={Boolean(deleteLeadId)}
          onClose={() => {
            if (!deleting) {
              setDeleteLeadId(null);
            }
          }}
          title="Delete Lead"
          description="This action cannot be undone."
          size="sm"
        >
          <div className="space-y-5">
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-700">
                Are you sure you want to delete this lead?
                All associated notes will also be removed.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteLeadId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {deleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ========================================================= */
/* SUMMARY CARD */
/* ========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-primary-50">
          <Icon className="h-5 w-5 text-slate-500 transition group-hover:text-primary-600" />
        </div>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ========================================================= */
/* LEAD AVATAR */
/* ========================================================= */

function LeadAvatar({ name }) {
  const initials = name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary-700">
      {initials || "L"}
    </div>
  );
}

/* ========================================================= */
/* ACTION BUTTON */
/* ========================================================= */

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}) {
  const styles = {
    default:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    blue:
      "text-slate-500 hover:bg-blue-50 hover:text-blue-600",
    red:
      "text-slate-500 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition ${styles[variant]}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ========================================================= */
/* FILTER PILL */
/* ========================================================= */

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
      {label}

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-primary-100"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/* ========================================================= */
/* MOBILE LEAD CARD */
/* ========================================================= */

function MobileLeadCard({
  lead,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  formatDate,
  isFollowUpToday,
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => onView(lead)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <LeadAvatar name={lead.name} />

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {lead.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Lead #{lead.id}
            </p>
          </div>
        </button>

        <Badge value={lead.stage} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Contact
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-700">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            {lead.phone}
          </div>

          {lead.email && (
            <div className="mt-1 flex items-center gap-2 truncate text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {lead.email}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Follow-up
          </p>

          <div
            className={`mt-1.5 flex items-center gap-2 text-sm font-medium ${
              isFollowUpToday(lead.follow_up_date)
                ? "text-primary-600"
                : "text-slate-700"
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />

            {formatDate(lead.follow_up_date)}
          </div>

          {isFollowUpToday(lead.follow_up_date) && (
            <p className="mt-1 text-[11px] font-bold text-primary-600">
              Scheduled today
            </p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-slate-400" />

            <span className="text-xs font-medium text-slate-500">
              Assigned
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-700">
            {lead.assigned_to
              ? `Employee #${lead.assigned_to}`
              : "Unassigned"}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onView(lead)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>

        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => onEdit(lead)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(lead.id)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}