import React from 'react';
import { useNavigate } from 'react-router-dom'; // Ensure this import is present
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Home.css'; // Import Home's CSS
import Header from '../components/Header';

function Home() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear("loggedInUsername");
        navigate('/auth');
    };

    return (
        <div className="main-content"> {/* Use main-content class here */}
            {/* <Header /> */}
            home
            {/* Rest of your home page content */}
        </div>
    );
}

export default Home;