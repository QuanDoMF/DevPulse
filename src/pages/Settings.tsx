import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGitHubData, clearGitHubData } from "@/store/githubSlice";
import {
  getRepoConfig,
  saveRepoConfig,
  clearRepoConfig,
  saveGitHubToken,
  getTokenStatus,
  saveTokenHint,
  getTokenHint,
  clearTokenHint,
  deleteGitHubToken,
} from "@/services/githubService";

export function Settings() {
  const dispatch = useAppDispatch();
  const { loading, error, configured } = useAppSelector((s) => s.github);

  const [token, setToken] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [tokenHint, setTokenHint] = useState<string | null>(null);
  const [tokenSaving, setTokenSaving] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const repoConfig = getRepoConfig();
    if (repoConfig) {
      setOwner(repoConfig.owner);
      setRepo(repoConfig.repo);
      if (configured) {
        setConnected(true);
      }
    }
    getTokenStatus().then(setTokenConfigured).catch(() => {});
    setTokenHint(getTokenHint());
  }, [configured]);

  const handleSaveToken = async () => {
    if (!token.trim()) return;
    setTokenSaving(true);
    setTokenError("");
    try {
      await saveGitHubToken(token);
      saveTokenHint(token);
      setTokenConfigured(true);
      setTokenHint(getTokenHint());
      setToken("");
    } catch {
      setTokenError("Failed to save token. Please try again.");
    }
    setTokenSaving(false);
  };

  const handleDeleteToken = async () => {
    try {
      await deleteGitHubToken();
      clearTokenHint();
      setTokenConfigured(false);
      setTokenHint(null);
      if (connected) {
        handleDisconnect();
      }
    } catch {
      setTokenError("Failed to remove token.");
    }
  };

  const handleConnect = async () => {
    saveRepoConfig({ owner, repo });
    const result = await dispatch(fetchGitHubData());
    if (fetchGitHubData.fulfilled.match(result)) {
      setConnected(true);
    }
  };

  const handleDisconnect = () => {
    clearRepoConfig();
    dispatch(clearGitHubData());
    setConnected(false);
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
                {tokenHint && (
                  <code className="ml-1 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                    {tokenHint}
                  </code>
                )}
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
            {tokenConfigured && (
              <button
                onClick={handleDeleteToken}
                className="rounded-lg border border-red-800 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Needs <code className="rounded bg-gray-800 px-1">repo</code> scope.
          </p>
          {tokenError && (
            <p className="mt-2 text-sm text-red-400">{tokenError}</p>
          )}
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
              disabled={connected}
              placeholder="QuanDoMF"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={connected}
              placeholder="DevPulse"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2">
            {connected ? (
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-red-800 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={!isRepoValid || !tokenConfigured || loading}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>

          {connected && !error && (
            <div className="rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-400">
              Connected to <strong>{owner}/{repo}</strong>. Dashboard is now showing real data.
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
