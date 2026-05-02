import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lightenColor, darkenColor } from "../UtilityMethods";
import "./PostCard.css";

const BASEURL = process.env.REACT_APP_BASE_URL || "http://localhost:9091";

const PostCard = ({ post, canDelete = false, onDelete = () => {} }) => {
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [likes, setLikes] = useState(post.likeCount || 0);
  const [dislikes, setDislikes] = useState(post.dislikeCount || 0);
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalUsers, setModalUsers] = useState([]);

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

  const gradient =
    post.backgroundMode === "dark"
      ? `linear-gradient(135deg, ${post.backgroundColor}, ${darkenColor(post.backgroundColor || "#f3f4f6", 40)})`
      : `linear-gradient(135deg, ${post.backgroundColor}, ${lightenColor(post.backgroundColor || "#f3f4f6", 40)})`;

  const formatDate = (ts) =>
    new Date(ts).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* ── Post card ── */}
      <div className="post-card" style={{ background: gradient }}>
        {post.heading && (
          <h3
            className="post-card-heading"
            style={{
              fontFamily: post.fontStyle || "Poppins, Arial",
              color: post.textColor || "#222",
            }}
          >
            {post.heading}
          </h3>
        )}

        <div
          className="post-card-body"
          style={{
            color: post.textColor || "#222",
            fontFamily: post.fontStyle || "Poppins, Arial",
          }}
        >
          {post.content}
        </div>

        {/* Reactions */}
        <div className="post-card-reactions">
          <div className="reaction-group">
            <button
              className={`reaction-btn${userReaction === "LIKE" ? " liked" : ""}`}
              onClick={() => handleReaction("LIKE")}
            >
              👍 {likes}
            </button>
            <button
              className="reaction-show-btn"
              onClick={() => fetchUsersList("LIKE")}
            >
              View all
            </button>
          </div>

          <div className="reaction-group">
            <button
              className={`reaction-btn${userReaction === "DISLIKE" ? " disliked" : ""}`}
              onClick={() => handleReaction("DISLIKE")}
            >
              👎 {dislikes}
            </button>
            <button
              className="reaction-show-btn"
              onClick={() => fetchUsersList("DISLIKE")}
            >
              View all
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="post-card-footer">
          <Link to={`/profile/${post.userId}`} className="post-author-link">
            @{post.username}
          </Link>
          <small className="post-timestamp">{formatDate(post.timestamp)}</small>
          {canDelete && (
            <button
              className="post-delete-btn"
              onClick={() => onDelete(post.postId)}
              title="Delete post"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* ── Reactions modal ── */}
      {showModal && (
        <div
          className="reaction-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="reaction-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reaction-modal-header">
              <span className="reaction-modal-title">
                {modalType === "LIKE" ? "👍 Liked by" : "👎 Disliked by"}
              </span>
              <button
                className="reaction-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="reaction-modal-body">
              {modalUsers.length > 0 ? (
                <ul className="reaction-user-list">
                  {modalUsers.map((u) => (
                    <li key={u.userId} className="reaction-user-item">
                      <Link
                        to={`/profile/${u.userId}`}
                        className="reaction-user-link"
                        onClick={() => setShowModal(false)}
                      >
                        {u.username}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="reaction-modal-empty">No reactions yet</p>
              )}
              <button
                className="reaction-modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
