import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendMessageToAI, startDebateSession } from "../services/api";

const roundDurations = {
  3: 300,
  5: 600,
  7: 900,
  10: 1200,
};

const difficultyLabels = {
  easy: "Beginner",
  medium: "Intermediate",
  hard: "Advanced",
  expert: "Expert",
};

const metricSamples = [
  { pace: "118 wpm", filler: "1", clarity: "High", strength: "Strong" },
  { pace: "132 wpm", filler: "0", clarity: "Very High", strength: "Excellent" },
  { pace: "104 wpm", filler: "2", clarity: "Medium", strength: "Good" },
  { pace: "141 wpm", filler: "1", clarity: "High", strength: "Strong" },
];

function DebatePage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalRounds, setTotalRounds] = useState(3);
  const [round, setRound] = useState(1);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [yourScore, setYourScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [metrics, setMetrics] = useState({
    pace: "—",
    filler: "—",
    clarity: "—",
    strength: "—",
  });

  useEffect(() => {
    const savedTopic = localStorage.getItem("debateTopic");
    const savedPosition = localStorage.getItem("userPosition");
    const savedDifficulty = localStorage.getItem("debateDifficulty") || "medium";
    const savedRounds = Number(localStorage.getItem("debateRounds")) || 3;

    if (!savedTopic || !savedPosition) {
      navigate("/", { replace: true });
      return;
    }

    setTopic(savedTopic);
    setPosition(savedPosition);
    setDifficulty(savedDifficulty);
    setTotalRounds(savedRounds);
    setTimeLeft(roundDurations[savedRounds] || 300);

    let isMounted = true;

    startDebateSession(savedTopic, savedPosition, savedDifficulty).then(
      (opening) => {
        if (!isMounted) {
          return;
        }

        setMessages([
          {
            id: "opening",
            role: "ai",
            content: opening,
          },
        ]);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (showEndModal || !topic) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setShowEndModal(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [showEndModal, topic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const timerClassName =
    timeLeft <= 30 ? "timer danger" : timeLeft <= 120 ? "timer warn" : "timer";

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(
    2,
    "0",
  )}:${String(timeLeft % 60).padStart(2, "0")}`;

  const addMetricSample = () => {
    const sample = metricSamples[Math.floor(Math.random() * metricSamples.length)];
    setMetrics(sample);
  };

  const handleMicToggle = () => {
    if (showEndModal) {
      return;
    }

    if (isMicOn) {
      setIsMicOn(false);
      return;
    }

    setIsMicOn(true);

    window.setTimeout(() => {
      setInput(
        "A reliable safety net gives people room to keep learning, change careers, and stay economically active during disruption.",
      );
      setIsMicOn(false);
      inputRef.current?.focus();
    }, 2200);
  };

  const handleSendMessage = async () => {
    const userMessage = input.trim();

    if (!userMessage || isAiTyping || showEndModal) {
      return;
    }

    const userEntry = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };

    setMessages((current) => [...current, userEntry]);
    setInput("");
    setIsAiTyping(true);
    addMetricSample();
    setYourScore((current) => current + Math.floor(Math.random() * 8) + 12);

    try {
      const reply = await sendMessageToAI({
        message: userMessage,
        topic,
        position,
        difficulty,
        round,
        totalRounds,
      });

      setMessages((current) => [
        ...current,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: reply,
        },
      ]);

      setAiScore((current) => current + Math.floor(Math.random() * 6) + 10);

      if (round >= totalRounds) {
        setShowEndModal(true);
      } else {
        setRound((current) => current + 1);
      }
    } finally {
      setIsAiTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const restartDebate = () => {
    navigate("/difficulty");
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="debate-page">
      <nav className="debate-nav">
        <button type="button" className="debate-logo" onClick={goHome}>
          DiBot.AI
        </button>

        <div className="nav-meta">
          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
          <div className={timerClassName}>{formattedTime}</div>
          <button
            type="button"
            className="end-btn"
            onClick={() => setShowEndModal(true)}
          >
            End Debate
          </button>
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-block">
            <div className="sidebar-label">Topic</div>
            <div className="topic-text">{topic}</div>
            <div className="position-tag">✓ {position.toUpperCase()}</div>
          </div>

          <div className="sidebar-block">
            <div className="sidebar-label">Round</div>
            <div className="round-row">
              <div className="round-num">{round}</div>
              <div className="round-total">of {totalRounds}</div>
            </div>
            <div className="round-progress">
              <div
                className="round-fill"
                style={{ width: `${(round / totalRounds) * 100}%` }}
              />
            </div>
          </div>

          <div className="sidebar-block">
            <div className="sidebar-label">Score</div>
            <div className="score-row">
              <div className="score-item">
                <div className="score-val you">{yourScore}</div>
                <div className="score-lbl">You</div>
              </div>
              <div className="score-vs">vs</div>
              <div className="score-item">
                <div className="score-val ai">{aiScore}</div>
                <div className="score-lbl">AI</div>
              </div>
            </div>
          </div>

          <div className="sidebar-block">
            <div className="sidebar-label">Live Metrics</div>
            <div className="metric-row">
              <span className="metric-name">Pace</span>
              <span className="metric-val good">{metrics.pace}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Filler words</span>
              <span
                className={`metric-val${
                  metrics.filler === "2" ? " ok" : " good"
                }`}
              >
                {metrics.filler}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Clarity</span>
              <span
                className={`metric-val${
                  metrics.clarity === "Medium" ? " ok" : " good"
                }`}
              >
                {metrics.clarity}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Argument strength</span>
              <span
                className={`metric-val${
                  metrics.strength === "Good" ? " ok" : " good"
                }`}
              >
                {metrics.strength}
              </span>
            </div>
          </div>

          <div className="sidebar-block">
            <div className="sidebar-label">Difficulty</div>
            <div className="diff-badge">
              <div className="diff-pip" />
              {difficultyLabels[difficulty] || "Intermediate"}
            </div>
          </div>
        </aside>

        <div className="chat-area">
          <div className="messages">
            <div className="round-sep">
              <div className="round-sep-line" />
              <div className="round-sep-label">
                Round {Math.min(round, totalRounds)} of {totalRounds}
              </div>
              <div className="round-sep-line" />
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`msg ${message.role}`}>
                <div
                  className={`avatar ${
                    message.role === "ai" ? "ai-av" : "user-av"
                  }`}
                >
                  {message.role === "ai" ? "AI" : "U"}
                </div>
                <div className="bubble">
                  <div className="bubble-meta">
                    {message.role === "ai"
                      ? "DiBot.AI"
                      : new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </div>
                  <div
                    className={`bubble-text ${
                      message.role === "ai" ? "ai-bubble" : "user-bubble"
                    }`}
                  >
                    {message.role === "ai" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="msg ai">
                <div className="avatar ai-av">AI</div>
                <div className="bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-meta">
              <div className="round-indicator">
                Round {Math.min(round, totalRounds)} of {totalRounds}
                {showEndModal ? " · Debate complete" : isAiTyping ? " · AI is responding" : " · Your turn to speak"}
              </div>
              <div className="char-count">{input.length} / 500</div>
            </div>

            <div className="input-row">
              <button
                type="button"
                className={`mic-btn${isMicOn ? " recording" : ""}`}
                onClick={handleMicToggle}
                disabled={showEndModal}
                title="Toggle voice input"
              >
                {isMicOn ? (
                  <div className="waveform">
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                  </div>
                ) : (
                  "🎤"
                )}
              </button>

              <textarea
                ref={inputRef}
                className="input-box"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your argument here, or use the mic to speak..."
                maxLength={500}
                disabled={showEndModal}
              />

              <button
                type="button"
                className="send-btn"
                onClick={() => void handleSendMessage()}
                disabled={input.trim().length < 3 || isAiTyping || showEndModal}
              >
                Send →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEndModal && (
        <div className="end-modal-overlay">
          <div className="end-modal-card">
            <div className="end-modal-icon">
              {yourScore >= aiScore ? "🏆" : "🤖"}
            </div>
            <div
              className={`end-modal-status ${
                yourScore >= aiScore ? "win" : "lose"
              }`}
            >
              {yourScore >= aiScore
                ? "DEBATE COMPLETE · YOU WON"
                : "DEBATE COMPLETE · AI WINS"}
            </div>
            <div className="end-modal-title">
              {yourScore >= aiScore ? "Well Argued!" : "Keep Practicing!"}
            </div>
            <div className="end-modal-copy">
              {yourScore >= aiScore
                ? "Your arguments held up better across the exchange."
                : "The rebuttals were tougher this round, but your next attempt will be sharper."}
            </div>

            <div className="end-modal-scores">
              <div>
                <div className="end-score you">{yourScore}</div>
                <div className="end-score-label">Your Score</div>
              </div>
              <div className="end-divider" />
              <div>
                <div className="end-score ai">{aiScore}</div>
                <div className="end-score-label">AI Score</div>
              </div>
            </div>

            <div className="end-modal-actions">
              <button type="button" className="btn-start" onClick={goHome}>
                Back to Home
              </button>
              <button
                type="button"
                className="btn-back secondary"
                onClick={restartDebate}
              >
                Debate Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebatePage;
