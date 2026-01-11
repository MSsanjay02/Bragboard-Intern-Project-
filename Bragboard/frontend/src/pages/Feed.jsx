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

  // Phase 4 state
  const [reactionCounts, setReactionCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});

  const loadUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const loadFeed = async () => {
    const res = await API.get("/shoutouts");
    setFeed(res.data);
    return res.data;
  };

  const loadReactionsForPost = async (postId) => {
    const res = await API.get(`/shoutouts/${postId}/reactions`);
    setReactionCounts((prev) => ({ ...prev, [postId]: res.data }));
  };

  const loadCommentsForPost = async (postId) => {
    const res = await API.get(`/shoutouts/${postId}/comments`);
    setComments((prev) => ({ ...prev, [postId]: res.data }));
  };

  const refreshTimeline = async () => {
    const posts = await loadFeed();
    for (const post of posts) {
      loadReactionsForPost(post.id);
      loadCommentsForPost(post.id);
    }
  };

  useEffect(() => {
    (async () => {
      await loadUsers();
      await refreshTimeline();
    })();
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
      await refreshTimeline();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to post shout-out");
    } finally {
      setLoading(false);
    }
  };

  const reactToPost = async (postId, reactionType) => {
    try {
      await API.post(`/shoutouts/${postId}/react`, {
        reaction_type: reactionType,
      });
      loadReactionsForPost(postId);
    } catch (err) {
      alert(err?.response?.data?.detail || "Reaction failed");
    }
  };

  const submitComment = async (postId) => {
    const text = commentInput[postId] || "";
    if (!text.trim()) return;

    try {
      await API.post(`/shoutouts/${postId}/comments`, { content: text });
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      loadCommentsForPost(postId);
    } catch (err) {
      alert(err?.response?.data?.detail || "Comment failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const selectedRecipients = users.filter((u) => recipientIds.includes(u.id));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ✅ Navbar */}
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow" />
            <div>
              <h1 className="text-xl font-bold leading-tight">BragBoard</h1>
              <p className="text-xs text-zinc-400">
                Celebrate wins. Build culture.
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ✅ Layout */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: composer */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm p-5">
            <h2 className="text-lg font-semibold">Send a shout-out 🎉</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Appreciate teammates publicly to boost morale.
            </p>

            <form onSubmit={submitShoutout} className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-zinc-300">Message</label>
                <textarea
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-sm outline-none focus:border-indigo-500"
                  rows={4}
                  placeholder="Write something meaningful…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-300">Tag recipients</label>
                  <span className="text-xs text-zinc-400">
                    {recipientIds.length} selected
                  </span>
                </div>

                <div className="mt-2 max-h-44 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 space-y-2">
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={recipientIds.includes(u.id)}
                        onChange={() => toggleRecipient(u.id)}
                        className="h-4 w-4"
                      />
                      <span className="font-medium">{u.name}</span>
                      <span className="text-xs text-zinc-400">
                        ({u.department})
                      </span>
                    </label>
                  ))}
                </div>

                {/* Selected recipients as badges */}
                {selectedRecipients.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedRecipients.map((u) => (
                      <span
                        key={u.id}
                        className="px-3 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700"
                      >
                        {u.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Shout-out"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: feed */}
        <div className="lg:col-span-8 space-y-4">
          {feed.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
              No shout-outs yet. Be the first one 🎉
            </div>
          ) : (
            feed.map((post) => {
              const counts = reactionCounts[post.id] || {
                like: 0,
                clap: 0,
                star: 0,
              };
              const postComments = comments[post.id] || [];

              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700" />
                      <div>
                        <p className="font-semibold">
                          {post.sender.name}{" "}
                          <span className="text-xs text-zinc-400 font-normal">
                            ({post.sender.department})
                          </span>
                        </p>
                        <p className="text-xs text-zinc-500">
                          {post.created_at
                            ? new Date(post.created_at).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="mt-4 text-zinc-100 leading-relaxed">
                    {post.message}
                  </p>

                  {/* Recipients */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.recipients?.map((r) => (
                      <span
                        key={r.id}
                        className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-200"
                      >
                        @{r.name}
                      </span>
                    ))}
                  </div>

                  {/* Reactions */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ReactionButton
                      label="❤️ Like"
                      count={counts.like}
                      onClick={() => reactToPost(post.id, "like")}
                    />
                    <ReactionButton
                      label="👏 Clap"
                      count={counts.clap}
                      onClick={() => reactToPost(post.id, "clap")}
                    />
                    <ReactionButton
                      label="⭐ Star"
                      count={counts.star}
                      onClick={() => reactToPost(post.id, "star")}
                    />
                  </div>

                  {/* Comments */}
                  <div className="mt-6 border-t border-zinc-800 pt-4">
                    <p className="text-sm font-semibold text-zinc-200">
                      Comments{" "}
                      <span className="text-xs text-zinc-500 font-normal">
                        ({postComments.length})
                      </span>
                    </p>

                    <div className="mt-3 flex gap-2">
                      <input
                        className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-2 text-sm outline-none focus:border-indigo-500"
                        placeholder="Write a comment..."
                        value={commentInput[post.id] || ""}
                        onChange={(e) =>
                          setCommentInput((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-900 font-semibold hover:bg-white transition"
                      >
                        Post
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {postComments.length === 0 ? (
                        <p className="text-sm text-zinc-500">No comments yet.</p>
                      ) : (
                        postComments.map((c) => (
                          <div
                            key={c.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-3"
                          >
                            <p className="text-sm">
                              <span className="font-semibold">{c.user.name}</span>{" "}
                              <span className="text-xs text-zinc-500">
                                ({c.user.department})
                              </span>
                            </p>
                            <p className="text-sm text-zinc-200 mt-1">
                              {c.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* Small UI component */
function ReactionButton({ label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-800/40 transition text-sm font-medium"
    >
      {label}{" "}
      <span className="ml-1 text-xs text-zinc-400">
        {count}
      </span>
    </button>
  );
}
