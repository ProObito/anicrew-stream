import { useState, useEffect } from "react";
import { Send, MessageCircle, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  name: string;
  message: string;
  timestamp: number;
  avatar: string;
}

const AVATARS = ["🐱", "🐶", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵"];
const STORAGE_KEY = "anicrew-comments";

const getStoredComments = (): Comment[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>(getStoredComments);
  const [name, setName] = useState(() => localStorage.getItem("anicrew-username") || "");
  const [message, setMessage] = useState("");
  const [avatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    localStorage.setItem("anicrew-username", name.trim());

    const newComment: Comment = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      timestamp: Date.now(),
      avatar,
    };

    setComments((prev) => [newComment, ...prev]);
    setMessage("");
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <section className="px-8 md:px-16 lg:px-24 mt-10 mb-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="section-title border-l-4 border-primary pl-4 mb-6 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-primary" />
          Community Chat
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="glass-card p-4 mb-6">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0">
              {avatar}
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              maxLength={20}
              className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-3 items-end">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts about anime..."
              maxLength={300}
              rows={2}
              className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!name.trim() || !message.trim()}
              className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-neon hover:brightness-110"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto hide-scrollbar">
          <AnimatePresence mode="popLayout">
            {comments.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-muted-foreground text-sm"
              >
                No comments yet. Be the first! 🎉
              </motion.div>
            )}
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-base shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(c.timestamp)}</span>
                    </div>
                    <p className="text-sm text-secondary-foreground leading-relaxed break-words">
                      {c.message}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default CommentSection;
