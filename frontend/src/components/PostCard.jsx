import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lightenColor, darkenColor } from "../UtilityMethods";

const BASEURL = "http://localhost:9091";

const PostCard = ({ post, canDelete = false, onDelete = () => {} }) => {
  const loggedInUser = localStorage.getItem("loggedInUser");

  // Local state, initialized from props
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [dislikes, setDislikes] = useState(post.dislikeCount || 0);
  const [userReaction, setUserReaction] = useState(post.userReaction || null);

  // Helper: fetch the latest data for this post from backend
  const refreshPost = async () => {
    if (!loggedInUser) return;

    try {
      const res = await fetch(`${BASEURL}/api/posts/${post.postId}`, {
        headers: {
          loggedInUserId: loggedInUser,
        },
      });

      if (res.ok) {
        const updated = await res.json();
        setLikes(updated.likeCount || 0);
        setDislikes(updated.dislikeCount || 0);
        setUserReaction(updated.userReaction || null);
      } else {
        console.error("Failed to refresh post", res.status);
      }
    } catch (err) {
      console.error("Error refreshing post:", err);
    }
  };

  // On mount or when postId/loggedInUser changes, sync once from backend
  useEffect(() => {
    refreshPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postId, loggedInUser]);

  const handleReaction = async (type) => {
    if (!loggedInUser) return;

    try {
      // If clicking the same reaction -> remove it
      if (userReaction === type) {
        await fetch(
          `${BASEURL}/api/posts/${post.postId}/react/${loggedInUser}`,
          { method: "DELETE" }
        );
      } else {
        // Otherwise apply/replace reaction
        await fetch(
          `${BASEURL}/api/posts/${post.postId}/react/${loggedInUser}/${type}`,
          { method: "POST" }
        );
      }

      // After backend updates, fetch latest like/dislike counts
      await refreshPost();
    } catch (e) {
      console.error("Reaction error:", e);
    }
  };

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
    <div
      className="post-card"
      style={{
        width: 450,
        height: 220,
        background: gradient,
        borderRadius: "10px",
        boxShadow: "0 3px 3px rgba(144,190,249)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* Heading */}
      {post.heading && (
        <h3
          style={{
            fontFamily: post.fontStyle || "Arial, sans-serif",
            color: post.textColor || "#333",
            fontSize: "20",
            fontWeight: "bold",
            padding: "8px 10px",
            textAlign: "center",
          }}
        >
          {post.heading}
        </h3>
      )}

      {/* Content */}
      <div
        style={{
          padding: "10px 12px",
          flexGrow: 1,
          color: post.textColor || "#333",
          fontFamily: post.fontStyle || "Arial, sans-serif",
          fontSize: "16",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "pre-wrap",
        }}
      >
        {post.content}
      </div>

      {/* Reactions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "6px 10px",
          backgroundColor: "rgba(255,255,255,0.3)",
          backdropFilter: "blur(4px)",
          fontSize: "0.95rem",
        }}
      >
        {/* LIKE */}
        <div
          onClick={() => handleReaction("LIKE")}
          style={{
            cursor: "pointer",
            color: userReaction === "LIKE" ? "green" : "#444",
            fontWeight: userReaction === "LIKE" ? "bold" : "normal",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>👍</span>
          <span>{likes}</span>
        </div>

        {/* DISLIKE */}
        <div
          onClick={() => handleReaction("DISLIKE")}
          style={{
            cursor: "pointer",
            color: userReaction === "DISLIKE" ? "red" : "#444",
            fontWeight: userReaction === "DISLIKE" ? "bold" : "normal",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>👎</span>
          <span>{dislikes}</span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="post-footer"
        style={{
          padding: "8px 12px",
          backgroundColor: "rgba(255,255,255,0.6)",
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "#555",
        }}
      >
        <Link
          to={`/profile/${post.userId}`}
          style={{
            color: "#007bff",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          {post.username}
        </Link>
        <small>{new Date(post.timestamp).toLocaleString()}</small>
        {canDelete && (
          <button
            onClick={() => onDelete(post.postId)}
            style={{
              marginLeft: "10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "1rem",
              color: "red",
            }}
            title="Delete Post"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
