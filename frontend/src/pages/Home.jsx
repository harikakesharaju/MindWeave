import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import homePic from "../images/mindweaveHomePic.jpg";
import PostCard from "../components/PostCard";

const Home = () => {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const BASEURL = process.env.REACT_APP_BASE_URL || "http://localhost:9091";

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
      <div className="home-banner">
        <img src={homePic} alt="MindWeave Home" />
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
          <div className="no-posts">
            No thoughts to weave yet from your network. Start following more minds!
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
