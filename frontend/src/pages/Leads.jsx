import { useCallback, useEffect, useState } from "react";
import {
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

import leadService from "../services/leadService";
import { useAuth } from "../context/AuthContext";

import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
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

export default function Leads() {
    const { user } = useAuth();

    const isAdmin = user?.role === "ADMIN";
    const isSales = user?.role === "SALES_EMPLOYEE";

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [stage, setStage] = useState("");

    const [selectedLead, setSelectedLead] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    const [deleteLeadId, setDeleteLeadId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =========================================================
    // LOAD LEADS
    // =========================================================

    const loadLeads = useCallback(async () => {
        try {
            setLoading(true);

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (stage) {
                params.stage = stage;
            }

            const data = await leadService.getLeads(params);

            setLeads(data);
        } catch (error) {
            console.error("Load leads error:", error);

            toast.error(
                error?.response?.data?.detail ||
                "Unable to load leads."
            );
        } finally {
            setLoading(false);
        }
    }, [search, stage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadLeads();
        }, 300);

        return () => clearTimeout(timer);
    }, [loadLeads]);

    // =========================================================
    // ADD LEAD - ADMIN ONLY
    // =========================================================

    const handleAdd = () => {
        if (!isAdmin) return;

        setEditingLead(null);
        setFormOpen(true);
    };

    // =========================================================
    // EDIT LEAD - ADMIN ONLY
    // =========================================================

    const handleEdit = (lead) => {
        if (!isAdmin) return;

        setEditingLead(lead);
        setFormOpen(true);
    };

    // =========================================================
    // VIEW LEAD - ADMIN + SALES
    // =========================================================

    const handleView = (lead) => {
        setSelectedLead(lead);
        setDetailsOpen(true);
    };

    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedLead(null);
    };

    // =========================================================
    // DELETE - ADMIN ONLY
    // =========================================================

    const handleDelete = async () => {
        if (!isAdmin || !deleteLeadId) {
            return;
        }

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
        setFormOpen(false);
        setEditingLead(null);

        toast.success(
            editingLead
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
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="page-container">

            {/* =====================================================
          PAGE HEADER
      ====================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-primary-50 p-2.5">
                            <Users className="h-5 w-5 text-primary-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Leads
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                {isAdmin
                                    ? "Manage and track your sales pipeline"
                                    : "View and manage your assigned leads"}
                            </p>
                        </div>

                    </div>
                </div>

                {/* =================================================
            ADD LEAD - ADMIN ONLY
        ================================================== */}

                {isAdmin && (
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Lead
                    </button>
                )}

            </div>

            {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

            <div className="card mb-6 p-4">

                <div className="grid gap-3 md:grid-cols-[1fr_220px]">

                    <div className="relative">

                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search leads by name, phone or email..."
                            className="input pl-10"
                        />

                    </div>

                    <select
                        value={stage}
                        onChange={(event) =>
                            setStage(event.target.value)
                        }
                        className="input"
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

                </div>

            </div>

            {/* =====================================================
          LEADS TABLE
      ====================================================== */}

            <div className="card overflow-hidden">

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="text-sm text-slate-500">
                            Loading leads...
                        </div>
                    </div>

                ) : leads.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                        <div className="mb-4 rounded-full bg-slate-100 p-4">
                            <Users className="h-6 w-6 text-slate-400" />
                        </div>

                        <h3 className="text-base font-semibold text-slate-900">
                            No leads found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            {search || stage
                                ? "Try changing your search or filter."
                                : isAdmin
                                    ? "Create your first lead to get started."
                                    : "You currently have no leads assigned to you."}
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="min-w-full divide-y divide-slate-200">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Lead
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Contact
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Stage
                                    </th>

                                    {isAdmin && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Assigned
                                        </th>
                                    )}

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Follow-up
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">

                                {leads.map((lead) => (

                                    <tr
                                        key={lead.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* LEAD */}

                                        <td className="whitespace-nowrap px-6 py-4">

                                            <div className="font-semibold text-slate-900">
                                                {lead.name}
                                            </div>

                                            <div className="mt-0.5 text-xs text-slate-400">
                                                Lead #{lead.id}
                                            </div>

                                        </td>

                                        {/* CONTACT */}

                                        <td className="whitespace-nowrap px-6 py-4">

                                            <div className="text-sm text-slate-700">
                                                {lead.phone}
                                            </div>

                                            {lead.email && (
                                                <div className="mt-0.5 text-xs text-slate-400">
                                                    {lead.email}
                                                </div>
                                            )}

                                        </td>

                                        {/* STAGE */}

                                        <td className="whitespace-nowrap px-6 py-4">
                                            <Badge value={lead.stage} />
                                        </td>

                                        {/* ASSIGNED */}

                                        {isAdmin && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                {lead.assigned_to
                                                    ? `Employee #${lead.assigned_to}`
                                                    : "Unassigned"}
                                            </td>
                                        )}

                                        {/* FOLLOW UP */}

                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                            {formatDate(lead.follow_up_date)}
                                        </td>

                                        {/* ACTIONS */}

                                        <td className="whitespace-nowrap px-6 py-4">

                                            <div className="flex justify-end gap-2">

                                                {/* =================================
                            VIEW
                            ADMIN + SALES
                        ================================== */}

                                                <button
                                                    type="button"
                                                    onClick={() => handleView(lead)}
                                                    title="View lead"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* =================================
                            EDIT
                            ADMIN ONLY
                        ================================== */}

                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(lead)
                                                        }
                                                        title="Edit lead"
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {/* =================================
                            DELETE
                            ADMIN ONLY
                        ================================== */}

                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteLeadId(lead.id)
                                                        }
                                                        title="Delete lead"
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* =====================================================
          ADD / EDIT LEAD MODAL
          ADMIN ONLY
      ====================================================== */}

            {isAdmin && (
                <Modal
                    open={formOpen}
                    onClose={handleFormCancel}
                    title={editingLead ? "Edit Lead" : "Add Lead"}
                    description={
                        editingLead
                            ? "Update lead information and assignment."
                            : "Create a new sales lead."
                    }
                    size="lg"
                >
                    <LeadForm
                        open={formOpen && isAdmin}
                        onClose={handleFormCancel}
                        lead={editingLead}
                        onSaved={handleFormSuccess}
                    />
                </Modal>
            )}

            {/* =====================================================
          LEAD DETAILS
          
          IMPORTANT:
          LeadDetails already contains its own Modal.
          DO NOT wrap it inside another Modal.
          
          ADMIN + SALES
      ====================================================== */}

            <LeadDetails
                open={detailsOpen}
                onClose={handleCloseDetails}
                lead={selectedLead}
            />

            {/* =====================================================
          DELETE CONFIRMATION
          ADMIN ONLY
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

                        <p className="text-sm leading-6 text-slate-600">
                            Are you sure you want to delete this lead?
                            All associated notes will also be removed.
                        </p>

                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    setDeleteLeadId(null)
                                }
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >

                                <Trash2 className="h-4 w-4" />

                                {deleting
                                    ? "Deleting..."
                                    : "Delete Lead"}

                            </button>

                        </div>

                    </div>

                </Modal>
            )}

        </div>
    );
}