import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';

const Registration = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const API_BASE_URL = 'http://localhost:9091';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
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
                setSuccess('Registration successful! You can now log in.');
                onSwitchToLogin();
            } else {
                setError('Registration failed.'); // Generic fallback
            }
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data : error.message);
            if (error.response?.status === 409) {
                setError(error.response.data); // Display the specific error message from the backend
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <Container maxWidth="xs">
            <Typography variant="h5" component="h2" gutterBottom>
                Register
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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