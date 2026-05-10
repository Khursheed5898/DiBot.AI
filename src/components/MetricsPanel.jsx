import React from 'react';
import { useDebate } from '../context/DebateContext';

const MetricsPanel = () => {
    const { 
        topic, position, difficulty, round, totalRounds, 
        yourScore, aiScore, metrics 
    } = useDebate();

    const progress = (round / totalRounds) * 100;
    const isFor = position === "for";

    return (
        <aside className="sidebar">
            {/* Topic Info */}
            <div className="sidebar-block">
                <div className="sidebar-label">DEBATE TOPIC</div>
                <div className="topic-text">{topic || "Loading Topic..."}</div>
                <div className={`position-tag ${position}`}>
                    {position === 'for' ? '✓ PRO' : '✕ AGAINST'}
                </div>
            </div>

            {/* Round & Difficulty */}
            <div className="sidebar-block">
                <div className="round-row">
                    <div className="sidebar-label">ROUND</div>
                    <div className="round-num">{round}<span className="round-total">/{totalRounds}</span></div>
                </div>
                <div className="round-progress">
                    <div className="round-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="metric-row" style={{ marginTop: '14px' }}>
                    <div className="sidebar-label">DIFFICULTY</div>
                    <div className="diff-badge">
                        <div className="diff-pip" />
                        {difficulty?.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Scores */}
            <div className="sidebar-block">
                <div className="sidebar-label">LIVE SCORING</div>
                <div className="score-row">
                    <div className="score-item">
                        <div className="score-lbl">YOU</div>
                        <div className="score-val you">{yourScore}</div>
                    </div>
                    <div className="score-vs">VS</div>
                    <div className="score-item">
                        <div className="score-lbl">DIBOT</div>
                        <div className="score-val ai">{aiScore}</div>
                    </div>
                </div>
            </div>

            {/* Real-time Analytics */}
            <div className="sidebar-block">
                <div className="sidebar-label">PERFORMANCE ANALYTICS</div>
                <div className="metric-row">
                    <div className="metric-name">Pace</div>
                    <div className="metric-val">{metrics.pace}</div>
                </div>
                <div className="metric-row">
                    <div className="metric-name">Filler Words</div>
                    <div className="metric-val ok">{metrics.filler}</div>
                </div>
                <div className="metric-row">
                    <div className="metric-name">Clarity</div>
                    <div className="metric-val good">{metrics.clarity}</div>
                </div>
                <div className="metric-row">
                    <div className="metric-name">Argument Strength</div>
                    <div className="metric-val">{metrics.strength}</div>
                </div>
            </div>
        </aside>
    );
};

export default MetricsPanel;
