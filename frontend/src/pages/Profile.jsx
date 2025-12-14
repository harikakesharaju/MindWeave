import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Profile.css";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEdit,
  faCheck,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { lightenColor, darkenColor } from "../UtilityMethods";
import PostCard from "../components/PostCard";

const Profile = () => {
  const { userId: profileId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [hasReceivedRequest, setHasReceivedRequest] = useState(false);
  const [streakLength, setStreakLength] = useState(null);

  const BASEURL = "http://localhost:9091";

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      setStreakLength(null);
      setRequestSent(false); // Reset this on every fetch
      setHasReceivedRequest(false); // Reset this on every fetch
      setIncomingRequests([]);

      try {
        const headers = {};
        if (loggedInUser) {
          headers["loggedInUserId"] = loggedInUser;
        }

        const parsedProfileId = parseInt(profileId, 10);
        const parsedLoggedInUser = loggedInUser
          ? parseInt(loggedInUser, 10)
          : null;
        const isCurrentUserProfile = parsedLoggedInUser === parsedProfileId;

        // Fetch Profile
        const profileResponse = await fetch(
          `${BASEURL}/api/users/${profileId}`,
          { headers }
        );
        if (!profileResponse.ok) {
          throw new Error(`HTTP error! status: ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch Followers
        const followersResponse = await fetch(
          `${BASEURL}/api/users/${profileId}/followers`
        );
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          setFollowers(followersData);

          // Crucial: Update isFollowing based on the *fetched* followers data
          const loggedInUserIsAmongFollowers = followersData.some(
            (follower) => follower.userId === parsedLoggedInUser
          );
          setIsFollowing(isCurrentUserProfile || loggedInUserIsAmongFollowers);
        } else {
          setFollowers([]);
          setIsFollowing(isCurrentUserProfile); // Default if followers fetch fails
        }

        // Fetch Following
        const followingResponse = await fetch(
          `${BASEURL}/api/users/${profileId}/following`
        );
        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          setFollowing(followingData);
        } else {
          setFollowing([]);
        }

        // Fetch User's Posts
        const postsResponse = await fetch(
          `${BASEURL}/api/posts/user/${profileId}`
        );
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
          console.log(postsData);
        } else {
          setPosts([]);
        }

        // Check if the logged-in user has sent a request to the viewed profile
        // This usually comes directly from the /api/users/{profileId} response
        // assuming your backend adds this flag if the viewer has sent a request.
        setRequestSent(profileData?.hasSentRequestTo || false);

        // --- Logic for interactions with other profiles (not own profile) ---
        if (parsedLoggedInUser && parsedProfileId !== parsedLoggedInUser) {
          // Check if the viewed user (profileId) has sent a friend request to the logged-in user
          const checkRequestResponse = await fetch(
            `${BASEURL}/api/users/friend-request/check?senderId=${parsedProfileId}&receiverId=${parsedLoggedInUser}`
          );
          if (checkRequestResponse.ok) {
            const data = await checkRequestResponse.json();
            setHasReceivedRequest(data.exists);
          } else {
            console.error("Failed to check friend request status.");
            setHasReceivedRequest(false);
          }

          // Fetch streak if they both follow each other
          // Ensure profileData.follows is an array of objects with userId
          const viewedUserFollowsLoggedIn = profileData?.follows?.some(
            (followedUser) => followedUser.userId === parsedLoggedInUser
          );

          if (
            isCurrentUserProfile ||
            (isFollowing && viewedUserFollowsLoggedIn)
          ) {
            const streakResponse = await fetch(
              `${BASEURL}/api/streaks/users/${parsedLoggedInUser}/${parsedProfileId}`
            );
            if (streakResponse.ok) {
              const streakData = await streakResponse.json();
              setStreakLength(
                streakData?.streakLength !== undefined &&
                  streakData.streakLength !== null
                  ? streakData.streakLength
                  : 0
              );
            } else if (streakResponse.status === 404) {
              setStreakLength(0);
            } else {
              console.error("Failed to fetch streak.");
              setStreakLength(0);
            }
          } else {
            setStreakLength(0); // No mutual follow, no streak
          }
        } else {
          // This branch is for the OWN PROFILE or if loggedInUser is null
          setHasReceivedRequest(false);
          setStreakLength(null); // No streak to show on own profile or if not logged in
        }

        // Fetch incoming friend requests (for display on own profile)
        // if (parsedLoggedInUser && isCurrentUserProfile) {
        //     // const incomingRequestsResponse = await fetch(`${BASEURL}/api/users/${parsedLoggedInUser}/requests`);
        //     const incomingRequestsResponse = await fetch(`${BASEURL}/api/users/friend-request/check?senderId=&receiverId=`);
        //     if (incomingRequestsResponse.ok) {
        //         const incomingRequestsData = await incomingRequestsResponse.json();
        //         setIncomingRequests(incomingRequestsData);
        //     } else {
        //         console.error("Failed to fetch incoming requests.");
        //         setIncomingRequests([]);
        //     }
        // } else {
        //     setIncomingRequests([]);
        // }
      } catch (err) {
        setError(err.message);
        setProfile(null);
        setFollowers([]);
        setFollowing([]);
        setPosts([]);
        setStreakLength(null);
        setIsFollowing(false); // Reset this too on error
        setRequestSent(false); // Reset this too on error
        setHasReceivedRequest(false); // Reset this too on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, loggedInUser, BASEURL]); // Added BASEURL to dependency array for completeness

  const openEditModal = () => {
    if (profile) {
      setEditFormData({
        username: profile.username || "",
        email: profile.email || "",
        description: profile.description || "",
        profilePictureUrl: profile.profilePictureUrl || "",
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
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASEURL}/api/users/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        console.log("Profile updated successfully");
        const updatedProfileResponse = await fetch(
          `${BASEURL}/api/users/${profileId}`,
          {
            headers: loggedInUser ? { loggedInUserId: loggedInUser } : {},
          }
        );
        if (updatedProfileResponse.ok) {
          const updatedProfileData = [];
          updatedProfileData = await updatedProfileResponse.json();
          updatedProfileData.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setProfile(updatedProfileData);
        }
        closeEditModal();
      } else {
        console.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFollowRequest = async () => {
    if (!loggedInUser) {
      navigate("/auth");
      return;
    }
    setRequestSent(true);
    try {
      const response = await fetch(
        `${BASEURL}/api/users/friend-request/send?senderId=${loggedInUser}&receiverId=${profileId}`,
        { method: "POST" }
      );
      if (response.ok) {
        console.log("Friend request sent!");
        // On successful request, also update hasSentRequestTo on the profile
        // to reflect the current state without a full re-fetch.
        setProfile((prevProfile) => ({
          ...prevProfile,
          hasSentRequestTo: true, // Assuming your backend sets this true when a request is sent
        }));
      } else {
        console.error("Failed to send friend request:", response);
        setRequestSent(false);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      setRequestSent(false);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    if (!loggedInUser) {
      navigate("/auth");
      return;
    }
    try {
      const response = await fetch(
        `${BASEURL}/api/users/friend-request/accept?receiverId=${loggedInUser}&senderId=${profileId}`,
        { method: "POST" }
      );
      if (response.ok) {
        console.log("Friend request accepted from user:", senderId);
        setIncomingRequests((prevRequests) =>
          prevRequests.filter((req) => req.userId !== senderId)
        );

        // Re-fetch everything, including followers and following to ensure isFollowing is correct
        // and to update mutual follow states that affect streak.
        // A full re-fetch is safer here after a significant relationship change.
        // Call fetchProfileData() again to re-run the useEffect logic
        // No, just trigger re-render if the profileId is same
        // For this, we just need to update followers and isFollowing state
        const followersResponse = await fetch(
          `${BASEURL}/api/users/${profileId}/followers`
        );
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          setFollowers(followersData);
          // Crucial: Re-evaluate isFollowing
          const parsedLoggedInUser = loggedInUser
            ? parseInt(loggedInUser, 10)
            : null;
          const loggedInUserIsAmongFollowers = followersData.some(
            (follower) => follower.userId === parsedLoggedInUser
          );
          setIsFollowing(
            loggedInUserIsAmongFollowers ||
              parseInt(profileId, 10) === parsedLoggedInUser
          );
        }

        if (parseInt(profileId, 10) === senderId) {
          setHasReceivedRequest(false);
          setIsFollowing(true); // Now we are following this user
        }
      } else {
        console.error("Failed to accept friend request:", response);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    try {
      const response = await fetch(`${BASEURL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("trying to delete" + postId);

      if (response.ok) {
        console.log(`Post with ID ${postId} deleted successfully.`);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.postId !== postId)
        );
      } else {
        console.error(
          `Failed to delete post with ID ${postId}:`,
          response.status,
          response.statusText
        );
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert(
          `Failed to delete post: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(`An error occurred while deleting the post: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="profile-status-message">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-status-message error">
        Error loading profile: {error}
      </div>
    );
  }

  if (!profile) {
    return <div className="profile-status-message">Profile not found.</div>;
  }

  const isOwnProfile = loggedInUser === profileId;
  const canSeePosts = isOwnProfile || isFollowing;

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture">
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt={profile.username} />
            ) : (
              <FontAwesomeIcon
                icon={faUser}
                size="3x"
                className="default-profile-icon"
              />
            )}
          </div>
          <div className="profile-info">
            <h1>{profile.username}</h1>
            <p className="email">{profile.email}</p>
            {profile.description && (
              <p className="description">{profile.description}</p>
            )}

            {/* Conditional rendering for follow/request buttons */}
            {!isOwnProfile && loggedInUser && (
              <>
                {/* Case 1: Not following, no request sent, no request received -> Show Send Request */}
                {!isFollowing && !requestSent && (
                  <button
                    className="follow-button"
                    onClick={handleFollowRequest}
                  >
                    Send Request
                  </button>
                )}
                {/* Case 2: Not following, but request sent (by logged-in user) or viewed profile has already sent a request to loggedInUser. This was slightly tricky. */}
                {/* If `requestSent` is true, it means WE sent the request. */}
                {/* If `profile.hasSentRequestTo` is true, it means THE OTHER USER sent a request TO US. */}
                {/* The `hasReceivedRequest` state is explicitly for requests *from* the viewed profile to the loggedInUser. */}
                {/* Let's simplify this: if we sent a request, show "Requested". If they sent one, show "Accept". */}
                {/* The 'profile.hasSentRequestTo' check is usually from the perspective of the profile owner, not the viewer. */}
                {/* Let's rely on `requestSent` (we sent) and `hasReceivedRequest` (they sent to us). */}

                {/* If we sent a request (requestSent is true) */}
                {!isFollowing && requestSent && (
                  <button className="follow-button" disabled>
                    Requested
                  </button>
                )}

                {/* If THEY sent a request to US (hasReceivedRequest is true) */}
                {!isOwnProfile && hasReceivedRequest && (
                  <button
                    className="accept-button-other"
                    onClick={() => handleAcceptRequest(profileId)}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Accept Request
                  </button>
                )}

                {/* If already following */}
                {isFollowing && !isOwnProfile && (
                  <button className="follow-button" disabled>
                    Following
                  </button>
                )}
              </>
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
              {/* Display Streak Length: only if not own profile, streakLength is a number, and greater than 0 */}
              {!isOwnProfile &&
                typeof streakLength === "number" &&
                streakLength > 0 && (
                  <div className="streak">
                    <span>{streakLength}</span> Day Streak
                  </div>
                )}
            </div>
          </div>
        </div>

        {isOwnProfile && incomingRequests.length > 0 && (
          <div className="friend-requests">
            {/* <h3>Friend Requests</h3> */}
            <ul>
              {incomingRequests.map((request) => (
                <li key={request.userId}>
                  <Link to={`/profile/${request.userId}`}>
                    {request.username}
                  </Link>
                  <button
                    className="accept-button"
                    onClick={() => handleAcceptRequest(request.userId)}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Accept
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isEditModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit Your Profile</h2>
              <form onSubmit={handleUpdateProfile}>
                <div>
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editFormData.username}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="profilePictureUrl">
                    Profile Picture URL:
                  </label>
                  <input
                    type="text"
                    id="profilePictureUrl"
                    name="profilePictureUrl"
                    value={editFormData.profilePictureUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit">Save Changes</button>
                  <button type="button" onClick={closeEditModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!isOwnProfile && (
          <button
            className="message-button"
            onClick={() => navigate(`/chat/${profileId}`)}
          >
            Message
          </button>
        )}

        <div className="profile-navigation">
          <h3>Posts by {profile.username}</h3>
        </div>

        <div className="profile-posts">
          {canSeePosts ? (
            posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.postId} style={{ marginBottom: "25px" }}>
                  <PostCard
                    post={post}
                    canDelete={isOwnProfile}
                    onDelete={handleDeletePost}
                  />
                </div>
              ))
            ) : (
              <p>{profile.username} hasn't posted anything yet.</p>
            )
          ) : (
            <p>You need to follow {profile.username} to see their posts.</p>
          )}
        </div>
      </div>

      <div className="follow-lists">
        <div className="followers-list">
          <h4>Followers</h4>
          {followers.length > 0 ? (
            <ul>
              {followers.map((follower) => (
                <li key={follower.userId}>
                  <Link to={`/profile/${follower.userId}`}>
                    {follower.username}
                  </Link>
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
              {following.map((followedUser) => (
                <li key={followedUser.userId}>
                  <Link to={`/profile/${followedUser.userId}`}>
                    {followedUser.username}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Not following anyone yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
