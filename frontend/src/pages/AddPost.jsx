import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPost.css';
import Header from '../components/Header'; // Assuming you still use this, though it's commented out in your JSX
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

const AddPost = () => {
    const [content, setContent] = useState('');
    const [fontStyle, setFontStyle] = useState('Arial');
    const [textColor, setTextColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(16); // Default font size
    const navigate = useNavigate();

    const handleFontChange = (e) => setFontStyle(e.target.value);
    const handleTextColorChange = (e) => setTextColor(e.target.value);
    const handleBackgroundColorChange = (e) => setBackgroundColor(e.target.value);
    const handleFontSizeSliderChange = (e) => setFontSize(parseInt(e.target.value, 10));

    const handleSubmit = async (event) => {
        event.preventDefault();
        const loggedInUser = localStorage.getItem('loggedInUser');

        if (!loggedInUser) {
            console.error("User ID not found in local storage.");
            toast.error("Please log in to create a post."); // Show an error toast
            navigate('/auth');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:9091/api/posts/create/${loggedInUser}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                        fontStyle: fontStyle,
                        textColor: textColor,
                        backgroundColor: backgroundColor,
                        fontSize: fontSize
                    }),
                }
            );

            if (response.ok) {
                console.log('Post created successfully!');
                toast.success('Thought crafted and published! ✨', {
                    position: "top-right", // Customize position
                    autoClose: 3000, // Close after 3 seconds
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored", // Use a colored theme for success
                });
                // Navigate after a short delay to allow toast to be seen
                setTimeout(() => {
                    navigate('/');
                }, 1000); // Navigate after 1 second
            } else {
                console.error('Failed to create post:', response);
                const errorData = await response.json(); // Try to parse error message from backend
                const errorMessage = errorData.message || 'Failed to publish your thought.';
                toast.error(`Error: ${errorMessage}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored", // Use a colored theme for error
                });
            }
        } catch (error) {
            console.error('There was an error posting:', error);
            toast.error(`Network error: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    return (
        <div className="add-post-page-split">
            {/* You can uncomment <Header/> if it's part of the layout */}
            {/* <Header/> */}

            <ToastContainer /> {/* Add ToastContainer here */}

            <div className="add-post-form-container">
                <h2 className="add-post-title">Craft Your Thought</h2>
                <form onSubmit={handleSubmit} className="add-post-form">
                    <div className="form-group">
                        <label htmlFor="content" className="form-label">Your Message:</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="7"
                            className="form-textarea"
                            placeholder="Share your wisdom..."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fontStyle" className="form-label">Font:</label>
                        <select id="fontStyle" value={fontStyle} onChange={handleFontChange} className="form-select">
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Impact">Impact</option>
                        </select>
                    </div>
                    <div className="form-group color-picker-group">
                        <label htmlFor="textColor" className="form-label">Text Color:</label>
                        <input type="color" id="textColor" value={textColor} onChange={handleTextColorChange} className="form-color-input" />
                    </div>
                    <div className="form-group color-picker-group">
                        <label htmlFor="backgroundColor" className="form-label">Background:</label>
                        <input type="color" id="backgroundColor" value={backgroundColor} onChange={handleBackgroundColorChange} className="form-color-input" />
                    </div>
                    <div className="form-group font-size-slider">
                        <label htmlFor="fontSize" className="form-label">Font Size:</label>
                        <input
                            type="range"
                            id="fontSize"
                            min="12"
                            max="32"
                            value={fontSize}
                            onChange={handleFontSizeSliderChange}
                            className="form-range"
                        />
                        <span className="font-size-value">{fontSize}px</span>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="post-button">Publish</button>
                        <button type="button" className="cancel-button" onClick={() => navigate('/')}>Discard</button>
                    </div>
                </form>
            </div>

            {/* Preview Section (on the right) */}
            <div className="post-preview-side">
                <h3 className="preview-title">Live Preview</h3>
                <div
                    className="post-preview"
                    style={{
                        fontFamily: fontStyle,
                        color: textColor,
                        backgroundColor: backgroundColor,
                        fontSize: `${fontSize}px`,
                    }}
                >
                    {content || "Your thought will appear here..."}
                </div>
            </div>
        </div>
    );
};

export default AddPost;