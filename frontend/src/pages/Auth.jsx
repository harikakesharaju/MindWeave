import React, { useState } from 'react';
import Registration from '../components/Auth/Registration';
import Login from '../components/Auth/Login';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <h1 className="auth-brand-logo">MindWeave</h1>
          <p className="auth-brand-tagline">
            Weave your thoughts together.<br />
            Connect with minds that matter.
          </p>
          <ul className="auth-brand-features">
            <li>✦ Share beautifully styled posts</li>
            <li>✦ Follow people &amp; build your feed</li>
            <li>✦ Chat in real time</li>
            <li>✦ Build daily posting streaks</li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-inner">
          {isLogin ? (
            <Login onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <Registration onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
