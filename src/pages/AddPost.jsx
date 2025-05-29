import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPost.css';
import Header from '../components/Header';

const AddPost = () => {
    const [content, setContent] = useState('');
    const [fontStyle, setFontStyle] = useState('Arial'); // Default font
    const [textColor, setTextColor] = useState('#000000'); // Default black
    const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // Default white
    const navigate = useNavigate();

    const handleFontChange = (e) => setFontStyle(e.target.value);
    const handleTextColorChange = (e) => setTextColor(e.target.value);
    const handleBackgroundColorChange = (e) => setBackgroundColor(e.target.value);

    const handleSubmit = async (event) => {
    event.preventDefault();
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        console.error("User ID not found in local storage.");
        navigate('/auth');
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:9091/api/posts/create?userId=${loggedInUser}` +
            `&fontStyle=${fontStyle}&textColor=${textColor}&backgroundColor=${backgroundColor}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization headers if needed
                },
                body: JSON.stringify({ content: content }), // Only send content in the body
            }
        );

        if (response.ok) {
            console.log('Post created successfully!');
            navigate('/');
        } else {
            console.error('Failed to create post:', response);
        }
    } catch (error) {
        console.error('There was an error posting:', error);
    }
};

    return (
        <>
        {/* <Header/> */}
        
        <div className="add-post-container">
            <h2>Create a New Post</h2>
            <form onSubmit={handleSubmit} className="add-post-form">
                <div className="form-group">
                    <label htmlFor="content">Your Thought/Lesson:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="5"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fontStyle">Font Style:</label>
                    <select id="fontStyle" value={fontStyle} onChange={handleFontChange}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
                        {/* Add more font options */}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="textColor">Text Color:</label>
                    <input type="color" id="textColor" value={textColor} onChange={handleTextColorChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="backgroundColor">Background Color:</label>
                    <input type="color" id="backgroundColor" value={backgroundColor} onChange={handleBackgroundColorChange} />
                </div>
                <button type="submit" className="post-button">Post</button>
                <button type="button" className="cancel-button" onClick={() => navigate('/')}>Cancel</button>
            </form>
        </div>
        </>
    );
};

export default AddPost;