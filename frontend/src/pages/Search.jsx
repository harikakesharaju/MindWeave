import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import apiFetch from "../utils/apiFetch";

function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();

    const handleSearchChange = async (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setRecommendations([]);

        if (term.trim()) {
            try {
                const response = await apiFetch(`/api/users/search?query=${term}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecommendations(data);
                } else {
                    console.error('Error fetching recommendations:', response);
                    setRecommendations([]);
                }
            } catch (error) {
                console.error('Error during recommendation fetch:', error);
                setRecommendations([]);
            }
        }
    };

    const handleRecommendationClick = (user) => {
        navigate(`/profile/${user.userId}`);
        setSearchTerm('');
        setRecommendations([]);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (recommendations.length === 1) {
            navigate(`/profile/${recommendations[0].userId}`);
        } else if (searchTerm.trim()) {
            console.log('Performing general search for:', searchTerm);
            setRecommendations([]);
        }
    };

    return (
        <div className="search-container">
            <h2 className="search-title">Find People</h2>
            <p className="search-subtitle">Search by username or email address</p>

            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                    <span className="search-input-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Enter username or email"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <button type="submit" className="search-button">Search</button>
            </form>

            {recommendations.length > 0 && (
                <ul className="recommendations-list">
                    {recommendations.map(user => (
                        <li
                            key={user.userId}
                            className="recommendation-item"
                            onClick={() => handleRecommendationClick(user)}
                        >
                            <div className="recommendation-avatar">
                                {user.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="recommendation-info">
                                <div className="recommendation-username">{user.username}</div>
                                <div className="recommendation-email">{user.email}</div>
                            </div>
                            <span className="recommendation-arrow">›</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Search;
