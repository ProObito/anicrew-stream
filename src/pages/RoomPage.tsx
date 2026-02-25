import { useState } from "react";
import { Users, Copy, LogOut, Plus, ArrowRight } from "lucide-react";
import { useRoomStore } from "@/store/roomStore";
import ChatPanel from "@/components/ChatPanel";

const RoomPage = () => {
  const { currentRoom, createRoom, joinRoom, leaveRoom } = useRoomStore();
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (roomName.trim()) {
      createRoom(roomName.trim());
      setRoomName("");
    }
  };

  const handleJoin = () => {
    if (joinId.trim()) {
      joinRoom(joinId.trim().toUpperCase());
      setJoinId("");
    }
  };

  const copyInvite = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentRoom) {
    return (
      <div className="pt-20 pb-10 container mx-auto px-4 max-w-lg">
        <h1 className="text-3xl font-display font-bold gradient-text mb-8 flex items-center gap-3 justify-center">
          <Users className="w-8 h-8 text-primary" /> Watch Party
        </h1>

        <div className="glass-card p-6 mb-6 space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground">Create a Room</h2>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name..."
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
          />
          <button onClick={handleCreate} className="btn-neon w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground">Join a Room</h2>
          <input
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Enter room code..."
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground uppercase
              placeholder:text-muted-foreground placeholder:normal-case focus:outline-none focus:border-primary/50 transition-all"
            maxLength={6}
          />
          <button onClick={handleJoin} className="btn-accent w-full flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" /> Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-10 container mx-auto px-4">
      {/* Room Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">{currentRoom.name}</h1>
          <p className="text-sm text-muted-foreground">
            Room Code: <span className="text-accent font-mono font-bold">{currentRoom.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyInvite} className="btn-glass text-sm flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Code"}
          </button>
          <button onClick={leaveRoom} className="btn-glass text-sm flex items-center gap-1.5 hover:border-destructive/40">
            <LogOut className="w-3.5 h-3.5" /> Leave
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full aspect-video glass-card flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Select an anime from the browse page to watch together!
            </p>
          </div>

          {/* Users */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-display font-semibold text-foreground mb-3">
              Participants ({currentRoom.users.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {currentRoom.users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary"
                >
                  <span className="text-base">{u.avatar}</span>
                  <span className="text-sm text-foreground font-medium">{u.name}</span>
                  {u.id === "me" && (
                    <span className="text-[10px] text-primary font-bold">(You)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="h-[500px] lg:h-auto">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
