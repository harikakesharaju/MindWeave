import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Registration = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:9091";

    const handleSubmit = async (event) => {
        event.preventDefault();
        toast.dismiss();

        if (!profileImage) {
            toast.error("Profile image is required");
            return;
        }

        try {
            const formData = new FormData();
            const user = { username, email, password, description };
            formData.append(
                "user",
                new Blob([JSON.stringify(user)], { type: "application/json" })
            );
            formData.append("image", profileImage);

            const response = await axios.post(
                `${API_BASE_URL}/api/users/register`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status === 201) {
                toast.success("Registration successful! Please log in.", {
                    position: "top-center",
                    autoClose: 3000,
                    theme: "colored",
                });
                setTimeout(() => onSwitchToLogin(), 1000);
            }
        } catch (error) {
            console.error(error);
            let errorMessage = "Registration failed.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                theme: "colored",
            });
        }
    };

    return (
        <div className="auth-form-container">
            <ToastContainer />
            <h2 className="auth-form-title">Create account</h2>
            <p className="auth-form-subtitle">Join MindWeave today — it's free</p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="reg-username">Username</label>
                    <input
                        id="reg-username"
                        type="text"
                        className="auth-input"
                        placeholder="your_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="reg-email">Email</label>
                    <input
                        id="reg-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="reg-password">Password</label>
                    <input
                        id="reg-password"
                        type="password"
                        className="auth-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="reg-desc">Bio (optional)</label>
                    <textarea
                        id="reg-desc"
                        className="auth-input"
                        placeholder="Tell us about yourself..."
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ resize: 'none' }}
                    />
                </div>

                <div className="input-group">
                    <label>Profile Photo</label>
                    <label className="auth-file-label" htmlFor="profile-img-upload">
                        📷&nbsp;
                        {profileImage ? profileImage.name : 'Choose a photo'}
                        <input
                            id="profile-img-upload"
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => setProfileImage(e.target.files[0])}
                        />
                    </label>
                </div>

                <button type="submit" className="auth-submit-btn">
                    Create Account
                </button>
            </form>

            <button onClick={onSwitchToLogin} className="auth-switch-btn">
                Already have an account? Sign In
            </button>
        </div>
    );
};

export default Registration;
