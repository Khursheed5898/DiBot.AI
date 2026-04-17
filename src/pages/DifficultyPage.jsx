import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const difficultyCards = [
  {
    level: "easy",
    label: "Beginner",
    icon: "🌱",
    description:
      "AI gives simple counter-arguments with basic reasoning. Ideal for first-time debaters building confidence.",
    tags: ["Simple logic", "Slow pace", "Hints available"],
    filledDots: 1,
    tone: "easy",
  },
  {
    level: "medium",
    label: "Intermediate",
    icon: "⚡",
    description:
      "AI uses facts, data, and structured arguments. Good for students who debate regularly.",
    tags: ["Data-backed", "Moderate pace", "No hints"],
    filledDots: 2,
    tone: "medium",
  },
  {
    level: "hard",
    label: "Advanced",
    icon: "🔥",
    description:
      "AI challenges every weak point, uses rebuttals and examples. Mimics a real trained debater.",
    tags: ["Rebuttals", "Fast pace", "Aggressive"],
    filledDots: 3,
    tone: "hard",
  },
  {
    level: "expert",
    label: "Expert",
    icon: "💎",
    description:
      "AI argues at competition level with tighter logic, sharper cross-examination, and less hand-holding.",
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

function DifficultyPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [rounds, setRounds] = useState(3);

  useEffect(() => {
    const savedTopic = localStorage.getItem("debateTopic");
    const savedPosition = localStorage.getItem("userPosition");
    const savedDifficulty = localStorage.getItem("debateDifficulty") || "";
    const savedRounds = Number(localStorage.getItem("debateRounds")) || 3;

    if (!savedTopic || !savedPosition) {
      navigate("/", { replace: true });
      return;
    }

    setTopic(savedTopic);
    setPosition(savedPosition);
    setDifficulty(savedDifficulty);
    setRounds(savedRounds);
  }, [navigate]);

  const startDebate = () => {
    if (!difficulty) {
      return;
    }

    localStorage.setItem("debateDifficulty", difficulty);
    localStorage.setItem("debateRounds", String(rounds));
    navigate("/debate");
  };

  return (
    <div className="setup-page">
      <nav className="setup-nav">
        <button
          type="button"
          className="setup-logo"
          onClick={() => navigate("/")}
        >
          DiBot.AI✨
        </button>

        <div className="setup-nav-links">
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>
          <button type="button" onClick={() => navigate("/", { replace: true })}>
            Topics
          </button>
        </div>

        <button
          type="button"
          className="setup-nav-cta"
          onClick={() => navigate("/")}
        >
          Back Home
        </button>
      </nav>

      <div className="breadcrumb">
        <span>Topics</span>
        <span className="sep">›</span>
        <span>Position</span>
        <span className="sep">›</span>
        <span className="active">Difficulty</span>
        <span className="sep">›</span>
        <span>Debate</span>
      </div>

      <main className="setup-main">
        <div className="topic-pill">
          <span className="dot" />
          <span>{topic}</span>
          <span className="position-badge">{position.toUpperCase()}</span>
        </div>

        <h1>Select Difficulty Level</h1>
        <p className="subtitle">
          Choose how challenging you want your AI debate partner to be.
          <br />
          You can always change this later.
        </p>

        <div className="cards">
          {difficultyCards.map((card) => (
            <button
              key={card.level}
              type="button"
              className={`card ${card.tone}${
                difficulty === card.level ? " selected" : ""
              }`}
              onClick={() => setDifficulty(card.level)}
            >
              <div className="card-top">
                <span className="diff-label">{card.label}</span>
                <div className="diff-icon">{card.icon}</div>
              </div>

              <div className="dots">
                {[1, 2, 3, 4].map((dot) => (
                  <div
                    key={dot}
                    className={`dot-block${
                      dot <= card.filledDots ? " fill" : ""
                    }`}
                  />
                ))}
              </div>

              <p className="card-desc">{card.description}</p>

              <div className="tags">
                {card.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="round-section">
          <div className="round-label">Number of Rounds</div>
          <div className="round-options">
            {roundOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`round-btn${rounds === option.value ? " active" : ""}`}
                onClick={() => setRounds(option.value)}
              >
                {option.value}
                <div className="round-sub">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate("/")}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-start"
            disabled={!difficulty}
            onClick={startDebate}
          >
            {difficulty
              ? `Start ${
                  difficultyCards.find((card) => card.level === difficulty)?.label
                } Debate →`
              : "Choose a difficulty to continue →"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default DifficultyPage;
