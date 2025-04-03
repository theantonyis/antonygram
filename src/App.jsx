import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";

// Dummy function to check if the user is logged in
const isAuthenticated = () => {
    return false;
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

    useEffect(() => {
        // Check the login status when the app loads
        setIsLoggedIn(isAuthenticated());
    }, []);

    return (
        <Router>
            <Routes>
                {/* Login Route */}
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

                {/* Register Route */}
                <Route path="/register" element={<RegisterPage />} />

                {/* Main Chat Route, only accessible when logged in */}
                <Route
                    path="/chat"
                    element={isLoggedIn ? <ChatPage /> : <Navigate to="/login" />}
                />

                {/* Redirect to login if no route matches */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
