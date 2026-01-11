import { useEffect, useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/analytics/leaderboard");
        setRows(res.data);
      } catch (err) {
        alert(err?.response?.data?.detail || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow" />
            <div>
              <h1 className="text-xl font-bold leading-tight">Leaderboard</h1>
              <p className="text-xs text-zinc-400">Department ranking</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/feed"
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
            >
              Feed
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold">Top Employees</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Ranked by ⭐ stars first, then total reactions.
          </p>

          {loading ? (
            <p className="mt-6 text-zinc-400">Loading leaderboard...</p>
          ) : (
            <div className="mt-6 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-400">
                  <tr className="border-b border-zinc-800">
                    <th className="py-3 text-left">Rank</th>
                    <th className="py-3 text-left">Employee</th>
                    <th className="py-3 text-center">Shoutouts</th>
                    <th className="py-3 text-center">⭐</th>
                    <th className="py-3 text-center">👏</th>
                    <th className="py-3 text-center">❤️</th>
                    <th className="py-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr
                      key={r.id}
                      className="border-b border-zinc-800 hover:bg-zinc-950/40"
                    >
                      <td className="py-3">{idx + 1}</td>
                      <td className="py-3 font-semibold">
                        {r.name}{" "}
                        <span className="text-xs text-zinc-500 font-normal">
                          ({r.department})
                        </span>
                      </td>
                      <td className="py-3 text-center">{r.shoutouts_received}</td>
                      <td className="py-3 text-center">{r.reactions.star}</td>
                      <td className="py-3 text-center">{r.reactions.clap}</td>
                      <td className="py-3 text-center">{r.reactions.like}</td>
                      <td className="py-3 text-center font-bold">
                        {r.reactions.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length === 0 && (
                <p className="mt-4 text-zinc-500">No leaderboard data yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
