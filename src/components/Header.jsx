import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    const handleLogout = () => {
        localStorage.clear("loggedInUser");
        localStorage.clear("loggedInUsername");
        navigate('/auth');
    };

    return (
        <header className="elegant-header">
            <div className="header-left">
                <Link to="/" className="logo"> {/* Link to the homepage */}
                    MindWeave
                </Link>
                {loggedInUsername && (
                    <span className="header-caption">
                        What's on your mind today, {loggedInUsername}?
                    </span>
                )}
                {!loggedInUsername && (
                    <span className="header-caption">
                        What's on your mind today?
                    </span>
                )}
            </div>
            <button className="logout-button" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
        </header>
    );
}

export default Header;