import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faUser,
    faSearch,
    faPlusSquare,
    faBars,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS file

const Sidebar = React.forwardRef(({ isOpen, setOpen }, ref) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const user = localStorage.getItem("loggedInUser");

    const handleSidebarEnter = () => {
        setOpen(true);
    };

    const handleItemHover = (text) => {
        setHoveredItem(text);
    };

    const handleItemLeave = () => {
        setHoveredItem(null);
    };

    const navItems = [
        { path: '/', icon: faHome, text: 'Home' },
        { path: `/profile/${user}`, icon: faUser, text: 'Profile' },
        { path: '/search', icon: faSearch, text: 'Search' },
        { path: '/post/new', icon: faPlusSquare, text: 'Add Post' },
        // Removed Logout here
    ];

    return (
        <div
            className={`sidebar ${!isOpen ? 'collapsed' : ''}`}
            onMouseEnter={handleSidebarEnter}
            ref={ref}
        >
            {/* <div className="toggle-button" onClick={handleSidebarEnter}>
                <FontAwesomeIcon icon={!isOpen ? faBars : faTimes} size="lg" />
            </div> */}
            <nav className="nav-items">
                {navItems.map((item, index) => (
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
                ))}
            </nav>
        </div>
    );
});

export default Sidebar;