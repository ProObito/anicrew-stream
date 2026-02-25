import { create } from "zustand";
import type { Room, RoomUser, ChatMessage } from "@/types/anime";

const FAKE_USERS: RoomUser[] = [
  { id: "u1", name: "NarutoFan99", avatar: "🦊" },
  { id: "u2", name: "SakuraBlossom", avatar: "🌸" },
  { id: "u3", name: "GokuSSJ3", avatar: "⚡" },
  { id: "u4", name: "LuffyPirate", avatar: "🏴‍☠️" },
  { id: "u5", name: "ZeroTwoLove", avatar: "💗" },
];

const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

interface RoomStore {
  currentRoom: Room | null;
  currentUser: RoomUser;
  createRoom: (name: string) => string;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: () => void;
  sendMessage: (message: string) => void;
  setEpisode: (animeId: string, episodeId: string) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  currentRoom: null,
  currentUser: { id: "me", name: "You", avatar: "😎" },
  createRoom: (name) => {
    const roomId = generateRoomId();
    const fakeParticipants = FAKE_USERS.slice(
      0,
      Math.floor(Math.random() * 3) + 1
    );
    set({
      currentRoom: {
        id: roomId,
        name,
        animeId: null,
        currentEpisode: null,
        users: [get().currentUser, ...fakeParticipants],
        messages: [
          {
            id: "sys1",
            userId: "system",
            userName: "System",
            message: `Room "${name}" created! Share the code: ${roomId}`,
            timestamp: Date.now(),
          },
        ],
      },
    });
    return roomId;
  },
  joinRoom: (roomId) => {
    const fakeParticipants = FAKE_USERS.slice(
      0,
      Math.floor(Math.random() * 4) + 2
    );
    set({
      currentRoom: {
        id: roomId,
        name: `Room ${roomId}`,
        animeId: null,
        currentEpisode: null,
        users: [get().currentUser, ...fakeParticipants],
        messages: [
          {
            id: "sys1",
            userId: "system",
            userName: "System",
            message: `You joined room ${roomId}!`,
            timestamp: Date.now(),
          },
          {
            id: "msg1",
            userId: "u1",
            userName: fakeParticipants[0]?.name ?? "User",
            message: "Welcome! 🎉",
            timestamp: Date.now() - 5000,
          },
        ],
      },
    });
    return true;
  },
  leaveRoom: () => set({ currentRoom: null }),
  sendMessage: (message) => {
    const room = get().currentRoom;
    if (!room) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: "me",
      userName: "You",
      message,
      timestamp: Date.now(),
    };
    // Simulate a reply after a short delay
    const reply: ChatMessage = {
      id: (Date.now() + 1).toString(),
      userId: room.users[1]?.id ?? "u1",
      userName: room.users[1]?.name ?? "Bot",
      message: getRandomReply(),
      timestamp: Date.now() + 1500,
    };
    set({
      currentRoom: {
        ...room,
        messages: [...room.messages, newMsg],
      },
    });
    setTimeout(() => {
      const r = get().currentRoom;
      if (r)
        set({ currentRoom: { ...r, messages: [...r.messages, reply] } });
    }, 1500);
  },
  setEpisode: (animeId, episodeId) => {
    const room = get().currentRoom;
    if (!room) return;
    set({
      currentRoom: { ...room, animeId, currentEpisode: episodeId },
    });
  },
}));

function getRandomReply(): string {
  const replies = [
    "This episode is fire! 🔥",
    "No way!! 😱",
    "Best arc ever tbh",
    "The animation quality tho 👀",
    "Let's gooo!",
    "Haha that scene was hilarious 😂",
    "The OST hits different",
    "Main character built different 💪",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
