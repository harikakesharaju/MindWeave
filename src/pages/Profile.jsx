import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.css';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
    const { userId: profileId } = useParams();
    const navigate = useNavigate();
    const loggedInUser = localStorage.getItem('loggedInUser');
    const [profile, setProfile] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const BASEURL = "http://localhost:9091";

    // State for the edit profile modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        description: '',
        profilePictureUrl: '',
        // Add other editable fields as needed
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Profile
                const profileResponse = await fetch(`${BASEURL}/api/users/${profileId}`);
                if (!profileResponse.ok) {
                    throw new Error(`HTTP error! status: ${profileResponse.status}`);
                }
                const profileData = await profileResponse.json();
                setProfile(profileData);

                // Fetch Followers
                const followersResponse = await fetch(`${BASEURL}/api/users/${profileId}/followers`);
                if (followersResponse.ok) {
                    const followersData = await followersResponse.json();
                    setFollowers(followersData);
                }

                // Fetch Following
                const followingResponse = await fetch(`${BASEURL}/api/users/${profileId}/following`);
                if (followingResponse.ok) {
                    const followingData = await followingResponse.json();
                    setFollowing(followingData);
                }

                // Fetch User's Posts
                const postsResponse = await fetch(`${BASEURL}/api/posts/user/${profileId}`);
                if (postsResponse.ok) {
                    const postsData = await postsResponse.json();
                    setPosts(postsData);
                }

                // Check if the logged-in user is following the viewed profile
                if (loggedInUser && profileData && profileData.followers && profileData.followers.includes(parseInt(loggedInUser, 10))) {
                    setIsFollowing(true);
                } else if (loggedInUser === profileId) {
                    setIsFollowing(true); // User always sees their own posts
                } else {
                    setIsFollowing(false);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [profileId, loggedInUser]);

    const openEditModal = async () => {
        if (profile) {
            setEditFormData({
                username: profile.username || '',
                email: profile.email || '',
                description: profile.description || '',
                profilePictureUrl: profile.profilePictureUrl || '',
                // Populate other fields
            });
            setIsEditModalOpen(true);
        } else {
            console.warn("Profile data not loaded yet.");
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASEURL}/api/users/${profileId}`, {
                method: 'PUT', // Or PATCH
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });

            if (response.ok) {
                console.log('Profile updated successfully');
                // Optionally refetch profile data to update the UI
                const updatedProfileResponse = await fetch(`${BASEURL}/api/users/${profileId}`);
                if (updatedProfileResponse.ok) {
                    const updatedProfileData = await updatedProfileResponse.json();
                    setProfile(updatedProfileData);
                }
                closeEditModal();
            } else {
                console.error('Error updating profile');
                const errorData = await response.json();
                console.error(errorData);
                // Handle error display to the user
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div>Error loading profile: {error}</div>;
    }

    if (!profile) {
        return <div>Profile not found.</div>;
    }

    const isOwnProfile = loggedInUser === profileId;
    const canSeePosts = isOwnProfile || isFollowing;

    const handleFollowRequest = async () => {
        if (!loggedInUser) {
            navigate('/auth');
            return;
        }
        try {
            const response = await fetch(
                `${BASEURL}/api/users/friend-request/send?senderId=${loggedInUser}&receiverId=${profileId}`,
                {
                    method: 'POST',
                }
            );
            if (response.ok) {
                console.log('Friend request sent!');
                // Optionally update UI
            } else {
                console.error('Failed to send friend request:', response);
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    return (
        <>
        {/* <Header></Header> */}
      
        <div className="profile-container">
            
            <div className="profile-header">
                <div className="profile-picture">
                    {profile.profilePictureUrl ? (
                        <img src={profile.profilePictureUrl} alt={profile.username} />
                    ) : (
                        <FontAwesomeIcon icon={faUser} size="3x" />
                    )}
                </div>
                <div className="profile-info">
                    <h1>{profile.username}</h1>
                    <p className="email">{profile.email}</p>
                    {profile.description && <p className="description">{profile.description}</p>}
                    {!isOwnProfile && !isFollowing && loggedInUser && (
                        <button className="follow-button" onClick={handleFollowRequest}>
                            Send Request
                        </button>
                    )}
                    {isOwnProfile && (
                        <button className="edit-profile-button" onClick={openEditModal}>
                            <FontAwesomeIcon icon={faEdit} /> Edit Profile
                        </button>
                    )}
                    <div className="follow-stats">
                        <div className="followers">
                            <span>{followers.length}</span> Followers
                        </div>
                        <div className="following">
                            <span>{following.length}</span> Following
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
           {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Edit Your Profile</h2>
                        <form onSubmit={handleUpdateProfile}>
                            <div>
                                <label htmlFor="username">Username:</label>
                                <input type="text" id="username" name="username" value={editFormData.username} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" value={editFormData.email} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="description">Description:</label>
                                <textarea id="description" name="description" value={editFormData.description} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="profilePictureUrl">Profile Picture URL:</label>
                                <input type="text" id="profilePictureUrl" name="profilePictureUrl" value={editFormData.profilePictureUrl} onChange={handleChange} />
                            </div>
                            {/* Add more input fields as needed */}
                            <div className="modal-actions">
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={closeEditModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="profile-navigation">
                <h3>Posts by {profile.username}</h3>
            </div>

            <div className="profile-posts">
                {canSeePosts ? (
                    posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.postId} className="post-item">
                                <p className="post-content" style={{
                                    fontFamily: post.fontStyle,
                                    color: post.textColor,
                                    backgroundColor: post.backgroundColor
                                }}>
                                    {post.content}
                                </p>
                                <small className="post-timestamp">
                                    {new Date(post.timestamp).toLocaleString()}
                                </small>
                            </div>
                        ))
                    ) : (
                        <p>{profile.username} hasn't posted anything yet.</p>
                    )
                ) : (
                    <p>You need to follow {profile.username} to see their posts.</p>
                )}
            </div>

            <div className="follow-lists">
                <div className="followers-list">
                    <h4>Followers</h4>
                    {followers.length > 0 ? (
                        <ul>
                            {followers.map(follower => (
                                <li key={follower.userId}>
                                    <Link to={`/profile/${follower.userId}`}>{follower.username}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No followers yet.</p>
                    )}
                </div>

                <div className="following-list">
                    <h4>Following</h4>
                    {following.length > 0 ? (
                        <ul>
                            {following.map(followedUser => (
                                <li key={followedUser.userId}>
                                    <Link to={`/profile/${followedUser.userId}`}>{followedUser.username}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Not following anyone yet.</p>
                    )}
                </div>
            </div>
        </div>
          </>
    );
};

export default Profile;