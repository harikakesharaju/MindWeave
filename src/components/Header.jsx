import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const loggedInUsername = localStorage.getItem('loggedInUsername'); // Get the username

    const handleLogout = () => {
        localStorage.clear("loggedInUser");
        localStorage.clear("loggedInUsername"); // Also clear the username
        navigate('/auth');
    };

    return (
        <header className="main-header">
            <div className="header-left">
                {loggedInUsername ? (
                    <span className="header-caption">
                        What's on your mind today, {loggedInUsername}?
                    </span>
                ) : (
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