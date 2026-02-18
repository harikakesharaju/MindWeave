import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Registration = ({ onSwitchToLogin }) => {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const API_BASE_URL = "http://localhost:9091";

    const handleSubmit = async (event) => {
        event.preventDefault();
        toast.dismiss();

        if (!profileImage) {
            toast.error("Profile image is required");
            return;
        }

        try {
            const formData = new FormData();

            // user JSON object
            const user = {
                username,
                email,
                password,
                description
            };

            formData.append(
                "user",
                new Blob([JSON.stringify(user)], { type: "application/json" })
            );

            // image file
            formData.append("image", profileImage);

            const response = await axios.post(
                `${API_BASE_URL}/api/users/register`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.status === 201) {
                toast.success("Registration successful! Please log in.", {
                    position: "top-center",
                    autoClose: 3000,
                    theme: "colored"
                });

                setTimeout(() => {
                    onSwitchToLogin();
                }, 1000);
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
                theme: "colored"
            });
        }
    };

    return (
        <Container maxWidth="xs">
            <ToastContainer />
            <Typography variant="h5" component="h2" gutterBottom>
                Register
            </Typography>

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

                {/* Image Upload */}
                <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Upload Profile Image
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                    />
                </Button>

                {profileImage && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected: {profileImage.name}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
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
