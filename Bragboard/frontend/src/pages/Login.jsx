import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded mb-6"
          placeholder="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="w-full bg-black text-white py-2 rounded-lg">
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          No account?{" "}
          <Link className="text-blue-600 underline" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
