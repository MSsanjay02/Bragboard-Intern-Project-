import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold">BragBoard Dashboard</h1>
        <p className="text-gray-600 mt-2">You are logged in ✅</p>

        <button
          onClick={() => navigate("/feed")}
          className="mt-6 px-4 py-2 bg-black text-white rounded-lg"
        >
          Go to Feed 🚀
        </button>

        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
