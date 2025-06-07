import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faUser,
    faSearch,
    faPlusSquare,
    faEnvelope, // New icon for requests
    faTimes, // For closing modal
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS file

const BASE_URL = "http://localhost:9091"; // Define base URL here for reuse

const Sidebar = React.forwardRef(({ isOpen, setOpen }, ref) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const loggedInUserId = localStorage.getItem("loggedInUser"); // Use a more descriptive name
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState(null);

    // Ref for the modal to handle clicks outside
    const modalRef = useRef(null);

    const handleSidebarEnter = () => {
        setOpen(true);
    };

    const handleItemHover = (text) => {
        setHoveredItem(text);
    };

    const handleItemLeave = () => {
        setHoveredItem(null);
    };

    // Effect to fetch pending requests when modal is opened or component mounts
    useEffect(() => {
        if (loggedInUserId) { // Fetch initially and when modal state changes
            fetchPendingRequests();
        }
    }, [loggedInUserId, showRequestsModal]); // Depend on loggedInUserId and showRequestsModal

    // Close modal when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowRequestsModal(false);
            }
        };

        if (showRequestsModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRequestsModal]);


    const fetchPendingRequests = async () => {
        setRequestsLoading(true);
        setRequestsError(null);
        try {
            const response = await fetch(`${BASE_URL}/api/users/${loggedInUserId}/friend-requests/pending`);
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

    const handleAcceptRequest = async (senderId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/users/friend-request/accept?receiverId=${loggedInUserId}&senderId=${senderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log(`Accepted request from user ${senderId}`);
                // Refresh the list of pending requests
                fetchPendingRequests();
                // Optionally, give user feedback
                // alert('Friend request accepted!'); // Consider a less intrusive notification
            } else {
                const errorText = await response.text();
                console.error('Failed to accept request:', response.status, errorText);
                alert(`Failed to accept request: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('An error occurred while accepting the request.');
        }
    };

    const navItems = [
        { path: '/', icon: faHome, text: 'Home' },
        { path: `/profile/${loggedInUserId}`, icon: faUser, text: 'Profile' },
        { path: '/search', icon: faSearch, text: 'Search' },
        { path: '/post/new', icon: faPlusSquare, text: 'Add Post' },
        // New Friend Requests Item
        {
            action: () => setShowRequestsModal(true), // Use an action for modal
            icon: faEnvelope,
            text: 'Requests',
            isButton: true, // Mark this as a button type item
            badge: pendingRequests.length // Pass badge count
        },
    ];

    return (
        <div
            className={`sidebar ${!isOpen ? 'collapsed' : ''}`}
            onMouseEnter={handleSidebarEnter}
            ref={ref}
        >
            <nav className="nav-items">
                {navItems.map((item, index) => {
                    // Render as a Link or a button based on 'isButton' prop
                    if (item.isButton) {
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className="nav-item nav-button" // Add a distinct class for buttons
                                onMouseEnter={() => handleItemHover(item.text)}
                                onMouseLeave={handleItemLeave}
                            >
                                <FontAwesomeIcon icon={item.icon} size="lg" className="nav-icon" />
                                <span className={`nav-text ${hoveredItem === item.text ? 'show' : ''}`}>
                                    {item.text}
                                </span>
                                {item.badge > 0 && (
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
                                <FontAwesomeIcon icon={item.icon} size="lg" className="nav-icon" />
                                <span className={`nav-text ${hoveredItem === item.text ? 'show' : ''}`}>
                                    {item.text}
                                </span>
                            </Link>
                        );
                    }
                })}
            </nav>

            {showRequestsModal && (
                <div className="requests-modal-overlay">
                    <div className="requests-modal-content" ref={modalRef}>
                        <div className="modal-header">
                            <h3>Friend Requests</h3>
                            <button className="close-modal-button" onClick={() => setShowRequestsModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {requestsLoading && <p>Loading requests...</p>}
                            {requestsError && <p className="error-message">Error: {requestsError}</p>}
                            {!requestsLoading && !requestsError && pendingRequests.length === 0 && (
                                <p>No pending friend requests.</p>
                            )}
                            <ul className="requests-list">
                                {pendingRequests.map(request => (
                                    <li key={request.userId} className="request-item">
                                        <Link
                                            to={`/profile/${request.userId}`}
                                            onClick={() => setShowRequestsModal(false)} // Close modal on profile link click
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
        </div>
    );
});

export default Sidebar;