import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getCachedProfileImage } from "../utils/profileImageCache";
import "./ChatPage.css";

const BASEURL = process.env.REACT_APP_BASE_URL || "http://localhost:9091";

let stompClient = null;

const ChatPage = () => {
  const { otherUserId } = useParams();
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [chatId, setChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const loadImage = async () => {
      if (!otherUser?.userId) return;
      const url = await getCachedProfileImage(otherUser.userId, BASEURL);
      setAvatarUrl(url);
    };
    loadImage();
  }, [otherUser]);

  // 1) Create/get chat & load history
  useEffect(() => {
    const initChat = async () => {
      if (!loggedInUser || !otherUserId) return;
      const res = await fetch(`${BASEURL}/api/chats/with/${otherUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          loggedInUserId: loggedInUser,
        },
      });
      if (res.ok) {
        const chatDto = await res.json();
        setChatId(chatDto.chatId);
        setOtherUser({
          userId: chatDto.otherUserId,
          username: chatDto.otherUsername,
        });
        const msgRes = await fetch(`${BASEURL}/api/chats/${chatDto.chatId}/messages`);
        if (msgRes.ok) setMessages(await msgRes.json());
      }
    };
    initChat();
  }, [loggedInUser, otherUserId]);

  // 2) WebSocket connect
  useEffect(() => {
    if (!chatId) return;
    const sock = new SockJS(`${BASEURL}/ws-chat`);
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/topic/chat/${chatId}`, (msg) => {
          setMessages((prev) => [...prev, JSON.parse(msg.body)]);
        });
        client.subscribe(`/topic/chat/${chatId}/typing`, (msg) => {
          const evt = JSON.parse(msg.body);
          if (evt.senderId !== loggedInUser) setOtherTyping(evt.typing);
        });
      },
      onStompError: (frame) => console.error("Broker error:", frame),
    });
    client.activate();
    stompClient = client;
    return () => { if (client.active) client.deactivate(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // 3) Mark as read
  useEffect(() => {
    if (!chatId || !loggedInUser) return;
    fetch(`${BASEURL}/api/chats/${chatId}/read`, {
      method: "POST",
      headers: { loggedInUserId: loggedInUser },
    }).then(() => window.dispatchEvent(new Event("chat-read")));
  }, [chatId, loggedInUser]);

  const sendMessage = () => {
    if (!input.trim() || !stompClient || !isConnected || !chatId) return;
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({
        chatId,
        senderId: Number(loggedInUser),
        content: input.trim(),
      }),
    });
    setInput("");
    sendTyping(false);
  };

  const sendTyping = (typing) => {
    if (!stompClient || !isConnected || !chatId) return;
    stompClient.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ chatId, senderId: Number(loggedInUser), typing }),
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!loggedInUser) {
    return <div className="chat-login-required">Please log in to use chat.</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-window">

        {/* ── Header ── */}
        <div className="chat-window-header">
          <div className="chat-other-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={otherUser?.username}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              otherUser?.username?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>

          <div className="chat-other-info">
            <div className="chat-other-name">{otherUser?.username || "Loading..."}</div>
            <div className={`chat-other-status ${otherTyping ? "typing" : "idle"}`}>
              {otherTyping ? "Typing..." : "Direct message"}
            </div>
          </div>

          <div className={`chat-connection-badge ${isConnected ? "connected" : "connecting"}`}>
            <span className={`chat-connection-dot ${isConnected ? "connected" : "connecting"}`} />
            {isConnected ? "Connected" : "Connecting..."}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-messages-empty">
              <span className="chat-messages-empty-icon">👋</span>
              <p className="chat-messages-empty-text">No messages yet. Say hi!</p>
            </div>
          )}

          {messages.map((m) => {
            const isMine = m.senderId?.toString() === loggedInUser?.toString();
            return (
              <div
                key={m.messageId}
                className={`message-row ${isMine ? "mine" : "theirs"}`}
              >
                <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                  <div className="message-text">{m.content}</div>
                  <div className="message-time">{formatTime(m.timestamp)}</div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className="chat-input-row">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message… (Enter to send)"
            className="chat-textarea"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`chat-send-btn ${input.trim() ? "active" : "inactive"}`}
            title="Send"
          >
            ➤
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
