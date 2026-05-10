import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import "../styles/Auth.css";

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username");

    try {
      let response;
      if (isLogin) {
        response = await loginUser(email, password);
      } else {
        response = await registerUser(username, email, password);
      }

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLogin(user);
      navigate("/");
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data?.message || "Something went wrong. Please try again.";
      setError(serverError);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-card fade-in ${!isLogin ? "signup-mode" : ""}`}>
        <Link to="/" className="auth-logo">
          DiBot.AI✨
        </Link>
        
        <div className="auth-header">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>
            {isLogin 
              ? "Login to continue your debate practice." 
              : "Create your account to start debating with DiBot.AI."}
          </p>
          {error && <div className="error-alert">{error}</div>}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group fade-in">
              <label>Full Name</label>
              <input type="text" name="username" placeholder="Your Name" required />
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <>
              Don't have an account? 
              <button onClick={() => setIsLogin(false)}>Register</button>
            </>
          ) : (
            <>
              Already have an account? 
              <button onClick={() => setIsLogin(true)}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
