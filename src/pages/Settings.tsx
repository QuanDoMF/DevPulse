import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGitHubData } from "@/store/githubSlice";
import {
  getRepoConfig,
  saveRepoConfig,
  saveGitHubToken,
  getTokenStatus,
} from "@/services/githubService";

export function Settings() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.github);

  const [token, setToken] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tokenSaving, setTokenSaving] = useState(false);

  useEffect(() => {
    const repoConfig = getRepoConfig();
    if (repoConfig) {
      setOwner(repoConfig.owner);
      setRepo(repoConfig.repo);
    }
    getTokenStatus().then(setTokenConfigured).catch(() => {});
  }, []);

  const handleSaveToken = async () => {
    if (!token.trim()) return;
    setTokenSaving(true);
    try {
      await saveGitHubToken(token);
      setTokenConfigured(true);
      setToken("");
    } catch {
      // error handled by UI
    }
    setTokenSaving(false);
  };

  const handleConnect = async () => {
    setSaved(false);
    saveRepoConfig({ owner, repo });
    await dispatch(fetchGitHubData());
    setSaved(true);
  };

  const isRepoValid = owner.trim() !== "" && repo.trim() !== "";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {/* GitHub Token */}
      <div className="max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white">GitHub Token</h2>
        <p className="mt-1 text-sm text-gray-400">
          Your token is encrypted and stored securely on the server.
        </p>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            {tokenConfigured ? (
              <>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-emerald-400">Token configured</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-sm text-red-400">No token</span>
              </>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={tokenConfigured ? "Replace token..." : "ghp_xxxxxxxxxxxx"}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleSaveToken}
              disabled={!token.trim() || tokenSaving}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {tokenSaving ? "Saving..." : "Save"}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Needs <code className="rounded bg-gray-800 px-1">repo</code> scope.
          </p>
        </div>
      </div>

      {/* Repository */}
      <div className="max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white">Repository</h2>
        <p className="mt-1 text-sm text-gray-400">
          Select which repository to display data from.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="gh-owner" className="block text-sm font-medium text-gray-300">
              Owner
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

          <div>
            <label htmlFor="gh-repo" className="block text-sm font-medium text-gray-300">
              Repository
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

          <button
            onClick={handleConnect}
            disabled={!isRepoValid || !tokenConfigured || loading}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>

          {saved && !error && (
            <div className="rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-400">
              Connected! Dashboard is now showing real data.
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
