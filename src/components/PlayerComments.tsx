import { useState, useEffect } from "react";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  name: string;
  message: string;
  ts: number;
  avatar: string;
}

const AVATARS = ["🐱", "🐶", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵"];

interface Props {
  storageKey: string;
}

const PlayerComments = ({ storageKey }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState(() => localStorage.getItem("anicrew-username") || "");
  const [message, setMessage] = useState("");
  const [avatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  useEffect(() => {
    try {
      setComments(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch {
      setComments([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(comments));
  }, [comments, storageKey]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    localStorage.setItem("anicrew-username", name.trim());
    setComments((p) => [{ id: Date.now().toString(), name: name.trim(), message: message.trim(), ts: Date.now(), avatar }, ...p]);
    setMessage("");
  };

  const del = (id: string) => setComments((p) => p.filter((c) => c.id !== id));

  const ago = (ts: number) => {
    const d = Date.now() - ts;
    const m = Math.floor(d / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <section className="mt-6">
      <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        Comments
        <span className="text-xs text-muted-foreground font-normal">({comments.length})</span>
      </h3>

      <form onSubmit={submit} className="glass-card p-3 mb-4">
        <div className="flex gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0">{avatar}</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            maxLength={20}
            className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a public comment..."
            maxLength={300}
            rows={2}
            className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(e); }
            }}
          />
          <button type="submit" disabled={!name.trim() || !message.trim()} className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 shadow-neon">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-96 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="popLayout">
          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">Be the first to comment 🎉</div>
          )}
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-base shrink-0">{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{ago(c.ts)}</span>
                  </div>
                  <p className="text-sm leading-relaxed break-words">{c.message}</p>
                </div>
                <button onClick={() => del(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PlayerComments;
