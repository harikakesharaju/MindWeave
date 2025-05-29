import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:9091'; // Ensure this is your backend URL

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: email,
        password: password,
      });
      const user = response.data; // Assuming your backend returns the UserDto upon successful login
      console.log('Login successful:', user);
      localStorage.setItem('loggedInUser', user.userId); // Store username for session
      // You might want to store the entire user object or a user ID
      navigate('/'); // Redirect to the home page
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Login failed. Invalid email or password.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" component="h2" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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