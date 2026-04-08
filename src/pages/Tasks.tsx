import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setLoading,
  setError,
  type Task,
} from "@/store/tasksSlice";
import { setProjects } from "@/store/projectsSlice";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";

// --- Types ---

type StatusFilter = "all" | "todo" | "in_progress" | "done";
type PriorityFilter = "all" | "low" | "medium" | "high";

interface TaskFormData {
  title: string;
  body: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: string;
}

const emptyForm: TaskFormData = {
  title: "",
  body: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  projectId: "",
};

// --- Badges ---

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: "bg-gray-500/10 text-gray-400",
    in_progress: "bg-amber-500/10 text-amber-400",
    done: "bg-emerald-500/10 text-emerald-400",
  };
  const labels: Record<string, string> = {
    todo: "Todo",
    in_progress: "In Progress",
    done: "Done",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-500/10 text-gray-400"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "bg-blue-500/10 text-blue-400",
    medium: "bg-amber-500/10 text-amber-400",
    high: "bg-red-500/10 text-red-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[priority] ?? "bg-gray-500/10 text-gray-400"}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// --- Modal ---

function TaskModal({
  open,
  title,
  form,
  saving,
  projects,
  onChange,
  onSave,
  onClose,
}: {
  open: boolean;
  title: string;
  form: TaskFormData;
  saving: boolean;
  projects: { id: number; name: string }[];
  onChange: (f: TaskFormData) => void;
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
              placeholder="Task title"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={form.body}
              onChange={(e) => onChange({ ...form, body: e.target.value })}
              rows={3}
              placeholder="Task details..."
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => onChange({ ...form, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => onChange({ ...form, priority: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => onChange({ ...form, dueDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Project</label>
              <select
                value={form.projectId}
                onChange={(e) => onChange({ ...form, projectId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
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
        <h2 className="text-lg font-semibold text-white">Delete Task</h2>
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

// --- Tasks Page ---

export function Tasks() {
  const dispatch = useAppDispatch();
  const { items: tasks, loading, error } = useAppSelector((s) => s.tasks);
  const { items: projects } = useAppSelector((s) => s.projects);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch tasks + projects on mount
  const fetchData = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
      ]);
      dispatch(setTasks(tasksRes.data.tasks));
      dispatch(setProjects(projectsRes.data.projects));
    } catch {
      dispatch(setError("Failed to load tasks."));
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get project name by id
  const projectName = (id: number | null) => {
    if (!id) return "-";
    return projects.find((p) => p.id === id)?.name ?? "-";
  };

  // Filter + search
  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (projectFilter !== "all" && String(t.projectId) !== projectFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Open create
  const openCreate = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit
  const openEdit = (t: Task) => {
    setEditingTask(t);
    setForm({
      title: t.title,
      body: t.body ?? "",
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
      projectId: t.projectId ? String(t.projectId) : "",
    });
    setModalOpen(true);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<Task> = {
        title: form.title,
        body: form.body || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        projectId: form.projectId ? Number(form.projectId) : null,
      };
      if (editingTask) {
        const res = await taskService.update(editingTask.id, payload);
        dispatch(updateTask(res.data.task));
      } else {
        const res = await taskService.create(payload);
        dispatch(addTask(res.data.task));
      }
      setModalOpen(false);
    } catch {
      dispatch(setError("Failed to save task."));
    }
    setSaving(false);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.delete(deleteTarget.id);
      dispatch(removeTask(deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      dispatch(setError("Failed to delete task."));
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-64 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-900/20 px-6 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && tasks.length === 0 && (
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-400">
            {search || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all"
              ? "No tasks match your filters."
              : "No tasks yet. Create your first task!"}
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-white">{t.title}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">{projectName(t.projectId)}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-lg border border-gray-700 px-3 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="rounded-lg border border-red-800/50 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        open={modalOpen}
        title={editingTask ? "Edit Task" : "New Task"}
        form={form}
        saving={saving}
        projects={projects}
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
