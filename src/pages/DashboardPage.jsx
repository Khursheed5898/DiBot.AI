import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const stats = [
    { label: 'SESSIONS PLAYED', value: '7', color: '#3b82f6' },
    { label: 'AVG. CONFIDENCE', value: '75%', color: '#ffffff' },
    { label: 'GLOBAL RANK', value: '#124', color: '#10b981' },
    { label: 'DEBATE STREAK', value: '3 Days', color: '#ffffff' },
  ];

  const history = [
    { id: 1, topic: 'AI Ethics in Warfare', date: '2024-04-22', score: 85, result: 'WIN' },
    { id: 2, topic: 'Universal Basic Income', date: '2024-04-20', score: 72, result: 'WIN' },
    { id: 3, topic: 'Space Colonization Priority', date: '2024-04-18', score: 64, result: 'LOSS' },
    { id: 4, topic: 'Genetic Engineering Ethics', date: '2024-04-15', score: 78, result: 'WIN' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <Link to="/" className="btn-back">
          <span className="arrow">←</span> BACK TO HOME
        </Link>
        <div className="header-main">
          <div className="header-text">
            <h1 className="dashboard-title">Performance <span className="highlight">Dashboard</span></h1>
            <p className="welcome-msg">Welcome back, <span className="user-name">Avid101</span>. Here is your debate logic analysis.</p>
          </div>
          <div className="xp-card">
            <span className="xp-label">TOTAL XP</span>
            <span className="xp-value">750</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="chart-card line-chart-container">
          <h3 className="chart-title">Logic Efficiency & Confidence</h3>
          <div className="chart-placeholder line-chart">
            {/* Simple SVG Line Chart Mock */}
            <svg viewBox="0 0 400 200" className="svg-chart">
              <path 
                d="M0 150 Q 50 120, 100 130 T 200 80 T 300 110 T 400 50" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3"
              />
              <path 
                d="M0 150 Q 50 120, 100 130 T 200 80 T 300 110 T 400 50 V 200 H 0 Z" 
                fill="url(#grad1)" 
                opacity="0.2"
              />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
            </svg>
            <div className="chart-labels">
              <span>Session 1</span>
              <span>Session 3</span>
              <span>Session 5</span>
              <span>Session 7</span>
            </div>
          </div>
        </div>

        <div className="chart-card donut-chart-container">
          <h3 className="chart-title">Topic Mastery Distribution</h3>
          <div className="chart-content">
            <div className="donut-mock">
              <svg viewBox="0 0 100 100" className="svg-donut">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="180 251" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-180" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="40 251" strokeDashoffset="-240" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray="20 251" strokeDashoffset="-280" />
              </svg>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><span className="dot phil"></span> PHILOSOPHY</div>
              <div className="legend-item"><span className="dot poli"></span> POLITICS</div>
              <div className="legend-item"><span className="dot scien"></span> SCIENCE</div>
              <div className="legend-item"><span className="dot ethic"></span> ETHICS</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="history-section">
        <h3 className="section-title">Debate History</h3>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>TOPIC</th>
                <th>DATE</th>
                <th>SCORE</th>
                <th>RESULT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="history-row">
                  <td className="topic-name">{item.topic}</td>
                  <td className="date">{item.date}</td>
                  <td className="score">
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${item.score}%` }}></div>
                    </div>
                    {item.score}
                  </td>
                  <td className={`result ${item.result.toLowerCase()}`}>{item.result}</td>
                  <td>
                    <button className="btn-view">View Analysis</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
