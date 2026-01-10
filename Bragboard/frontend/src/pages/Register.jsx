import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", form);
      console.log("REGISTER SUCCESS:", res.data);

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      // ✅ This will show the real backend error
      console.log("REGISTER ERROR:", err);
      console.log("REGISTER RESPONSE:", err?.response?.data);

      alert(
        JSON.stringify(err?.response?.data || "Registration failed", null, 2)
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

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
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          className="w-full p-2 border rounded mb-6"
          placeholder="Department (ex: CSE, HR)"
          name="department"
          value={form.department}
          onChange={handleChange}
          required
        />

        <button className="w-full bg-black text-white py-2 rounded-lg">
          Create Account
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
