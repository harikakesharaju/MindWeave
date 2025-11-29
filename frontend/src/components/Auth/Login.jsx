import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

const Login = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Removed local error state
    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:9091'; // Ensure this is your backend URL

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Clear any previous toasts
        toast.dismiss();

        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
                email: email,
                password: password,
            });
            const user = response.data; // Assuming your backend returns the UserDto upon successful login
            console.log('Login successful:', user);
            localStorage.setItem('loggedInUser', user.userId); // Store user ID for session

            toast.success(`Welcome, ${user.username}! You're logged in.`, { // Use username in toast
                position: "top-center",
                autoClose: 2000, // Shorter autoClose for login success
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

            // Delay navigation to allow user to see the toast message
            setTimeout(() => {
                navigate('/'); // Redirect to the home page
            }, 1000); // 1 second delay
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            let errorMessage = 'Login failed. Invalid email or password.';

            if (error.response) {
                if (error.response.data && typeof error.response.data === 'string') {
                    errorMessage = error.response.data; // Backend sends string error
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message; // Backend sends object with message field
                }
            } else if (error.message) {
                errorMessage = `Network error: ${error.message}`;
            }

            toast.error(errorMessage, {
                position: "top-center",
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
        <Container maxWidth="xs">
            <ToastContainer /> {/* Add ToastContainer here */}
            <Typography variant="h5" component="h2" gutterBottom>
                Login
            </Typography>
            {/* Removed local error Alert */}
            <form onSubmit={handleSubmit}>
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
                <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
                    Login
                </Button>
            </form>
            <Button onClick={onSwitchToRegister} fullWidth sx={{ mt: 2 }}>
                Don't have an account? Register
            </Button>
        </Container>
    );
};

export default Login;