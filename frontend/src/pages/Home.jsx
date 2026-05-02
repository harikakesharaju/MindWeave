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
          throw new Error(`Failed to fetch following: ${followingResponse.status}`);
        }

        const followingData = await followingResponse.json();
        const allPosts = [];

        for (const followedUser of followingData) {
          const postsResponse = await fetch(
            `${BASEURL}/api/posts/user/${followedUser.userId}`,
            { headers: { loggedInUserId: loggedInUser } }
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
    return <div className="home-status loading">Weaving your thoughts…</div>;
  }

  if (error) {
    return <div className="home-status error">Failed to load feed: {error}</div>;
  }

  return (
    <div className="home-container">
      {/* Banner */}
      <div className="home-banner">
        <img src={homePic} alt="MindWeave" />
        <div className="home-banner-overlay">
          <span className="home-banner-label">Your Feed</span>
        </div>
      </div>

      {/* Feed */}
      <main className="home-main-content">
        {posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post.postId} post={post} />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <span className="no-posts-icon">🧵</span>
            <p className="no-posts-title">Your feed is empty</p>
            <p className="no-posts-sub">
              Follow more people to see their styled posts here.
            </p>
          </div>
        )}
      </main>

      <footer className="home-footer">
        &copy; {new Date().getFullYear()} MindWeave
      </footer>
    </div>
  );
};

export default Home;
