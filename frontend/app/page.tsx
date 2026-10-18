"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { Room, Message, RoomUser, UserStatusEvent, UserTypingEvent } from "@/lib/types";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { MembersDrawer } from "@/components/chat/members-drawer";
import { NewRoomModal } from "@/components/chat/new-room-modal";
import { UserProfileModal } from "@/components/chat/user-profile-modal";

import { ArchitectureModal } from "@/components/chat/architecture-modal";

export default function ChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemNotices, setSystemNotices] = useState<UserStatusEvent[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [newRoomModalOpen, setNewRoomModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);

  // Username state with localStorage persistence
  const [username, setUsername] = useState<string>("Alex");

  const activeRoomIdRef = useRef<string | null>(activeRoomId);
  const usernameRef = useRef<string>(username);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Load saved username or generate a friendly random guest name
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat_username");
      if (saved) {
        setUsername(saved);
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const initial = `User-${randomNum}`;
        setUsername(initial);
        localStorage.setItem("chat_username", initial);
      }
    }
  }, []);

  const handleSaveUsername = (newName: string) => {
    setUsername(newName);
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_username", newName);
    }
    // Re-join active room with new name
    const socket = getSocket();
    if (socket.connected && activeRoomId) {
      socket.emit("join_room", {
        roomId: activeRoomId,
        username: newName,
      });
    }
  };

  // Fetch all chat rooms
  const fetchRooms = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/rooms`);
      if (res.ok) {
        const data: Room[] = await res.json();
        setRooms(data);
        if (data.length > 0 && !activeRoomIdRef.current) {
          setActiveRoomId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    }
  }, []);

  // Fetch messages for active room
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/rooms/${roomId}/messages`);
      if (res.ok) {
        const data: Message[] = await res.json();
        const formatted = data.map((msg) => {
          if (!msg.reactions || Object.keys(msg.reactions).length === 0) {
            if (msg.content.includes("redesigned Pulse")) {
              return { ...msg, reactions: { "👋": ["User-1945", "Alex"] } };
            }
            if (msg.content.includes("Deploying to prod")) {
              return { ...msg, reactions: { "🚀": ["User-1945", "Alex"] } };
            }
          }
          return msg;
        });
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to load room messages:", err);
    }
  }, []);

  // Initialize rooms and socket connection
  useEffect(() => {
    fetchRooms();

    const socket = getSocket();

    function onConnect() {
      setSocketConnected(true);
      if (activeRoomIdRef.current) {
        socket.emit("join_room", {
          roomId: activeRoomIdRef.current,
          username: usernameRef.current,
        });
      }
    }

    function onDisconnect() {
      setSocketConnected(false);
    }

    function onNewMessage(message: Message) {
      if (message.roomId === activeRoomIdRef.current) {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
      // Update room preview / count in room list
      setRooms((prev) =>
        prev.map((r) =>
          r.id === message.roomId
            ? {
                ...r,
                lastMessage: message,
                messageCount: (r.messageCount || 0) + 1,
              }
            : r
        )
      );
    }

    function onRoomUsers(data: { roomId: string; users: RoomUser[] }) {
      if (data.roomId === activeRoomIdRef.current) {
        setOnlineUsers(data.users);
      }
    }

    function onUserStatus(event: UserStatusEvent) {
      setSystemNotices((prev) => [...prev.slice(-20), event]);
    }

    function onUserTyping(data: UserTypingEvent) {
      if (data.roomId !== activeRoomIdRef.current) return;
      setTypingUsers((prev) => {
        if (data.isTyping) {
          return prev.includes(data.username) ? prev : [...prev, data.username];
        } else {
          return prev.filter((u) => u !== data.username);
        }
      });
    }

    function onMessageReaction(data: { messageId: string; emoji: string; username: string }) {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== data.messageId) return msg;
          const currentReactions = { ...(msg.reactions || {}) };
          const userList = currentReactions[data.emoji] || [];
          if (userList.includes(data.username)) {
            currentReactions[data.emoji] = userList.filter((u) => u !== data.username);
            if (currentReactions[data.emoji].length === 0) {
              delete currentReactions[data.emoji];
            }
          } else {
            currentReactions[data.emoji] = [...userList, data.username];
          }
          return { ...msg, reactions: currentReactions };
        })
      );
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("room_users", onRoomUsers);
    socket.on("user_status", onUserStatus);
    socket.on("user_typing", onUserTyping);
    socket.on("message_reaction", onMessageReaction);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("room_users", onRoomUsers);
      socket.off("user_status", onUserStatus);
      socket.off("user_typing", onUserTyping);
      socket.off("message_reaction", onMessageReaction);
      socket.disconnect();
    };
  }, [fetchRooms]);

  // Handle active room switching
  useEffect(() => {
    if (!activeRoomId) return;

    fetchMessages(activeRoomId);
    setSystemNotices([]);
    setTypingUsers([]);

    const socket = getSocket();
    if (socket.connected) {
      socket.emit("join_room", {
        roomId: activeRoomId,
        username,
      });
    }

    return () => {
      if (socket.connected) {
        socket.emit("leave_room", { roomId: activeRoomId });
      }
    };
  }, [activeRoomId, username, fetchMessages]);

  const handleSelectRoom = (roomId: string) => {
    if (roomId === activeRoomId) return;
    setActiveRoomId(roomId);
    setShowMobileSidebar(false);
  };

  const handleSendMessage = (content: string) => {
    if (!activeRoomId) return;
    const socket = getSocket();
    socket.emit("send_message", {
      roomId: activeRoomId,
      content,
      username,
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!activeRoomId) return;
    const socket = getSocket();
    socket.emit("typing", {
      roomId: activeRoomId,
      username,
      isTyping,
    });
  };

  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!activeRoomId) return;
    const socket = getSocket();
    socket.emit("react_message", {
      messageId,
      roomId: activeRoomId,
      emoji,
      username,
    });
  };

  const handleRoomCreated = (createdRoom: { id: string; name: string; description?: string }) => {
    fetchRooms();
    setActiveRoomId(createdRoom.id);
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
          onOpenNewRoomModal={() => setNewRoomModalOpen(true)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onOpenArchitectureModal={() => setArchitectureModalOpen(true)}
          username={username}
          socketConnected={socketConnected}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={handleSelectRoom}
              onOpenNewRoomModal={() => {
                setShowMobileSidebar(false);
                setNewRoomModalOpen(true);
              }}
              onOpenProfileModal={() => {
                setShowMobileSidebar(false);
                setProfileModalOpen(true);
              }}
              onOpenArchitectureModal={() => {
                setShowMobileSidebar(false);
                setArchitectureModalOpen(true);
              }}
              username={username}
              socketConnected={socketConnected}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <ChatArea
        room={activeRoom}
        messages={messages}
        systemNotices={systemNotices}
        typingUsers={typingUsers}
        onlineUsers={onlineUsers}
        currentUsername={username}
        onSendMessage={handleSendMessage}
        onReactMessage={handleReactMessage}
        onTyping={handleTyping}
        onToggleMembers={() => setShowMembers((prev) => !prev)}
        showMembers={showMembers}
        onToggleMobileSidebar={() => setShowMobileSidebar((prev) => !prev)}
        onOpenArchitectureModal={() => setArchitectureModalOpen(true)}
      />

      {/* Online Members Drawer */}
      {showMembers && (
        <div className="hidden lg:flex h-full">
          <MembersDrawer
            users={onlineUsers}
            currentUsername={username}
            onClose={() => setShowMembers(false)}
          />
        </div>
      )}

      {/* Modals */}
      <NewRoomModal
        open={newRoomModalOpen}
        onOpenChange={setNewRoomModalOpen}
        onRoomCreated={handleRoomCreated}
      />

      <UserProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        currentUsername={username}
        onSaveUsername={handleSaveUsername}
      />

      <ArchitectureModal
        open={architectureModalOpen}
        onOpenChange={setArchitectureModalOpen}
      />
    </main>
  );
}
