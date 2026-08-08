import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/DifficultyPage.css";

const difficultyCards = [
  {
    level: "easy",
    label: "Beginner",
    icon: "🌱",
    description: "AI gives simple counter-arguments with basic reasoning. Ideal for first-time debaters building confidence.",
    tags: ["Simple logic", "Slow pace", "Hints available"],
    filledDots: 1,
    tone: "beginner",
  },
  {
    level: "medium",
    label: "Intermediate",
    icon: "⚡",
    description: "AI uses facts, data, and structured arguments. Good for students who debate regularly.",
    tags: ["Data-backed", "Moderate pace", "No hints"],
    filledDots: 2,
    tone: "intermediate",
  },
  {
    level: "hard",
    label: "Advanced",
    icon: "🔥",
    description: "AI challenges every weak point, uses rebuttals and examples. Mimics a real trained debater.",
    tags: ["Rebuttals", "Fast pace", "Aggressive"],
    filledDots: 3,
    tone: "advanced",
  },
  {
    level: "expert",
    label: "Expert",
    icon: "💎",
    description: "AI argues at competition level with tighter logic, sharper cross-examination, and less hand-holding.",
    tags: ["Fallacy detection", "Cross-examine", "Elite"],
    filledDots: 4,
    tone: "expert",
  },
];

const roundOptions = [
  { value: 3, label: "~5 min" },
  { value: 5, label: "~10 min" },
  { value: 7, label: "~15 min" },
  { value: 10, label: "~20 min" },
];

function DifficultyPage({ user, onLogout, onStartDebate }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [rounds, setRounds] = useState(3);

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedTopic = localStorage.getItem("debateTopic");
    const savedPosition = localStorage.getItem("userPosition");
    
    if (!savedTopic || !savedPosition) {
      navigate("/", { replace: true });
      return;
    }

    setTopic(savedTopic);
    setPosition(savedPosition);
    
    const savedDifficulty = localStorage.getItem("debateDifficulty");
    if (savedDifficulty) setDifficulty(savedDifficulty);
    
    const savedRounds = localStorage.getItem("debateRounds");
    if (savedRounds) setRounds(Number(savedRounds));
  }, [navigate]);

  const startDebate = () => {
    localStorage.setItem("debateDifficulty", difficulty);
    localStorage.setItem("debateRounds", String(rounds));
    navigate("/debate");
  };

  return (
    <div className="difficulty-page-root">
      <Header user={user} onLogout={onLogout} currentStep="difficulty" onStartDebate={onStartDebate} />

      <main className="difficulty-container">
        <h1 className="difficulty-title">Select Difficulty Level</h1>
        
        <div className="topic-summary-pill">
          <span className="live-indicator"></span>
          <p className="topic-text">{topic}</p>
          <span className={`stance-badge ${position === 'for' ? 'for' : 'against'}`}>
            {position === 'for' ? 'FOR' : 'AGAINST'}
          </span>
        </div>

        <div className="difficulty-cards-grid">
          {difficultyCards.map((card) => (
            <div 
              key={card.level}
              className={`difficulty-card ${card.tone} ${difficulty === card.level ? 'active' : ''}`}
              onClick={() => setDifficulty(card.level)}
            >
              <div className="card-header">
                <h3 className="card-label">{card.label}</h3>
                <span className="card-icon">{card.icon}</span>
              </div>
              
              <div className="difficulty-meter">
                {[1, 2, 3, 4].map((dot) => (
                  <div key={dot} className={`meter-bar ${dot <= card.filledDots ? 'fill' : ''}`}></div>
                ))}
              </div>

              <p className="card-description">{card.description}</p>
              
              <div className="card-tags">
                {card.tags.map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounds-selection-box">
          <h4 className="rounds-title">NUMBER OF ROUNDS</h4>
          <div className="rounds-grid">
            {roundOptions.map((opt) => (
              <div 
                key={opt.value}
                className={`round-card ${rounds === opt.value ? 'active' : ''}`}
                onClick={() => setRounds(opt.value)}
              >
                <span className="round-count">{opt.value}</span>
                <span className="round-time">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="difficulty-actions">
           <button className={`btn-proceed ${difficulty}`} onClick={startDebate}>
             ENTER DEBATE ROOM <i className="fas fa-arrow-right" style={{ marginLeft: "6px", fontWeight: "900" }} />
           </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DifficultyPage;
