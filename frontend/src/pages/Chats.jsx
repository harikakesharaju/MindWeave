import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCachedProfileImage } from "../utils/profileImageCache";
import "./Chats.css";

const BASEURL = process.env.REACT_APP_BASE_URL || "http://localhost:9091";

const Chats = () => {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImages, setProfileImages] = useState({});

  useEffect(() => {
    const fetchChats = async () => {
      if (!loggedInUser) return;
      try {
        const res = await fetch(`${BASEURL}/api/chats/user/${loggedInUser}/chats`);
        if (res.ok) setChats(await res.json());
      } catch (err) {
        console.error("Failed to load chats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  useEffect(() => {
    const loadImages = async () => {
      const updated = { ...profileImages };
      for (const chat of chats) {
        if (!updated[chat.otherUserId]) {
          const img = await getCachedProfileImage(chat.otherUserId, BASEURL);
          if (img) updated[chat.otherUserId] = img;
        }
      }
      setProfileImages(updated);
    };
    if (chats.length > 0) loadImages();
  }, [chats]);

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="chats-page">
      <div className="chats-container">
        {/* Header */}
        <div className="chats-header">
          <div className="chats-header-left">
            <div className="chats-title">
              <span className="chats-title-icon">💬</span>
              Messages
            </div>
            <div className="chats-subtitle">
              {loading ? "Loading..." : `${chats.length} conversation${chats.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="chats-loading">Loading conversations...</div>
        ) : chats.length === 0 ? (
          <div className="chats-empty">
            <span className="chats-empty-icon">💬</span>
            <p className="chats-empty-title">No conversations yet</p>
            <p className="chats-empty-sub">Visit someone's profile and hit Message to start chatting.</p>
          </div>
        ) : (
          <div className="chats-list">
            {chats.map((chat) => (
              <div
                key={chat.chatId}
                className="chat-item"
                onClick={() => navigate(`/chat/${chat.otherUserId}`)}
              >
                {/* Avatar */}
                <div className="chat-avatar">
                  {profileImages[chat.otherUserId] ? (
                    <img
                      src={profileImages[chat.otherUserId]}
                      alt={chat.otherUsername}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    chat.otherUsername?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>

                {/* Info */}
                <div className="chat-info">
                  <div className="chat-info-top">
                    <span className="chat-username">{chat.otherUsername}</span>
                    {chat.lastMessageTime && (
                      <span className="chat-time">{formatTime(chat.lastMessageTime)}</span>
                    )}
                  </div>
                  <div className="chat-last-message">
                    {chat.lastMessage || "No messages yet"}
                  </div>
                </div>

                {/* Unread */}
                {chat.unreadCount > 0 && (
                  <div className="chat-unread-badge">{chat.unreadCount}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
