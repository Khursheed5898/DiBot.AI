import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DebateModal from "../components/DebateModal";
import heroImage from "../assets/IMG1.png";

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleStartDebate = () => {
    setShowModal(true);
    setIsMenuOpen(false);
  };

  const handleTopicPositionSelected = (topic, position) => {
    localStorage.setItem("debateTopic", topic);
    localStorage.setItem("userPosition", position);
    setShowModal(false);
    navigate("/difficulty");
  };

  return (
    <>
      <header>
        <div className="container">
          <nav className="navbar">
            <a href="#top" className="logo">
              DiBot.AI✨
            </a>

            <ul className={`nav-links${isMenuOpen ? " active" : ""}`}>
              <li>
                <a href="#features" onClick={() => setIsMenuOpen(false)}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>
                  Testimonials
                </a>
              </li>
            </ul>

            <div className="nav-actions">
              <button
                type="button"
                className="btn start-debate-btn"
                onClick={handleStartDebate}
              >
                Start Debating
              </button>
              <button
                type="button"
                className="mobile-toggle"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label="Toggle navigation"
              >
                <i className="fas fa-bars" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1>The Transparent AI Debate Partner</h1>
                <p>
                  Sharpen your critical thinking skills through intelligent
                  debate practice. See exactly how AI analyzes your arguments
                  and learn to think more clearly.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="btn start-debate-btn"
                    onClick={handleStartDebate}
                  >
                    Start Your First Debate
                  </button>
                  <a href="#how-it-works" className="btn btn-secondary">
                    See How It Works
                  </a>
                </div>
              </div>

              <div className="hero-image">
                <img src={heroImage} alt="AI debate interface preview" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section features">
          <div className="container">
            <div className="section-title">
              <h2>Why Choose DiBot.AI ?</h2>
              <p>
                Unlike other AI tools, DiBot.AI is designed specifically for
                education. Every feature is built to make you a better critical
                thinker.
              </p>
            </div>

            <div className="features-grid">
              <article className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-brain" />
                </div>
                <h3>Transparent AI Reasoning</h3>
                <p>
                  See exactly how the AI analyzes your arguments and formulates
                  responses in real time. Understand the logic behind every
                  counterpoint.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line" />
                </div>
                <h3>Critical Thinking Training</h3>
                <p>
                  Develop stronger argumentation skills through structured
                  debate practice. Learn to construct and deconstruct arguments
                  effectively.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-sliders-h" />
                </div>
                <h3>Adaptive Difficulty</h3>
                <p>
                  Choose from beginner to expert levels that match your debate
                  experience. The AI adapts to challenge you appropriately.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-bar" />
                </div>
                <h3>Performance Analytics</h3>
                <p>
                  Receive detailed feedback on your argument structure, logical
                  consistency, and debate performance with actionable insights.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-exclamation-triangle" />
                </div>
                <h3>Fallacy Detection</h3>
                <p>
                  Identify logical fallacies in real time as you debate. Learn
                  to recognize and avoid common reasoning errors.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-file-alt" />
                </div>
                <h3>Full Transcripts</h3>
                <p>
                  Access complete records of your debates for review and
                  analysis. Track your progress over time.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section how-it-works">
          <div className="container">
            <div className="section-title">
              <h2>How DiBot.AI Works</h2>
              <p>A simple 4-step process to better thinking</p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Choose Topic</h3>
                <p>
                  Select from popular debates or create your own topic. We offer
                  a wide range of subjects from politics to philosophy.
                </p>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <h3>Set Difficulty</h3>
                <p>
                  Choose beginner, intermediate, or expert challenge level. The
                  AI adapts its reasoning and language complexity accordingly.
                </p>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <h3>Debate &amp; Learn</h3>
                <p>
                  Engage with AI while seeing its transparent reasoning. Watch
                  how arguments are constructed and deconstructed in real time.
                </p>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <h3>Get Feedback</h3>
                <p>
                  Receive detailed analysis and improvement suggestions.
                  Understand your strengths and areas for development.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="section testimonials">
          <div className="container">
            <div className="section-title">
              <h2>What Users Say</h2>
              <p>Join thousands improving their critical thinking</p>
            </div>

            <div className="testimonial-grid">
              <article className="testimonial-card">
                <div className="testimonial-content">
                  "DiBot.AI helped me understand my own reasoning patterns. The
                  transparency feature is incredible! I've become much better at
                  structuring arguments in my law classes."
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">SC</div>
                  <div className="author-info">
                    <h4>Sarah Chen</h4>
                    <p>Philosophy Student</p>
                  </div>
                </div>
              </article>

              <article className="testimonial-card">
                <div className="testimonial-content">
                  "I use DiBot.AI with my students. The fallacy detection and
                  real-time feedback are game-changers. My students' critical
                  thinking skills have improved dramatically."
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">MR</div>
                  <div className="author-info">
                    <h4>Marcus Rodriguez</h4>
                    <p>Debate Coach</p>
                  </div>
                </div>
              </article>

              <article className="testimonial-card">
                <div className="testimonial-content">
                  "Finally, an AI tool that teaches rather than just responds.
                  The engine room is brilliant. It shows the reasoning process,
                  not just the final answer."
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">EW</div>
                  <div className="author-info">
                    <h4>Dr. Emily Watson</h4>
                    <p>Critical Thinking Professor</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="cta" className="cta">
          <div className="container">
            <h2>Ready to Think Better?</h2>
            <p>
              Start your journey to stronger critical thinking skills today.
              It&apos;s free to try and takes less than a minute to begin.
            </p>
            <button
              type="button"
              className="btn start-debate-btn"
              onClick={handleStartDebate}
            >
              Begin Your First Debate
            </button>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>DiBot.AI</h3>
              <p>
                The transparent AI debate partner for critical thinking
                education.
              </p>
              <div className="social-links">
                <a href="#top" aria-label="Twitter">
                  <i className="fab fa-twitter" />
                </a>
                <a href="#top" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
                <a href="#top" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in" />
                </a>
                <a href="#top" aria-label="Instagram">
                  <i className="fab fa-instagram" />
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
              &copy; 2026 DiBot.AI : All rights reserved | Powered by - DiBot.AI
              ✨
            </p>
          </div>
        </div>
      </footer>

      {showModal && (
        <DebateModal
          onClose={() => setShowModal(false)}
          onSelect={handleTopicPositionSelected}
        />
      )}
    </>
  );
}

export default HomePage;
