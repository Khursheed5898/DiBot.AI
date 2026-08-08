import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({ onStartDebate, user, onLogout, currentStep = "home" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileClosing, setIsProfileClosing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isSetupFlow = ["topic", "difficulty", "debate"].includes(currentStep);

  const currentUser =
    user ||
    (() => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
          return JSON.parse(savedUser);
        }
        const token = localStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null") {
          return { username: "Account", email: "Active Session" };
        }
      } catch (e) {
        return null;
      }
      return null;
    })();

  const handleBeginDebateClick = () => {
    if (onStartDebate) {
      onStartDebate();
    } else {
      navigate("/");
    }
  };

  const handleCloseProfile = (callback) => {
    if (isProfileClosing || !isProfileOpen) return;
    setIsProfileClosing(true);
    setTimeout(() => {
      setIsProfileOpen(false);
      setIsProfileClosing(false);
      if (callback) callback();
    }, 220);
  };

  const handleToggleProfile = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isProfileOpen) {
      setIsProfileOpen(false);
      setIsProfileClosing(false);
    } else {
      setIsProfileClosing(false);
      setIsProfileOpen(true);
    }
  };

  const isDifficultyOrDebate = ["difficulty", "debate"].includes(currentStep);

  return (
    <header
      className={`${isSetupFlow ? "setup-header" : ""}${
        isDifficultyOrDebate ? " hide-mobile-logo" : ""
      }`}
    >
      <div className="container">
        <nav className="navbar">
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars" />
          </button>

          <div className="header-left-group" style={{ justifySelf: "start" }}>
            <Link to="/" className="logo">
              DiBot.AI✨
            </Link>
          </div>

          {/* Center Column: Show Stepper if in setup flow */}
          {isSetupFlow && (
            <div className="header-stepper" style={{ justifySelf: "center" }}>
              <div
                className={`step-item ${currentStep === "home" ? "active" : "completed"}`}
                onClick={() => navigate("/")}
              >
                HOME
              </div>
              <span className="step-arrow">→</span>
              <div
                className={`step-item ${currentStep === "topic" ? "active" : "completed"}`}
                onClick={() => onStartDebate()}
              >
                TOPIC
              </div>
              <span className="step-arrow">→</span>
              <div
                className={`step-item ${
                  currentStep === "difficulty"
                    ? "active"
                    : currentStep === "debate"
                      ? "completed"
                      : "pending"
                }`}
                onClick={() =>
                  (currentStep === "debate" || currentStep === "difficulty") &&
                  navigate("/difficulty")
                }
              >
                DIFFICULTY
              </div>
              <span className="step-arrow">→</span>
              <div
                className={`step-item ${currentStep === "debate" ? "active" : "pending"}`}
              >
                DEBATE
              </div>
            </div>
          )}

          {/* Navigation Links (Slide-In Drawer for Mobile/Tablet) — Always rendered */}
          <ul className={`nav-links${isMenuOpen ? " active" : ""}`}>
            <li className="drawer-header">
              <span className="drawer-title">MENU</span>
            </li>

            <li>
              <a href="/#features" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
            </li>
            <li>
              <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)}>
                How it Works
              </a>
            </li>
            <li>
              <a href="/#testimonials" onClick={() => setIsMenuOpen(false)}>
                Testimonials
              </a>
            </li>

            {/* Mobile-only Resources Links */}
            <li className="drawer-section-title mobile-only-link">RESOURCES</li>
            <li className="mobile-only-link">
              <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>
                How to Debate
              </a>
            </li>
            <li className="mobile-only-link">
              <a href="#features" onClick={() => setIsMenuOpen(false)}>
                Logical Fallacies
              </a>
            </li>
            <li className="mobile-only-link">
              <a href="#features" onClick={() => setIsMenuOpen(false)}>
                Critical Thinking
              </a>
            </li>

            {currentUser && (
              <>
                <li className="drawer-section-title mobile-only-link">
                  ACCOUNT
                </li>
                <li className="mobile-only-link">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <i
                      className="fas fa-chart-line"
                      style={{ marginRight: "6px" }}
                    />
                    My Dashboard
                  </Link>
                </li>
                <li className="mobile-only-link">
                  <button
                    className="mobile-drawer-logout-btn"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                  >
                    <i className="fas fa-sign-out-alt" /> LOGOUT
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* 1. Outside Click/Blank space click to close backdrop */}
          {isMenuOpen && (
            <div
              className="mobile-backdrop"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <div className="nav-actions" style={{ justifySelf: "end" }}>
            {currentUser ? (
              <div className="user-profile-badge-wrapper">
                <button
                  type="button"
                  className={`user-name-pill ${isProfileOpen ? "active" : ""}`}
                  onClick={handleToggleProfile}
                  aria-expanded={isProfileOpen}
                >
                  <i className="fas fa-user-circle" />
                  <span>
                    <span className="name-full">
                      {currentUser.username || currentUser.name || "User"}
                    </span>
                    <span className="name-first">
                      {
                        (currentUser.username || currentUser.name || "User")
                          .trim()
                          .split(" ")[0]
                      }
                    </span>
                  </span>
                  <i
                    className={`fas fa-chevron-down pill-arrow ${isProfileOpen ? "open" : ""}`}
                  />
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="user-profile-backdrop"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="user-profile-dropdown">
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">
                          {currentUser.username || currentUser.name}
                        </span>
                        <span className="dropdown-user-email">
                          {currentUser.email || "Account Active"}
                        </span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/dashboard");
                        }}
                      >
                        <i className="fas fa-chart-line" /> My Dashboard
                      </Link>
                      <button
                        type="button"
                        className="dropdown-item logout"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsProfileOpen(false);
                          if (onLogout) onLogout();
                        }}
                      >
                        <i className="fas fa-sign-out-alt" /> LOGOUT
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                className="btn btn-premium btn-sm"
                onClick={handleBeginDebateClick}
              >
                BEGIN DEBATE
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
