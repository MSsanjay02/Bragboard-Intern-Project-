import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/analytics/me");
        setData(res.data);
      } catch (err) {
        alert(err?.response?.data?.detail || "Failed to load profile stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!data) return null;

  const { user, stats } = data;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow" />
            <div>
              <h1 className="text-xl font-bold leading-tight">BragBoard</h1>
              <p className="text-xs text-zinc-400">Your Profile</p>
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
              to="/leaderboard"
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
            >
              Leaderboard
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
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-zinc-800 border border-zinc-700" />
            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-sm text-zinc-400">{user.email}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {user.department.toUpperCase()} • {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard title="Shoutouts Sent" value={stats.shoutouts_sent} />
          <StatCard title="Shoutouts Received" value={stats.shoutouts_received} />
          <StatCard title="Total Reactions Received" value={stats.reactions_received.total} />
          <StatCard title="Comments Made" value={stats.comments_made} />

          <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <p className="font-semibold">Reactions Breakdown</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <Breakdown label="❤️ Like" value={stats.reactions_received.like} />
              <Breakdown label="👏 Clap" value={stats.reactions_received.clap} />
              <Breakdown label="⭐ Star" value={stats.reactions_received.star} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Breakdown({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-center">
      <p className="text-zinc-300">{label}</p>
      <p className="text-xl font-bold mt-2">{value}</p>
    </div>
  );
}
