import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useRoomStore } from "@/store/roomStore";

const ChatPanel = () => {
  const [msg, setMsg] = useState("");
  const { currentRoom, sendMessage, currentUser } = useRoomStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [currentRoom?.messages]);

  if (!currentRoom) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (msg.trim()) {
      sendMessage(msg.trim());
      setMsg("");
    }
  };

  return (
    <div className="glass-card flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <h3 className="text-sm font-display font-semibold text-foreground">Chat</h3>
        <span className="text-xs text-muted-foreground">
          {currentRoom.users.length} online
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {currentRoom.messages.map((m) => {
          const isMe = m.userId === "me";
          const isSystem = m.userId === "system";
          if (isSystem) {
            return (
              <div key={m.id} className="text-center">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {m.message}
                </span>
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-secondary-foreground rounded-bl-none"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold text-accent mb-0.5">{m.userName}</p>
                )}
                <p>{m.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm
            placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
        />
        <button type="submit" className="btn-neon px-3 py-2">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
