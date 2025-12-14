import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";


const BASEURL = "http://localhost:9091";

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

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]);

  // 1) Create/Get chat & load history
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
          profilePictureUrl: chatDto.otherProfilePictureUrl,
        });

        // load messages
        const msgRes = await fetch(
          `${BASEURL}/api/chats/${chatDto.chatId}/messages`
        );
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          setMessages(msgs);
        }
      }
    };

    initChat();
  }, [loggedInUser, otherUserId]);

  // 2) WebSocket connect once chatId is known
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
        if (evt.senderId != loggedInUser) {
          setOtherTyping(evt.typing);
        }
      });
    },
    onStompError: (frame) => {
      console.error("Broker error:", frame);
    },
  });

  client.activate();
  stompClient = client;

  return () => {
    if (client.active) {
      client.deactivate();
    }
  };
}, [chatId]);

useEffect(() => {
  if (!chatId || !loggedInUser) return;

  fetch(`${BASEURL}/api/chats/${chatId}/read`, {
    method: "POST",
    headers: { loggedInUserId: loggedInUser },
  }).then(()=>{
     window.dispatchEvent(new Event("chat-read"));
});
}, [chatId, loggedInUser]);



  // 3) Send message
  const sendMessage = () => {
    if (!input.trim() || !stompClient || !isConnected || !chatId) return;

    const payload = {
      chatId,
      senderId: Number(loggedInUser),
      content: input.trim(),
    };

    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload),
    });

    setInput("");
    sendTyping(false);
  };

  // 4) Typing indicator
  const sendTyping = (typing) => {
    if (!stompClient || !isConnected || !chatId) return;

    const payload = {
      chatId,
      senderId: Number(loggedInUser),
      typing,
    };
    stompClient.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify(payload),
    });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    // user started typing
    sendTyping(true);

    // clear old timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // send typing:false after 1.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!loggedInUser) {
    return <div style={{ padding: 20 }}>Please log in to use chat.</div>;
  }

  return (
    <div
      style={{
        height: "calc(100vh - 60px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "100%",
          maxHeight: "520px",
          background: "linear-gradient(135deg, #1f2937, #0f172a)",
          borderRadius: "18px",
          padding: "1rem 1.2rem",
          boxShadow: "0 15px 40px rgba(15,23,42,0.8)",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(148, 163, 184, 0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.75rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "999px",
              background:
                "radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.1rem",
              marginRight: "0.75rem",
            }}
          >
            {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <div
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {otherUser?.username || "User"}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: otherTyping ? "#22c55e" : "#9ca3af",
              }}
            >
              {otherTyping ? "Typing..." : "Direct message"}
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: isConnected ? "#22c55e" : "#f97316",
                backgroundColor: "rgba(15,23,42,0.8)",
                padding: "4px 8px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "999px",
                  backgroundColor: isConnected ? "#22c55e" : "#f97316",
                }}
              />
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.4rem",
            marginBottom: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                marginTop: "2rem",
                color: "#9ca3af",
                fontSize: "0.9rem",
              }}
            >
              No messages yet. Say hi 👋
            </div>
          )}

          {messages.map((m) => {
            const isMine = m.senderId?.toString() === loggedInUser?.toString();
            return (
              <div
                key={m.messageId}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "6px 10px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    whiteSpace: "pre-wrap",
                    background: isMine
                      ? "linear-gradient(135deg, #38bdf8, #0ea5e9)"
                      : "rgba(15,23,42,0.95)",
                    color: isMine ? "#0f172a" : "#e5e7eb",
                    border: isMine
                      ? "1px solid rgba(59,130,246,0.9)"
                      : "1px solid rgba(148,163,184,0.5)",
                    boxShadow: isMine
                      ? "0 4px 10px rgba(59,130,246,0.4)"
                      : "0 3px 8px rgba(15,23,42,0.8)",
                  }}
                >
                  <div style={{ marginBottom: "2px" }}>{m.content}</div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      textAlign: "right",
                      opacity: 0.8,
                    }}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message..."
            style={{
              flex: 1,
              resize: "none",
              padding: "0.55rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,0.85)",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              borderRadius: "999px",
              border: "none",
              padding: "0.5rem 0.95rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: input.trim() ? "pointer" : "not-allowed",
              background: input.trim()
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "rgba(75,85,99,0.8)",
              color: "white",
              boxShadow: input.trim()
                ? "0 4px 10px rgba(34,197,94,0.5)"
                : "none",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
