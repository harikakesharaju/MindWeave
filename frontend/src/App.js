import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AddPost from './pages/AddPost';
import Search from './pages/Search';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

const isAuthenticated = () => !!localStorage.getItem('loggedInUser');

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/auth" />;
};

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const handleSidebarEnter = () => {
        setIsSidebarOpen(true);
    };

    const handleClickOutside = (event) => {
        if (isAuthenticated() && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsSidebarOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAuthenticated()]);

    return (
        <BrowserRouter>
            <div className="app-layout">
                {isAuthenticated() && (
                    <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} ref={sidebarRef} />
                )}
                <div className={`content ${isAuthenticated() ? 'logged-in' : 'logged-out'}`}>
                    {isAuthenticated() && <Header />} 
                    <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/post/new" element={<PrivateRoute><AddPost /></PrivateRoute>} />
                        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;