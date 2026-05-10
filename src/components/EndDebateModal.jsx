import React from "react";

function EndDebateModal({ yourScore, aiScore, onRestart, onGoHome }) {
  const won = yourScore >= aiScore;

  return (
    <div className="end-modal-overlay">
      <div className="end-modal-card">
        <div className="end-modal-icon">
          {won ? "🏆" : "🤖"}
        </div>
        <div className={`end-modal-status ${won ? "win" : "lose"}`}>
          {won ? "DEBATE COMPLETE · YOU WON" : "DEBATE COMPLETE · AI WINS"}
        </div>
        <div className="end-modal-title">
          {won ? "Well Argued!" : "Keep Practicing!"}
        </div>
        <div className="end-modal-copy">
          {won
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

        <div className="end-modal-actions" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button type="button" className="btn btn-primary" onClick={onGoHome} style={{ width: "100%", height: "48px" }}>
            Back to Home
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRestart}
            style={{ width: "100%", height: "48px" }}
          >
            Debate Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndDebateModal;
