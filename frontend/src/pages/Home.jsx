import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "./Home.css";
import homePic from "../images/mindweaveHomePic.jpg";
import { lightenColor, darkenColor } from "../UtilityMethods"; // ⭐ Added
import PostCard from "../components/PostCard";

const Home = () => {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const BASEURL = "https://mindweave-production-f1b6.up.railway.app";
  const POST_WIDTH = 450;
  const POST_HEIGHT = 220;

  const handleLogout = () => {
    localStorage.clear("loggedInUser");
    navigate("/auth");
  };

  useEffect(() => {
    const fetchFollowingAndTheirPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!loggedInUser) {
          navigate("/auth");
          return;
        }

        const followingResponse = await fetch(
          `${BASEURL}/api/users/${loggedInUser}/following`
        );
        if (!followingResponse.ok) {
          throw new Error(
            `Failed to fetch following: ${followingResponse.status}`
          );
        }

        const followingData = await followingResponse.json();

        const allPosts = [];
        for (const followedUser of followingData) {
          const postsResponse = await fetch(
            `${BASEURL}/api/posts/user/${followedUser.userId}`,
            {
              headers: {
                loggedInUserId: loggedInUser,
              },
            }
          );
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            allPosts.push(...postsData);
          }
        }

        allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPosts([...allPosts]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingAndTheirPosts();
  }, [loggedInUser, navigate]);

  if (loading) {
    return <div className="loading">Weaving your thoughts...</div>;
  }

  if (error) {
    return <div className="error">Failed to gather thoughts: {error}</div>;
  }

  const handleReaction = async (postId, type, currentReaction) => {
    if (!loggedInUser) return;

    try {
      // If clicking same reaction → remove it
      if (currentReaction === type) {
        await fetch(`${BASEURL}/api/posts/${postId}/react/${loggedInUser}`, {
          method: "DELETE",
        });
      } else {
        // Otherwise apply new reaction
        await fetch(
          `${BASEURL}/api/posts/${postId}/react/${loggedInUser}/${type}`,
          { method: "POST" }
        );
      }

      // Refresh posts after reaction
      setPosts((prev) =>
        prev.map((p) => {
          if (p.postId !== postId) return p;

          // Update UI counts
          let likes = p.likesCount || 0;
          let dislikes = p.dislikesCount || 0;

          if (currentReaction === type) {
            // removing reaction
            if (type === "LIKE") likes--;
            else dislikes--;
            return {
              ...p,
              likesCount: likes,
              dislikesCount: dislikes,
              userReaction: null,
            };
          }

          // switching reaction or adding new one
          if (type === "LIKE") {
            likes++;
            if (currentReaction === "DISLIKE") dislikes--;
          } else {
            dislikes++;
            if (currentReaction === "LIKE") likes--;
          }

          return {
            ...p,
            likesCount: likes,
            dislikesCount: dislikes,
            userReaction: type,
          };
        })
      );
    } catch (error) {
      console.error("Reaction error:", error);
    }
  };

  return (
    <div
      className="home-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      {/* TOP IMAGE */}
      <div
        style={{
          width: "50%",
          maxWidth: "600px",
          marginBottom: "30px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "2px 3px 3px rgba(124, 192, 237)",
        }}
      >
        <img
          src={homePic}
          alt="MindWeave Home"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        />
      </div>

      {/* MAIN CONTENT */}
      <main
        className="home-main-content"
        style={{
          maxWidth: "1200px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {posts.length > 0 ? (
          <div
            className="posts-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
              gap: "25px",
              width: "100%",
              marginBottom: "30px",
            }}
          >
            {posts.map((post) => (
              <PostCard key={post.postId} post={post} />
            ))}
          </div>
        ) : (
          <div
            className="no-posts"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              fontSize: "1.1em",
              color: "#444",
            }}
          >
            No thoughts to weave yet from your network. Start following more
            minds!
          </div>
        )}
      </main>

      <footer
        className="home-footer"
        style={{
          marginTop: "30px",
          color: "#6c757d",
          textAlign: "center",
          padding: "15px 0",
          fontSize: "0.9em",
        }}
      >
        &copy; {new Date().getFullYear()} MindWeave
      </footer>
    </div>
  );
};

export default Home;
