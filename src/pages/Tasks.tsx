export function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors">
          New Task
        </button>
      </div>
      <p className="text-gray-400">No tasks yet. Create one to get started.</p>
    </div>
  );
}
