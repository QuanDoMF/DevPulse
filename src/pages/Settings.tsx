import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGitHubData } from "@/store/githubSlice";
import { getRepoConfig, saveRepoConfig, isTokenConfigured } from "@/services/githubService";

export function Settings() {
  const dispatch = useAppDispatch();
  const { loading, error, configured } = useAppSelector((s) => s.github);

  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [saved, setSaved] = useState(false);

  const tokenReady = isTokenConfigured();

  useEffect(() => {
    const config = getRepoConfig();
    if (config) {
      setOwner(config.owner);
      setRepo(config.repo);
    }
  }, []);

  const handleSave = async () => {
    setSaved(false);
    saveRepoConfig({ owner, repo });
    await dispatch(fetchGitHubData());
    setSaved(true);
  };

  const isValid = tokenReady && owner.trim() !== "" && repo.trim() !== "";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white">GitHub Connection</h2>
        <p className="mt-1 text-sm text-gray-400">
          Connect your GitHub repository to display real activity data.
        </p>

        <div className="mt-6 space-y-4">
          {/* Token status */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Personal Access Token
            </label>
            <div className="mt-1 flex items-center gap-2">
              {tokenReady ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-emerald-400">Token configured via .env</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-sm text-red-400">Token not found</span>
                </>
              )}
            </div>
            {!tokenReady && (
              <div className="mt-2 rounded-lg border border-amber-800 bg-amber-900/20 px-3 py-2 text-xs text-amber-400">
                Add <code className="rounded bg-gray-800 px-1">VITE_GITHUB_TOKEN=ghp_xxx</code> to
                your <code className="rounded bg-gray-800 px-1">.env</code> file, then restart the
                dev server.
              </div>
            )}
          </div>

          {/* Owner */}
          <div>
            <label htmlFor="gh-owner" className="block text-sm font-medium text-gray-300">
              Repository Owner
            </label>
            <input
              id="gh-owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="QuanDoMF"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Repo */}
          <div>
            <label htmlFor="gh-repo" className="block text-sm font-medium text-gray-300">
              Repository Name
            </label>
            <input
              id="gh-repo"
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="DevPulse"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!isValid || loading}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Save & Connect"}
          </button>

          {/* Status messages */}
          {saved && !error && configured && (
            <div className="rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-400">
              Connected successfully! Dashboard is now showing real data.
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
