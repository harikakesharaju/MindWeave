import React, { useState } from 'react';
import Registration from '../components/Auth/Registration';
import Login from '../components/Auth/Login';
import { Container, Paper } from '@mui/material';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Initially set to true for Login

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isLogin ? (
          <Login onSwitchToRegister={switchToRegister} />
        ) : (
          <Registration onSwitchToLogin={switchToLogin} />
        )}
      </Paper>
    </Container>
  );
};

export default Auth;