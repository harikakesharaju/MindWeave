import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import Header from '../components/Header';

function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:9091";

    const handleSearchChange = async (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setRecommendations([]); // Clear previous recommendations if input changes

        if (term.trim()) {
            try {
                const response = await fetch(`${BASE_URL}/api/users/search?query=${term}`);
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
        // If there's a selected recommendation, navigation happens on click
        // If not, you might want to handle a direct search (e.g., show a list of results)
        if (recommendations.length === 1) {
            navigate(`/profile/${recommendations[0].userId}`);
        } else if (searchTerm.trim()) {
            // You might want to navigate to a search results page here instead
            console.log('Performing general search for:', searchTerm);
            // For now, let's just clear recommendations
            setRecommendations([]);
        }
    };

    return (
        <>
         {/* <Header/> */}
        <div className="search-container">
           
            <h2>Search for Users</h2>
            <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                    type="text"
                    placeholder="Enter email or username"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
            </form>
            {recommendations.length > 0 && (
                <ul className="recommendations-list">
                    {recommendations.map(user => (
                        <li key={user.userId} onClick={() => handleRecommendationClick(user)}>
                            {user.username} ({user.email})
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </>
    );
}

export default Search;