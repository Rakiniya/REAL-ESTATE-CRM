import { useEffect, useState } from "react";
import {
  CalendarDays,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import Badge from "../common/Badge";
import leadService from "../../services/leadService";


export default function LeadDetails({
  open,
  onClose,
  lead,
}) {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!open || !lead) return;

    const loadNotes = async () => {
      try {
        setLoadingNotes(true);

        const result =
          await leadService.getNotes(lead.id);

        setNotes(result);
      } catch (error) {
        toast.error(
          error.response?.data?.detail ||
            "Unable to load notes."
        );
      } finally {
        setLoadingNotes(false);
      }
    };

    loadNotes();
  }, [open, lead]);

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error("Enter a note first.");
      return;
    }

    try {
      setSavingNote(true);

      const created = await leadService.addNote(
        lead.id,
        note.trim()
      );

      setNotes((previous) => [
        created,
        ...previous,
      ]);

      setNote("");

      toast.success("Note added.");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to add note."
      );
    } finally {
      setSavingNote(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lead Details"
      description="Review customer information and follow-up activity."
      size="lg"
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-slate-50 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {lead.name}
              </h3>

              <div className="mt-2">
                <Badge value={lead.stage} />
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Lead ID
              </p>

              <p className="mt-1 font-semibold text-slate-700">
                #{lead.id}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem
            icon={Phone}
            label="Phone"
            value={lead.phone}
          />

          <InfoItem
            icon={Mail}
            label="Email"
            value={lead.email || "Not provided"}
          />

          <InfoItem
            icon={CalendarDays}
            label="Follow-up"
            value={
              lead.follow_up_date ||
              "No follow-up scheduled"
            }
          />

          <InfoItem
            icon={UserRound}
            label="Assigned employee"
            value={
              lead.assigned_to
                ? `Employee #${lead.assigned_to}`
                : "Unassigned"
            }
          />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-base font-semibold text-slate-900">
            Add Note
          </h3>

          <textarea
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            rows={3}
            placeholder="Record a call, meeting, customer request, or follow-up..."
            className="input mt-3 resize-none"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleAddNote}
              disabled={savingNote}
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {savingNote ? "Adding..." : "Add Note"}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Activity Notes
            </h3>

            <span className="text-xs text-slate-400">
              {notes.length} notes
            </span>
          </div>

          {loadingNotes ? (
            <div className="mt-4 space-y-3">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                No notes yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add the first activity note above.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {notes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <p className="text-sm leading-6 text-slate-700">
                    {item.note}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}