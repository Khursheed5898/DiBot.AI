import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DebateModal from "../components/DebateModal";
import Header from "../components/Header";
import Footer from "../components/Footer";
import heroImage from "../assets/IMG1.png";
import "../styles/HomePage.css";

function HomePage({ user, onLogout, onStartDebate }) {
  const navigate = useNavigate();

  return (
    <>
      <Header onStartDebate={onStartDebate} user={user} onLogout={onLogout} />

      <main id="top">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title-animated">
                  The Transparent 
                  <br />
                  AI Debate Partner
                </h1>
                <p>
                  Sharpen your critical thinking skills through intelligent
                  debate practice. See exactly how AI analyzes your arguments
                  and learn to think more clearly.
                </p>
              </div>

              <div className="hero-image">
                <img src={heroImage} alt="AI debate interface preview" />
              </div>
            </div>
          </div>
        </section>

        {/* ... features section ... */}
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

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Choose Topic</h3>
                <p>
                  Select from popular debates or create your own topic. We offer
                  a wide range of subjects from politics to philosophy.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Set Difficulty</h3>
                <p>
                  Choose beginner, intermediate, or expert challenge level. The
                  AI adapts its reasoning and language complexity accordingly.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Debate &amp; Learn</h3>
                <p>
                  Engage with AI while seeing its transparent reasoning. Watch
                  how arguments are constructed and deconstructed in real time.
                </p>
              </div>

              <div className="step-card">
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

            <div className="testimonial-marquee-container">
              <div className="testimonial-marquee">
                {/* First Set */}
                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "The logic visualization helps our junior devs understand AI reasoning better than any other tool."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar teal-glow">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" alt="Arjun Varma" />
                    </div>
                    <div className="author-info">
                      <h4>Arjun Varma</h4>
                      <p>Tech Lead, Hyderabad</p>
                    </div>
                  </div>
                </article>

                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "Identifying subtle biases in sources is now a 5-minute task. DiBot is part of my daily research."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar red-glow">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" alt="Priya Patel" />
                    </div>
                    <div className="author-info">
                      <h4>Priya Patel</h4>
                      <p>Journalist, Ahmedabad</p>
                    </div>
                  </div>
                </article>

                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "DiBot.AI helped me understand my own reasoning patterns and structure arguments confidently."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar purple-glow">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" alt="Sneha Sharma" />
                    </div>
                    <div className="author-info">
                      <h4>Sneha Sharma</h4>
                      <p>Philosophy Student, Delhi</p>
                    </div>
                  </div>
                </article>

                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "Finally, an AI tool that teaches rather than just responds. The transparency engine is brilliant."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar blue-glow">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" alt="Marcus Rodriguez" />
                    </div>
                    <div className="author-info">
                      <h4>Marcus Rodriguez</h4>
                      <p>Debate Coach, Kolkata</p>
                    </div>
                  </div>
                </article>

                {/* Second Set for seamless loop */}
                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "The logic visualization helps our junior devs understand AI reasoning better than any other tool."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar teal-glow">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" alt="Arjun Varma" />
                    </div>
                    <div className="author-info">
                      <h4>Arjun Varma</h4>
                      <p>Tech Lead, Hyderabad</p>
                    </div>
                  </div>
                </article>

                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "Identifying subtle biases in sources is now a 5-minute task. DiBot is part of my daily research."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar red-glow">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" alt="Priya Patel" />
                    </div>
                    <div className="author-info">
                      <h4>Priya Patel</h4>
                      <p>Journalist, Ahmedabad</p>
                    </div>
                  </div>
                </article>

                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "DiBot.AI helped me understand my own reasoning patterns and structure arguments confidently."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar purple-glow">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" alt="Sneha Sharma" />
                    </div>
                    <div className="author-info">
                      <h4>Sneha Sharma</h4>
                      <p>Philosophy Student, Delhi</p>
                    </div>
                  </div>
                </article>

                <article className="testimonial-card">
                  <div className="testimonial-content">
                    "Finally, an AI tool that teaches rather than just responds. The transparency engine is brilliant."
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar blue-glow">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" alt="Marcus Rodriguez" />
                    </div>
                    <div className="author-info">
                      <h4>Marcus Rodriguez</h4>
                      <p>Debate Coach, Kolkata</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="cta">
          <div className="cta-bg-glow">
            <div className="cta-blob cta-blob-1"></div>
            <div className="cta-blob cta-blob-2"></div>
          </div>
          <div className="container">
            <h2>Ready to Think Better?</h2>
            <p>
              Start your journey to stronger critical thinking skills today.
              It&apos;s free to try and takes less than a minute to begin.
            </p>
            <button
              onClick={onStartDebate}
              className="btn start-debate-btn"
            >
              Begin Your First Debate
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
