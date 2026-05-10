import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({ onStartDebate, user, onLogout, currentStep = "home" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isSetupFlow = ["topic", "difficulty", "debate"].includes(currentStep);

  const handleBeginDebateClick = () => {
    if (onStartDebate) {
      onStartDebate();
    } else {
      navigate("/");
    }
  };

  return (
    <header className={isSetupFlow ? "setup-header" : ""}>
      <div className="container">
        <nav
          className="navbar"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          <div className="header-left-group">
            <Link to="/" className="logo">
              DiBot.AI✨
            </Link>
          </div>

          {isSetupFlow ? (
            <div className="header-stepper">
              <div className={`step-item ${currentStep === 'home' ? 'active' : 'completed'}`} onClick={() => navigate('/')}>
                HOME
              </div>
              <span className="step-arrow">→</span>
              <div className={`step-item ${currentStep === 'topic' ? 'active' : 'completed'}`} onClick={() => onStartDebate()}>
                TOPIC
              </div>
              <span className="step-arrow">→</span>
              <div 
                className={`step-item ${currentStep === 'difficulty' ? 'active' : (currentStep === 'debate' ? 'completed' : 'pending')}`}
                onClick={() => (currentStep === 'debate' || currentStep === 'difficulty') && navigate('/difficulty')}
              >
                DIFFICULTY
              </div>
              <span className="step-arrow">→</span>
              <div className={`step-item ${currentStep === 'debate' ? 'active' : 'pending'}`}>
                DEBATE
              </div>
            </div>
          ) : (
            user && (
              <div className="header-center-actions">
                  <div 
                    className={`user-profile-pill ${isProfileOpen ? "active" : ""}`} 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="user-avatar">
                      {(user.username || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user.username || user.name}</span>
                    <span className="profile-divider"></span>
                    <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="logout-btn-inline">
                      LOGOUT
                    </button>
                  </div>
                <Link to="/dashboard" className="btn btn-dashboard">
                  My Dashboard
                </Link>
              </div>
            )
          )}

          {!isSetupFlow && !user && isHomePage && (
            <ul className={`nav-links${isMenuOpen ? " active" : ""}`}>
              <li>
                <a href="#features" onClick={() => setIsMenuOpen(false)}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>
                  How it Works
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>
                  Testimonials
                </a>
              </li>
            </ul>
          )}

          <div className="nav-actions" style={{ justifySelf: "end" }}>
            {user ? (
              isSetupFlow ? (
                <div 
                  className={`user-profile-pill ${isProfileOpen ? "active" : ""}`} 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="user-avatar">
                    {(user.username || user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.username || user.name}</span>
                  <span className="profile-divider"></span>
                  <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="logout-btn-inline">
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-premium btn-sm"
                  onClick={handleBeginDebateClick}
                >
                  BEGIN DEBATE
                </button>
              )
            ) : (
              <>
                {onStartDebate && (
                  <Link to="/login" className="btn btn-premium">
                    BEGIN DEBATE
                  </Link>
                )}
                <button
                  type="button"
                  className="mobile-toggle"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  aria-label="Toggle navigation"
                >
                  <i className="fas fa-bars" />
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
