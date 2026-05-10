import React from "react";

function Sidebar({ topic, position, round, totalRounds, yourScore, aiScore, metrics, difficultyLabel }) {
  return (
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
          <span className={`metric-val${metrics.filler === "2" ? " ok" : " good"}`}>
            {metrics.filler}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-name">Clarity</span>
          <span className={`metric-val${metrics.clarity === "Medium" ? " ok" : " good"}`}>
            {metrics.clarity}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-name">Argument strength</span>
          <span className={`metric-val${metrics.strength === "Good" ? " ok" : " good"}`}>
            {metrics.strength}
          </span>
        </div>
      </div>

      <div className="sidebar-block">
        <div className="sidebar-label">Difficulty</div>
        <div className="diff-badge">
          <div className="diff-pip" />
          {difficultyLabel}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
