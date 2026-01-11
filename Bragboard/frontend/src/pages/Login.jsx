import { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // ✅ OAuth2PasswordRequestForm expects "username" + "password" in form-urlencoded
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await API.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/feed");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("LOGIN RESPONSE:", err?.response?.data);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data ||
        "Login failed";

      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl border border-zinc-800 shadow-xl">
        {/* Left Branding */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur border border-white/20" />
            <div>
              <h1 className="text-2xl font-bold text-white">BragBoard</h1>
              <p className="text-sm text-white/80">
                Celebrate wins. Build culture.
              </p>
            </div>
          </div>

          <div className="text-white/90">
            <p className="text-lg font-semibold">
              ✨ One shout-out can change morale.
            </p>
            <p className="text-sm mt-2 text-white/80">
              Appreciate peers, track recognition, and create a positive team
              culture.
            </p>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="bg-zinc-950 p-8 md:p-10">
          <div className="md:hidden mb-6">
            <h1 className="text-2xl font-bold text-white">BragBoard</h1>
            <p className="text-sm text-zinc-400">Welcome back 👋</p>
          </div>

          <h2 className="text-2xl font-bold text-white">Sign in</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Login with your employee credentials.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm text-zinc-300">Email</label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-white outline-none focus:border-indigo-500"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-white outline-none focus:border-indigo-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-400">
            New user?{" "}
            <Link to="/register" className="text-indigo-400 hover:underline">
              Create account
            </Link>
          </p>

          <p className="mt-3 text-xs text-zinc-600">
            Built by Sanjay • BragBoard v1
          </p>
        </div>
      </div>
    </div>
  );
}
