import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

const Registration = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    // Removed local error/success states as react-toastify will handle visual feedback
    const API_BASE_URL = 'http://localhost:9091';

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Clear any previous toasts
        toast.dismiss();

        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
                username,
                email,
                password,
                description,
                profilePictureUrl,
            });

            if (response.status === 201) {
                console.log('Registration successful:', response.data);
                toast.success('Registration successful! Please log in.', {
                    position: "top-center", // Position toasts centrally for auth forms
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                // Delay switching to login to allow user to read the toast
                setTimeout(() => {
                    onSwitchToLogin();
                }, 1000); // 1 second delay
            } else {
                // This else block might be redundant if backend always sends 4xx for failures
                toast.error('Registration failed. Please try again.', {
                    position: "top-center",
                    autoClose: 5000,
                    theme: "colored",
                });
            }
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data : error.message);
            let errorMessage = 'Registration failed. Please try again.';

            if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = error.response.data; // Specific error for conflict (e.g., username/email taken)
                } else if (error.response.data && typeof error.response.data === 'string') {
                    errorMessage = error.response.data; // Generic error from backend if not 409
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message; // Spring Boot often returns a 'message' field
                }
            } else if (error.message) {
                errorMessage = `Network error: ${error.message}`;
            }

            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                theme: "colored",
            });
        }
    };

    return (
        <Container maxWidth="xs">
            <ToastContainer /> {/* Add ToastContainer here */}
            <Typography variant="h5" component="h2" gutterBottom>
                Register
            </Typography>
            {/* Removed local error/success Alerts as Toastify handles it */}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="Password"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <TextField
                    label="Description (optional)"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    label="Profile Picture URL (optional)"
                    fullWidth
                    margin="normal"
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                />
                <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
                    Register
                </Button>
            </form>
            <Button onClick={onSwitchToLogin} fullWidth sx={{ mt: 2 }}>
                Already have an account? Log in
            </Button>
        </Container>
    );
};

export default Registration;