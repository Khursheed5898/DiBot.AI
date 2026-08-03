import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/DashboardPage.css';

import { getDebateHistory } from '../services/api';

const DashboardPage = ({ user }) => {
  const [loading, setLoading] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(null);
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getDebateHistory();
        setAnalytics(data);
        // Sort history by date descending (newest first)
        if (data && data.performanceHistory) {
          const sorted = [...data.performanceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(sorted);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Calculate dynamic derived stats
  const averageScore = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + (h.score || 0), 0) / history.length) 
    : 0;

  // Calculate dynamic pseudo-random Global Rank based on user's performance
  const calculateGlobalRank = () => {
    if (history.length === 0) return "#---";
    
    // Performance impact: base rank correlates inversely with average score (higher score = lower/better rank)
    const baseRank = 12000 - (averageScore * 110); // 0 score -> 12k, 100 score -> 1k
    
    // Volume impact: Discount up to 1000 rank points based on total debates played
    const experienceBonus = Math.min(1000, history.length * 75);
    
    // Add a deterministic stable variance so the rank feels alive and organic but doesn't flicker on rerenders
    const seed = (averageScore * 13) + (history.length * 47);
    const naturalVariance = (seed % 357) - 178; // Stable offset between -178 and +178
    
    let finalRank = Math.round(baseRank - experienceBonus + naturalVariance);
    
    // Floor threshold: ensure minimum rank of #24 to reserve elite slots
    if (finalRank < 24) finalRank = 24 + (seed % 5); 

    return `#${finalRank.toLocaleString()}`;
  };

  const stats = [
    { label: 'SESSIONS PLAYED', value: analytics?.sessionsPlayed || history.length || '0', color: '#3b82f6' },
    { label: 'AVG. CONFIDENCE', value: `${averageScore}%`, color: '#ffffff' },
    { label: 'GLOBAL RANK', value: calculateGlobalRank(), color: '#10b981' },
    { label: 'LAST ACTIVE', value: analytics?.lastActive ? new Date(analytics.lastActive).toLocaleDateString() : 'Today', color: '#ffffff' },
  ];

  const userName = user?.username || user?.name || "Debater";
  
  // Safe Date Formatter
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${date} • ${time}`;
    } catch (e) { return dateStr; }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
        <h2 style={{color: 'white'}}>Loading your metrics...</h2>
      </div>
    );
  }

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
            <p className="welcome-msg">Welcome back, <span className="user-name">{userName}</span>. Here is your debate logic analysis.</p>
          </div>
          <div className="xp-card">
            <span className="xp-label">TOTAL XP</span>
            <span className="xp-value">{analytics?.totalXp || (history.length * 100)}</span>
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
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign:'center', padding:'2rem', color:'rgba(255,255,255,0.5)'}}>
                    No debates played yet. Start your first debate!
                  </td>
                </tr>
              ) : (
                history.map((item, index) => (
                  <tr key={index} className="history-row">
                    <td className="topic-name">{item.topic}</td>
                    <td className="date">{formatDate(item.date)}</td>
                    <td className="score">
                      <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{ width: `${item.score || 0}%` }}></div>
                      </div>
                      {item.score || 0}
                    </td>
                    <td className={`result ${(item.score || 0) >= 50 ? 'win' : 'loss'}`}>
                      {(item.score || 0) >= 50 ? 'WIN' : 'LOSS'}
                    </td>
                    <td>
                      <button className="btn-view">View Analysis</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
