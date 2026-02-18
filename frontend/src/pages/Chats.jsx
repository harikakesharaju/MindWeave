import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASEURL = "http://localhost:9091";

const Chats = () => {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      if (!loggedInUser) return;

      try {
        const res = await fetch(
          `${BASEURL}/api/chats/user/${loggedInUser}/chats`
        );
        if (res.ok) {
          setChats(await res.json());
        }
      } catch (err) {
        console.error("Failed to load chats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [loggedInUser]);

  if (loading) {
    return (
      <div style={{ color: "#e5e7eb", padding: "2rem" }}>
        Loading chats...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(15,23,42,0.85)",
          borderRadius: "18px",
          padding: "1.5rem",
          boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
          border: "1px solid rgba(148,163,184,0.3)",
        }}
      >
        <h2
          style={{
            color: "#e5e7eb",
            marginBottom: "1.2rem",
            fontSize: "1.4rem",
            fontWeight: 600,
          }}
        >
          Chats
        </h2>

        {chats.length === 0 && (
          <p style={{ color: "#9ca3af" }}>No conversations yet</p>
        )}

        {chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => navigate(`/chat/${chat.otherUserId}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 14px",
              marginBottom: "10px",
              background:
                "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
              borderRadius: "14px",
              cursor: "pointer",
              border: "1px solid rgba(148,163,184,0.25)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.01)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
          {/* Avatar */}
<div
  style={{
    width: 44,
    height: 44,
    borderRadius: "999px",
    overflow: "hidden",
    background:
      "radial-gradient(circle at 30% 30%, #38bdf8, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <img
    src={`${BASEURL}/api/users/${chat.otherUserId}/profile-image`}
    alt={chat.otherUsername}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
    onError={(e) => {
      // fallback to initials if no image
      e.target.style.display = "none";
      e.target.parentElement.innerHTML =
        chat.otherUsername?.charAt(0)?.toUpperCase() || "?";
    }}
  />
</div>


            {/* Chat content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>
                  {chat.otherUsername}
                </span>
                {chat.lastMessageTime && (
                  <small style={{ color: "#94a3b8" }}>
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                )}
              </div>

              <div
                style={{
                  color: "#cbd5f5",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "95%",
                }}
              >
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>

            {/* Unread badge */}
            {chat.unreadCount > 0 && (
              <div
                style={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: "999px",
                  background: "#22c55e",
                  color: "#022c22",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(34,197,94,0.7)",
                }}
              >
                {chat.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chats;
