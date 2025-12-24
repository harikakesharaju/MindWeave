import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lightenColor, darkenColor } from "../UtilityMethods";

const BASEURL = "https://mindweave-production-f1b6.up.railway.app";

const PostCard = ({ post, canDelete = false, onDelete = () => {} }) => {
  const loggedInUser = localStorage.getItem("loggedInUser");

  // Main reaction states
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [dislikes, setDislikes] = useState(post.dislikeCount || 0);
  const [userReaction, setUserReaction] = useState(post.userReaction || null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // LIKE / DISLIKE
  const [modalUsers, setModalUsers] = useState([]);

  // Fetch updated post info (reaction counts + user reaction)
  const refreshPost = async () => {
    if (!loggedInUser) return;

    try {
      const res = await fetch(`${BASEURL}/api/posts/${post.postId}`, {
        headers: { loggedInUserId: loggedInUser },
      });

      if (res.ok) {
        const updated = await res.json();
        setLikes(updated.likeCount || 0);
        setDislikes(updated.dislikeCount || 0);
        setUserReaction(updated.userReaction || null);
      }
    } catch (err) {
      console.error("Error refreshing post:", err);
    }
  };

  useEffect(() => {
    refreshPost();
  }, [post.postId, loggedInUser]);

  // Fetch users list for modal
  const fetchUsersList = async (type) => {
    try {
      const res = await fetch(`${BASEURL}/api/posts/${post.postId}/reactions`);
      const json = await res.json();

      setModalType(type);
      setModalUsers(type === "LIKE" ? json.LIKE || [] : json.DISLIKE || []);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading reactions modal:", err);
    }
  };

  // Like/dislike toggle logic
  const handleReaction = async (type) => {
    if (!loggedInUser) return;

    try {
      if (userReaction === type) {
        await fetch(`${BASEURL}/api/posts/${post.postId}/react/${loggedInUser}`, {
          method: "DELETE",
        });
      } else {
        await fetch(
          `${BASEURL}/api/posts/${post.postId}/react/${loggedInUser}/${type}`,
          { method: "POST" }
        );
      }

      await refreshPost();
    } catch (error) {
      console.error("Reaction error:", error);
    }
  };

  // Background gradient
  const gradient =
    post.backgroundMode === "dark"
      ? `linear-gradient(135deg, ${post.backgroundColor}, ${darkenColor(
          post.backgroundColor || "#f3f4f6",
          40
        )})`
      : `linear-gradient(135deg, ${post.backgroundColor}, ${lightenColor(
          post.backgroundColor || "#f3f4f6",
          40
        )})`;

  return (
    <>
      {/* ------------------ POST CARD ------------------ */}
      <div
        className="post-card"
        style={{
          width: 470,
          background: gradient,
          borderRadius: "18px",
          paddingBottom: "6px",
          boxShadow: "0 8px 22px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 22px rgba(0,0,0,0.15)";
        }}
      >
        {/* Heading */}
        {post.heading && (
          <h3
            style={{
              fontFamily: post.fontStyle || "Poppins, Arial",
              color: post.textColor || "#222",
              fontSize: "22px",
              fontWeight: "600",
              padding: "14px 12px 4px 12px",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            {post.heading}
          </h3>
        )}

        {/* Content */}
        <div
          style={{
            padding: "12px 16px",
            flexGrow: 1,
            color: post.textColor || "#222",
            fontFamily: post.fontStyle || "Poppins, Arial",
            fontSize: "17px",
            textAlign: "center",
            whiteSpace: "pre-wrap",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "1.4",
          }}
        >
          {post.content}
        </div>

        {/* Reaction Section */}
        <div
          style={{
            padding: "7px",
            display: "flex",
            justifyContent: "space-evenly",
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(6px)",
            borderTop: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          {/* LIKE */}
          <div style={{ textAlign: "center" }}>
            <div
              onClick={() => handleReaction("LIKE")}
              style={{
                cursor: "pointer",
                color: userReaction === "LIKE" ? "green" : "#333",
                background:
                  userReaction === "LIKE"
                    ? "rgba(0,128,0,0.15)"
                    : "rgba(255,255,255,0.5)",
                padding: "1px 9px",
                borderRadius: "30px",
                fontWeight: "500",
                transition: "0.2s ease",
              }}
            >
              👍 {likes}
            </div>

            <span
              onClick={() => fetchUsersList("LIKE")}
              style={{
                cursor: "pointer",
                fontSize: "8px",
                color: "#133f81ff",
                fontWeight: "500",
              }}
            >
              Show
            </span>
          </div>

          {/* DISLIKE */}
          <div style={{ textAlign: "center" }}>
            <div
              onClick={() => handleReaction("DISLIKE")}
              style={{
                cursor: "pointer",
                color: userReaction === "DISLIKE" ? "red" : "#333",
                background:
                  userReaction === "DISLIKE"
                    ? "rgba(255,0,0,0.15)"
                    : "rgba(255,255,255,0.5)",
                padding: "1px 9px",
                borderRadius: "30px",
                fontWeight: "500",
                transition: "0.2s ease",
              }}
            >
              👎 {dislikes}
            </div>

            <span
              onClick={() => fetchUsersList("DISLIKE")}
              style={{
                cursor: "pointer",
                fontSize: "8px",
                color: "#0e3b7dff",
                fontWeight: "500",
              }}
            >
              Show
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 15px",
            background: "rgba(255,255,255,0.55)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.85rem",
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Link
            to={`/profile/${post.userId}`}
            style={{
              fontWeight: "600",
              color: "#0056d6",
              textDecoration: "none",
            }}
          >
            {post.username}
          </Link>

          <small style={{ opacity: 0.7 }}>
            {new Date(post.timestamp).toLocaleString()}
          </small>

          {canDelete && (
            <button
              onClick={() => onDelete(post.postId)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "crimson",
                fontSize: "1.2rem",
              }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* ------------------ MODAL ------------------ */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "340px",
              background: "#fff",
              borderRadius: "14px",
              padding: "18px",
              boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
              animation: "fadeIn 0.25s ease",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              {modalType === "LIKE" ? "Liked By" : "Disliked By"}
            </h3>

            <ul style={{ padding: 0, listStyle: "none" }}>
              {modalUsers.length > 0 ? (
                modalUsers.map((u) => (
                  <li
                    key={u.userId}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Link
                      to={`/profile/${u.userId}`}
                      style={{
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "#0056d6",
                      }}
                    >
                      {u.username}
                    </Link>
                  </li>
                ))
              ) : (
                <p style={{ textAlign: "center", opacity: 0.7 }}>
                  No users yet
                </p>
              )}
            </ul>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "#0056d6",
                color: "#fff",
                border: "none",
                fontSize: "15px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
