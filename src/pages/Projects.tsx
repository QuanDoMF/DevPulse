import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setLoading,
  setError,
  type Project,
} from "@/store/projectsSlice";
import { projectService } from "@/services/projectService";

// --- Types ---

type StatusFilter = "all" | "active" | "completed" | "archived";

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  repoUrl: string;
}

const emptyForm: ProjectFormData = {
  name: "",
  description: "",
  status: "active",
  repoUrl: "",
};

// --- Status Badge ---

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400",
    completed: "bg-indigo-500/10 text-indigo-400",
    archived: "bg-gray-500/10 text-gray-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-500/10 text-gray-400"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// --- Modal ---

function ProjectModal({
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
  form: ProjectFormData;
  saving: boolean;
  onChange: (f: ProjectFormData) => void;
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
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="My Project"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Short description..."
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => onChange({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Repository URL</label>
            <input
              type="url"
              value={form.repoUrl}
              onChange={(e) => onChange({ ...form, repoUrl: e.target.value })}
              placeholder="https://github.com/user/repo"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
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
            disabled={!form.name.trim() || saving}
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
        <h2 className="text-lg font-semibold text-white">Delete Project</h2>
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

// --- Projects Page ---

export function Projects() {
  const dispatch = useAppDispatch();
  const { items: projects, loading, error } = useAppSelector((s) => s.projects);
  const { items: tasks } = useAppSelector((s) => s.tasks);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch projects on mount
  const fetchProjects = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await projectService.getAll();
      dispatch(setProjects(res.data.projects));
    } catch {
      dispatch(setError("Failed to load projects."));
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter + search
  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Task count per project
  const taskCount = (projectId: number) => tasks.filter((t) => t.projectId === projectId).length;

  // Open create modal
  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit modal
  const openEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      repoUrl: p.repoUrl ?? "",
    });
    setModalOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingProject) {
        const res = await projectService.update(editingProject.id, {
          name: form.name,
          description: form.description || null,
          status: form.status,
          repoUrl: form.repoUrl || null,
        });
        dispatch(updateProject(res.data.project));
      } else {
        const res = await projectService.create({
          name: form.name,
          description: form.description || null,
          status: form.status,
          repoUrl: form.repoUrl || null,
        });
        dispatch(addProject(res.data.project));
      }
      setModalOpen(false);
    } catch {
      dispatch(setError("Failed to save project."));
    }
    setSaving(false);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.delete(deleteTarget.id);
      dispatch(removeProject(deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      dispatch(setError("Failed to delete project."));
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-64 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-900/20 px-6 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && projects.length === 0 && (
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
              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-400">
            {search || statusFilter !== "all" ? "No projects match your filters." : "No projects yet. Create your first project!"}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>

              {p.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-400">{p.description}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {p.repoUrl && (
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                    Repo
                  </a>
                )}
                <span>{taskCount(p.id)} tasks</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-auto flex gap-2 pt-4">
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="rounded-lg border border-red-800/50 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        open={modalOpen}
        title={editingProject ? "Edit Project" : "New Project"}
        form={form}
        saving={saving}
        onChange={setForm}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
      <DeleteConfirm
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
