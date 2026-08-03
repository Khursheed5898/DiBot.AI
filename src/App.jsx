import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DifficultyPage from "./pages/DifficultyPage";
import DebatePage from "./pages/DebatePage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import DebateModal from "./components/DebateModal";

function App() {
  const [user, setUser] = useState(null);
  const [isDebateModalOpen, setIsDebateModalOpen] = useState(false);
  const [resetDebateKey, setResetDebateKey] = useState(0); // To force re-render components if needed

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);

    // Smooth exit animation delay
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggingOut(false);
      navigate("/");
    }, 1200);
  };

  const handleOpenDebateModal = () => {
    if (user) {
      setIsDebateModalOpen(true);
    } else {
      navigate("/login");
    }
  };

  const handleTopicPositionSelected = (topic, position) => {
    localStorage.setItem("debateTopic", topic);
    localStorage.setItem("userPosition", position);
    setIsDebateModalOpen(false);
    setResetDebateKey((prev) => prev + 1);

    // If we are already in the flow, just let the state update
    // Otherwise, move to difficulty selection
    const path = window.location.pathname;
    if (path !== "/difficulty" && path !== "/debate") {
      navigate("/difficulty");
    }
  };

  return (
    <>
      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-content">
            <div className="logout-loader"></div>
            <p>Signing you out securely...</p>
          </div>
        </div>
      )}

      {isDebateModalOpen && (
        <DebateModal
          onClose={() => setIsDebateModalOpen(false)}
          onSelect={handleTopicPositionSelected}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              onLogout={handleLogout}
              onStartDebate={handleOpenDebateModal}
            />
          }
        />
        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
        <Route
          path="/difficulty"
          element={
            <DifficultyPage
              user={user}
              onLogout={handleLogout}
              onStartDebate={handleOpenDebateModal}
              resetKey={resetDebateKey}
            />
          }
        />
        <Route
          path="/difficulty-selection"
          element={
            <DifficultyPage
              user={user}
              onLogout={handleLogout}
              onStartDebate={handleOpenDebateModal}
              resetKey={resetDebateKey}
            />
          }
        />
        <Route
          path="/debate"
          element={
            <DebatePage
              user={user}
              onLogout={handleLogout}
              onStartDebate={handleOpenDebateModal}
              key={resetDebateKey}
            />
          }
        />
        <Route
          path="/debate-room"
          element={
            <DebatePage
              user={user}
              onLogout={handleLogout}
              onStartDebate={handleOpenDebateModal}
              key={resetDebateKey}
            />
          }
        />
        <Route
          path="/dashboard"
          element={<DashboardPage user={user} onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
