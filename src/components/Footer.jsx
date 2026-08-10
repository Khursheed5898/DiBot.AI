import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg-glow">
        <div className="footer-blob footer-blob-1"></div>
        <div className="footer-blob footer-blob-2"></div>
      </div>
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3 className="footer-logo-animate">DiBot.AI</h3>
            <p>
              The transparent AI debate partner for critical thinking
              education.
            </p>
            <div className="social-links">
              <a href="https://github.com/Khursheed5898" className="social-icon github" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github" />
              </a>
              <a href="https://linkedin.com/in/khursheed5898" className="social-icon linkedin" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in" />
              </a>
              <a href="https://instagram.com/khursheed5898" className="social-icon instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://youtube.com/@khursheed5898" className="social-icon youtube" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube" />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Features</h3>
            <ul className="footer-links">
              <li>
                <a href="#features">Transparent AI</a>
              </li>
              <li>
                <a href="#features">Fallacy Detection</a>
              </li>
              <li>
                <a href="#features">Performance Analytics</a>
              </li>
              <li>
                <a href="#features">Adaptive Difficulty</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li>
                <a href="#how-it-works">How to Debate</a>
              </li>
              <li>
                <a href="#how-it-works">Logical Fallacies</a>
              </li>
              <li>
                <a href="#how-it-works">Critical Thinking</a>
              </li>
              <li>
                <a href="#top">Blog</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <ul className="footer-links">
              <li>
                <a href="#top">Help Center</a>
              </li>
              <li>
                <a href="#top">Contact Us</a>
              </li>
              <li>
                <a href="#top">Privacy Policy</a>
              </li>
              <li>
                <a href="#top">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2026 <span className="brand-accent">DiBot.AI</span>. All rights reserved. <span className="separator">•</span> Powered by <span className="brand-sparkle">DiBot.AI ✨</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
