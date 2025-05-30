import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const loggedInUser = localStorage.getItem('loggedInUser');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BASEURL = "http://localhost:9091";
    const POST_WIDTH = 400;
    const POST_HEIGHT = 200;

    const handleLogout = () => {
        localStorage.clear("loggedInUser");
        navigate('/auth');
    };

    useEffect(() => {
        const fetchFollowingAndTheirPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!loggedInUser) {
                    navigate('/auth');
                    return;
                }

                // 1. Get the list of users the logged-in user is following
                const followingResponse = await fetch(`${BASEURL}/api/users/${loggedInUser}/following`);
                if (!followingResponse.ok) {
                    throw new Error(`Failed to fetch following: ${followingResponse.status}`);
                }
                const followingData = await followingResponse.json();

                // 2. Fetch posts for each followed user
                const allPosts = [];
                for (const followedUser of followingData) {
                    const postsResponse = await fetch(`${BASEURL}/api/posts/user/${followedUser.userId}`);
                    if (postsResponse.ok) {
                        const postsData = await postsResponse.json();
                        allPosts.push(...postsData);
                    } else {
                        console.error(`Failed to fetch posts for user ${followedUser.userId}: ${postsResponse.status}`);
                    }
                }

                // 3. Sort all posts by timestamp in descending order
                const sortedPosts = allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setPosts(sortedPosts);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowingAndTheirPosts();
    }, [loggedInUser, navigate]);

    if (loading) {
        return <div className="loading">Loading thoughts...</div>;
    }

    if (error) {
        return <div className="error">Error loading thoughts: {error}</div>;
    }

    return (
        <div className="home-container">
            {/* <header className="home-header">
                <h1>MindWeave</h1>
                <button className="logout-button" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
            </header> */}
            <main className="home-main-content">
                {posts.length > 0 ? (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <div key={post.postId} className="post-card" style={{ width: POST_WIDTH, height: POST_HEIGHT }}>
                                <div
                                    className="post-content"
                                    style={{
                                        fontFamily: post.fontStyle,
                                        color: post.textColor,
                                        backgroundColor: post.backgroundColor,
                                        fontSize: `${post.fontSize}px`,
                                        width: '100%',
                                        height: 'calc(100% - 20px)',
                                        overflow: 'hidden',
                                        padding: '10px',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                    }}
                                >
                                    {post.content}
                                </div>
                                <div className="post-footer">
                                    <Link to={`/profile/${post.userId}`} className="post-author">
                                        {post.username}
                                    </Link>
                                    <small className="post-timestamp">
                                        {new Date(post.timestamp).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-posts">No thoughts to weave yet from your network. Start following more minds!</div>
                )}
            </main>
            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} MindWeave</p>
            </footer>
        </div>
    );
};

export default Home;