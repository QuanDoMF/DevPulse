import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setNotes,
  addNote,
  updateNote,
  removeNote,
  setLoading,
  setError,
  type Note,
} from "@/store/notesSlice";
import { noteService } from "@/services/noteService";

// --- Types ---

interface NoteFormData {
  title: string;
  content: string;
  pinned: boolean;
}

const emptyForm: NoteFormData = {
  title: "",
  content: "",
  pinned: false,
};

// --- Modal ---

function NoteModal({
  open,
  title,
  form,
  saving,
  onChange,
  onSave,
  onClose,
}: {
  open: boolean;
  title: string;
  form: NoteFormData;
  saving: boolean;
  onChange: (f: NoteFormData) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="Note title"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => onChange({ ...form, content: e.target.value })}
              rows={6}
              placeholder="Write your note..."
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => onChange({ ...form, pinned: e.target.checked })}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
            />
            Pin this note
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!form.title.trim() || saving}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Delete Confirm ---

function DeleteConfirm({
  open,
  name,
  deleting,
  onConfirm,
  onClose,
}: {
  open: boolean;
  name: string;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white">Delete Note</h2>
        <p className="mt-2 text-sm text-gray-400">
          Are you sure you want to delete <strong className="text-white">{name}</strong>? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Notes Page ---

export function Notes() {
  const dispatch = useAppDispatch();
  const { items: notes, loading, error } = useAppSelector((s) => s.notes);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState<NoteFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch notes on mount
  const fetchNotes = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await noteService.getAll();
      dispatch(setNotes(res.data.notes));
    } catch {
      dispatch(setError("Failed to load notes."));
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filter + search, pinned first
  const filtered = notes
    .filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || (n.content ?? "").toLowerCase().includes(q);
    })
    .slice()
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  // Open create
  const openCreate = () => {
    setEditingNote(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit
  const openEdit = (n: Note) => {
    setEditingNote(n);
    setForm({
      title: n.title,
      content: n.content,
      pinned: n.pinned,
    });
    setModalOpen(true);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingNote) {
        const res = await noteService.update(editingNote.id, {
          title: form.title,
          content: form.content,
          pinned: form.pinned,
        });
        dispatch(updateNote(res.data.note));
      } else {
        const res = await noteService.create({
          title: form.title,
          content: form.content,
          pinned: form.pinned,
        });
        dispatch(addNote(res.data.note));
      }
      setModalOpen(false);
    } catch {
      dispatch(setError("Failed to save note."));
    }
    setSaving(false);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await noteService.delete(deleteTarget.id);
      dispatch(removeNote(deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      dispatch(setError("Failed to delete note."));
    }
    setDeleting(false);
  };

  // Toggle pin
  const togglePin = async (n: Note) => {
    try {
      const res = await noteService.update(n.id, { pinned: !n.pinned });
      dispatch(updateNote(res.data.note));
    } catch {
      dispatch(setError("Failed to update note."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Notes</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-64 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-900/20 px-6 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && notes.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-indigo-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-400">
            {search ? "No notes match your search." : "No notes yet. Create your first note!"}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col rounded-xl border bg-gray-900 p-6 ${
                n.pinned ? "border-indigo-500/50" : "border-gray-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white">{n.title}</h3>
                <button
                  onClick={() => togglePin(n)}
                  className={`flex-shrink-0 transition-colors ${
                    n.pinned ? "text-indigo-400 hover:text-indigo-300" : "text-gray-600 hover:text-gray-400"
                  }`}
                  title={n.pinned ? "Unpin" : "Pin"}
                >
                  <svg
                    className="h-5 w-5"
                    fill={n.pinned ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-2 line-clamp-4 flex-1 text-sm text-gray-400">{n.content}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(n.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(n)}
                    className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(n)}
                    className="rounded-lg border border-red-800/50 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <NoteModal
        open={modalOpen}
        title={editingNote ? "Edit Note" : "New Note"}
        form={form}
        saving={saving}
        onChange={setForm}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
      <DeleteConfirm
        open={!!deleteTarget}
        name={deleteTarget?.title ?? ""}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
