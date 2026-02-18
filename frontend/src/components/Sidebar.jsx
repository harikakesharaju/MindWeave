import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faSearch,
  faPlusSquare,
  faEnvelope, // Used for friend requests
  faTimes, // For closing modal
  faBell, // 🆕 New icon for Notifications/Reactions
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const BASE_URL = "http://localhost:9091";

const Sidebar = React.forwardRef(({ isOpen, setOpen }, ref) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const loggedInUserId = localStorage.getItem("loggedInUser");

  // Friend Request States (Existing)
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  // 🆕 New Reactions/Notifications States
  const [unreadReactionCount, setUnreadReactionCount] = useState(0);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [unreadReactions, setUnreadReactions] = useState([]);
  const [reactionsLoading, setReactionsLoading] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Ref for the Friend Request modal
  const modalRef = useRef(null);
  // 🆕 Ref for the Reactions modal
  const reactionsModalRef = useRef(null);

  const handleSidebarEnter = () => {
    setOpen(true);
  };

  const handleItemHover = (text) => {
    setHoveredItem(text);
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
  };

  // -----------------------------------------------------------
  // 🆕 NEW REACTION LOGIC
  // -----------------------------------------------------------

  const fetchUnreadReactionCount = async () => {
    if (!loggedInUserId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/api/posts/reactions/unread/count`,
        {
          headers: { loggedInUserId: loggedInUserId },
        }
      );
      if (response.ok) {
        const count = await response.json();
        setUnreadReactionCount(count);
      }
    } catch (err) {
      console.error("Error fetching unread reaction count:", err);
    }
  };

  const fetchUnreadReactionDetails = async () => {
    if (!loggedInUserId) return;
    setReactionsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/posts/reactions/unread/details`,
        {
          headers: { loggedInUserId: loggedInUserId },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadReactions(data);
      }
    } catch (err) {
      console.error("Error fetching unread reaction details:", err);
    } finally {
      setReactionsLoading(false);
    }
  };

  const markReactionsAsRead = async () => {
    if (!loggedInUserId) return;
    try {
      await fetch(`${BASE_URL}/api/posts/reactions/mark-read`, {
        method: "POST",
        headers: { loggedInUserId: loggedInUserId },
      });
      setUnreadReactionCount(0); // Immediately clear the badge
    } catch (err) {
      console.error("Error marking reactions as read:", err);
    }
  };

  const handleReactionsModalOpen = () => {
    fetchUnreadReactionDetails(); // Load details when opening
    setShowReactionsModal(true);
  };

  const handleReactionsModalClose = () => {
    setShowReactionsModal(false);
    markReactionsAsRead(); // Mark as read when the user closes the modal
  };

  // -----------------------------------------------------------
  // EXISTING FRIEND REQUEST LOGIC
  // -----------------------------------------------------------

  const fetchPendingRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/users/${loggedInUserId}/friend-requests/pending`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch pending requests: ${response.status}`);
      }
      const data = await response.json();
      setPendingRequests(data);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setRequestsError(err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUnreadMessageCount = async () => {
    if (!loggedInUserId) return;
    try {
      const res = await fetch(
        `${BASE_URL}/api/chats/user/${loggedInUserId}/chats`
      );
      if (res.ok) {
        const chats = await res.json();
        const totalUnread = chats.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0
        );
        setUnreadMessageCount(totalUnread);
        console.log(`count is ${totalUnread}`);
      }
    } catch (err) {
      console.error("Error fetching unread messages count", err);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/users/friend-request/accept?receiverId=${loggedInUserId}&senderId=${senderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log(`Accepted request from user ${senderId}`);
        fetchPendingRequests();
      } else {
        const errorText = await response.text();
        console.error("Failed to accept request:", response.status, errorText);
        alert(`Failed to accept request: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("An error occurred while accepting the request.");
    }
  };

  // -----------------------------------------------------------
  // USE EFFECTS
  // -----------------------------------------------------------

  // Effect to fetch counts/requests on mount/user change
  useEffect(() => {
    if (loggedInUserId) {
      fetchPendingRequests();
      fetchUnreadReactionCount(); // 🆕 Fetch the reaction count
      fetchUnreadMessageCount();
    }
  }, [loggedInUserId]);

  useEffect(() => {
    const handler = () => fetchUnreadMessageCount();
    window.addEventListener("chat-read", handler);

    return () => window.removeEventListener("chat-read", handler);
  }, []);

  // Close modal when clicking outside of it (Updated to handle both modals)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check Friend Requests Modal
      if (
        showRequestsModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setShowRequestsModal(false);
      }
      // Check Reactions Modal
      if (
        showReactionsModal &&
        reactionsModalRef.current &&
        !reactionsModalRef.current.contains(event.target)
      ) {
        handleReactionsModalClose(); // Use the close handler to mark as read
      }
    };

    if (showRequestsModal || showReactionsModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRequestsModal, showReactionsModal]); // Depend on both modal states

  // -----------------------------------------------------------
  // NAVIGATION ITEMS
  // -----------------------------------------------------------

  const navItems = [
    { path: "/", icon: faHome, text: "Home" },
    { path: `/profile/${loggedInUserId}`, icon: faUser, text: "Profile" },
    { path: "/search", icon: faSearch, text: "Search" },
    { path: "/post/new", icon: faPlusSquare, text: "Add Post" },

    // Existing Friend Requests Item
    {
      action: () => setShowRequestsModal(true),
      icon: faEnvelope,
      text: "Requests",
      isButton: true,
      badge: pendingRequests.length,
    },

    // 🆕 NEW Reactions/Notifications Item
    {
      action: handleReactionsModalOpen,
      icon: faBell, // Using a bell icon for notifications
      text: "Notifications",
      isButton: true,
      badge: unreadReactionCount,
    },
    {
      path: "/chats",
      icon: faCommentDots,
      text: "Messages",
      badge: unreadMessageCount,
    },
  ];

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------

  return (
    <div
      className={`sidebar ${!isOpen ? "collapsed" : ""}`}
      onMouseEnter={handleSidebarEnter}
      ref={ref}
    >
      <nav className="nav-items">
        {navItems.map((item, index) => {
          if (item.isButton) {
            return (
              <button
                key={index}
                onClick={item.action}
                className="nav-item nav-button"
                onMouseEnter={() => handleItemHover(item.text)}
                onMouseLeave={handleItemLeave}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  size="lg"
                  className="nav-icon"
                />
                <span
                  className={`nav-text ${
                    hoveredItem === item.text ? "show" : ""
                  }`}
                >
                  {item.text}
                </span>
                {item.badge > 0 && (
                  // Using the existing badge class for uniformity
                  <span className="requests-count-badge">{item.badge}</span>
                )}
              </button>
            );
          } else {
            return (
              <Link
                to={item.path}
                key={index}
                className="nav-item"
                onMouseEnter={() => handleItemHover(item.text)}
                onMouseLeave={handleItemLeave}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  size="lg"
                  className="nav-icon"
                />
                <span
                  className={`nav-text ${
                    hoveredItem === item.text ? "show" : ""
                  }`}
                >
                  {item.text}
                </span>
                {item.badge > 0 && (
                  <span className="requests-count-badge">{item.badge}</span>
                )}
              </Link>
            );
          }
        })}
      </nav>

      {/* Existing Friend Requests Modal */}
      {showRequestsModal && (
        <div className="requests-modal-overlay">
          <div className="requests-modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3>Friend Requests</h3>
              <button
                className="close-modal-button"
                onClick={() => setShowRequestsModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {requestsLoading && <p>Loading requests...</p>}
              {requestsError && (
                <p className="error-message">Error: {requestsError}</p>
              )}
              {!requestsLoading &&
                !requestsError &&
                pendingRequests.length === 0 && (
                  <p>No pending friend requests.</p>
                )}
              <ul className="requests-list">
                {pendingRequests.map((request) => (
                  <li key={request.userId} className="request-item">
                    <Link
                      to={`/profile/${request.userId}`}
                      onClick={() => setShowRequestsModal(false)}
                      className="request-username-link"
                    >
                      {request.username}
                    </Link>
                    <button
                      className="accept-request-button"
                      onClick={() => handleAcceptRequest(request.userId)}
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 NEW Reactions/Notifications Modal */}
      {showReactionsModal && (
        <div className="requests-modal-overlay">
          <div className="requests-modal-content" ref={reactionsModalRef}>
            <div className="modal-header">
              <h3>New Reactions</h3>
              <button
                className="close-modal-button"
                onClick={handleReactionsModalClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {reactionsLoading && <p>Loading notifications...</p>}
              {!reactionsLoading && unreadReactions.length === 0 && (
                <p>No new reactions since your last check.</p>
              )}
              <ul className="requests-list">
                {unreadReactions.map((reaction) => (
                  <li
                    key={
                      reaction.postId +
                      "-" +
                      reaction.reactingUserId +
                      "-" +
                      reaction.timestamp
                    }
                    className="request-item reaction-item"
                  >
                    <span style={{ marginRight: "8px" }}>
                      {reaction.reactionType === "LIKE"
                        ? "❤️ Liked"
                        : "👎 Disliked"}
                      ;
                    </span>
                    <Link
                      to={`/profile/${reaction.reactingUserId}`}
                      className="request-username-link"
                      onClick={handleReactionsModalClose}
                    >
                      **{reaction.reactingUsername}**
                    </Link>
                    <span style={{ margin: "0 5px" }}> your post: </span>
                    <Link
                      to={`/profile/${loggedInUserId}`}
                      className="post-link"
                      onClick={handleReactionsModalClose}
                      style={{
                        fontStyle: "italic",
                        flexGrow: 1,
                        minWidth: "0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={reaction.postHeading}
                    >
                      "{reaction.postHeading || "Untitled Post"}"
                    </Link>
                    <small
                      style={{
                        marginLeft: "auto",
                        color: "#888",
                        flexShrink: 0,
                      }}
                    >
                      {new Date(reaction.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Sidebar;
