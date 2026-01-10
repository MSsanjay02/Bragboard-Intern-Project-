import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [feed, setFeed] = useState([]);
  const [message, setMessage] = useState("");
  const [recipientIds, setRecipientIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const loadFeed = async () => {
    const res = await API.get("/shoutouts");
    setFeed(res.data);
  };

  useEffect(() => {
    loadUsers();
    loadFeed();
  }, []);

  const toggleRecipient = (id) => {
    setRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitShoutout = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post("/shoutouts", {
        message,
        recipient_ids: recipientIds,
      });

      setMessage("");
      setRecipientIds([]);
      await loadFeed();
      alert("Shout-out posted ✅");
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to post shout-out");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
          <h1 className="text-2xl font-bold">BragBoard Feed</h1>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Logout
          </button>
        </div>

        {/* Shoutout form */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Send a shout-out 🎉</h2>

          <form onSubmit={submitShoutout} className="space-y-3">
            <textarea
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder="Write something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <div>
              <p className="font-medium mb-2">Tag recipients:</p>

              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-auto border rounded-lg p-3">
                {users.map((u) => (
                  <label key={u.id} className="flex gap-2 items-center text-sm">
                    <input
                      type="checkbox"
                      checked={recipientIds.includes(u.id)}
                      onChange={() => toggleRecipient(u.id)}
                    />
                    <span>
                      {u.name}{" "}
                      <span className="text-gray-500">({u.department})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Shout-out"}
            </button>
          </form>
        </div>

        {/* Feed posts */}
        <div className="space-y-4">
          {feed.map((post) => (
            <div key={post.id} className="bg-white p-5 rounded-xl shadow">
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {post.sender.name}{" "}
                  <span className="text-gray-500 font-normal">
                    ({post.sender.department})
                  </span>
                </p>

                <p className="text-sm text-gray-500">
                  {post.created_at
                    ? new Date(post.created_at).toLocaleString()
                    : ""}
                </p>
              </div>

              <p className="mt-3 text-gray-800">{post.message}</p>

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Tagged:{" "}
                  <span className="font-medium">
                    {post.recipients?.map((r) => r.name).join(", ")}
                  </span>
                </p>
              </div>
            </div>
          ))}

          {feed.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No shout-outs yet. Be the first 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
