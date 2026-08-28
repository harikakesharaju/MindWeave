import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASEURL from '../../config';

const Login = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        toast.dismiss();
        try {
            const response = await axios.post(`${BASEURL}/api/users/login`, {
                email,
                password,
            });
            const user = response.data;
            console.log('Login successful:', user);
            localStorage.setItem('loggedInUser', user.userId);
            localStorage.setItem('token', user.token);

            toast.success(`Welcome, ${user.username}!`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
            setTimeout(() => navigate('/'), 1000);

        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            let errorMessage = 'Login failed. Invalid email or password.';
            if (error.response) {
                if (error.response.data && typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
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
                theme: "colored",
            });
        }
    };

    return (
        <div className="auth-form-container">
            <ToastContainer />
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Sign in to continue to MindWeave</p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        className="auth-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="auth-submit-btn">
                    Sign In
                </button>
            </form>

            <button onClick={onSwitchToRegister} className="auth-switch-btn">
                Don't have an account? Register
            </button>
        </div>
    );
};

export default Login;
