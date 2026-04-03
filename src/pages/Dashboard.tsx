export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-sm font-medium text-gray-400">Projects</h3>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-sm font-medium text-gray-400">Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-sm font-medium text-gray-400">Notes</h3>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
      </div>
    </div>
  );
}
