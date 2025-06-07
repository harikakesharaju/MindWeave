import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Home.css'; // Keep your existing styles
import homePic from '../images/mindweaveHomePic.jpg'; // Import the image

const Home = () => {
    const navigate = useNavigate();
    const loggedInUser = localStorage.getItem('loggedInUser');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BASEURL = "http://localhost:9091";
    const POST_WIDTH = 450;
    const POST_HEIGHT = 220;

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

                const followingResponse = await fetch(`${BASEURL}/api/users/${loggedInUser}/following`);
                if (!followingResponse.ok) {
                    throw new Error(`Failed to fetch following: ${followingResponse.status}`);
                }
                const followingData = await followingResponse.json();

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
        return <div className="loading">Weaving your thoughts...</div>;
    }

    if (error) {
        return <div className="error">Failed to gather thoughts: {error}</div>;
    }

    return (
        <div className="home-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            minHeight: '100vh',
        }}>
            <div style={{
                width: '50%', // Occupy half of the screen width
                maxWidth: '600px', // Set a maximum width if needed
                marginBottom: '30px',
                borderRadius: '10px',
                overflow: 'hidden', // To contain the border-radius
                boxShadow: '2px 3px 3px rgba(124, 192, 237)',
            }}>
                <img src={homePic} alt="MindWeave Home" style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                }} />
            </div>
            <main className="home-main-content" style={{
                maxWidth: '1200px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {posts.length > 0 ? (
                    <div className="posts-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                        gap: '25px',
                        width: '100%',
                        marginBottom: '30px',
                    }}>
                        {posts.map(post => (
                            <div key={post.postId} className="post-card" style={{
                                width: POST_WIDTH,
                                height: POST_HEIGHT,
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 3px 3px rgba(144, 190, 249)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                overflow: 'hidden',
                                transition: 'transform 0.2s ease-in-out',
                            }}>
                                <div
                                    className="post-content"
                                    style={{
                                        fontFamily: post.fontStyle || 'Arial, sans-serif',
                                        color: post.textColor || '#333',
                                        backgroundColor: post.backgroundColor || 'transparent',
                                        fontSize: `${post.fontSize || 16}px`,
                                        padding: '15px',
                                        flexGrow: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {post.content}
                                </div>
                                <div className="post-footer" style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#f8f9fa',
                                    borderTop: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.85em',
                                    color: '#555',
                                }}>
                                    <Link to={`/profile/${post.userId}`} className="post-author" style={{
                                        color: '#007bff',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        transition: 'color 0.3s ease',
                                    }}>
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
                    <div className="no-posts" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        fontSize: '1.1em',
                        color: '#444',
                    }}>
                        No thoughts to weave yet from your network. Start following more minds!
                    </div>
                )}
            </main>
            <footer className="home-footer" style={{
                marginTop: '30px',
                color: '#6c757d',
                textAlign: 'center',
                padding: '15px 0',
                fontSize: '0.9em',
            }}>
                &copy; {new Date().getFullYear()} MindWeave
            </footer>
        </div>
    );
};

export default Home;