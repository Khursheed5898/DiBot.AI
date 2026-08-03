import React, { useEffect, useState } from "react";
import "../styles/DebateModal.css";

const trendingTopics = [
  "Universal Basic Income is necessary for a modern economy",
  "Mandatory voting should be enforced in all democracies",
  "Social media does more harm than good to society",
  "Online education is more effective than traditional schooling",
  "Artificial Intelligence will create more jobs than it destroys",
  "Genetic engineering of humans should be permitted for medical use",
  "Climate change requires immediate government intervention",
  "Social media influencers have more impact than traditional media",
  "Remote work is better than office work for productivity",
  "Capitalism is the best economic system for human progress",
];

function DebateModal({ onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [step, setStep] = useState(1); // 1: Topic, 2: Position

  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setStep(2);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customTopic.trim()) {
      setSelectedTopic(customTopic.trim());
      setStep(2);
    }
  };

  const handlePositionSelect = (position) => {
    onSelect(selectedTopic, position);
  };

  return (
    <div className="debate-modal-overlay active" onClick={onClose}>
      <div className="debate-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="debate-modal-close" onClick={onClose}>&times;</button>
        
        {step === 1 ? (
          <div className="topic-selection-view">
            <div className="modal-logo-area">
              <span className="modal-dibot-logo">DiBot.AI✨</span>
            </div>
            <h1 className="modal-main-title">CHOOSE YOUR TOPIC</h1>
            
            <div className="tab-container">
              <button 
                className={`tab-btn trending ${activeTab === 'trending' ? 'active' : ''}`}
                onClick={() => setActiveTab('trending')}
              >
                TRENDING TOPICS
              </button>
              <button 
                className={`tab-btn custom ${activeTab === 'custom' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom')}
              >
                CUSTOM TOPIC
              </button>
            </div>

            <div className="topic-scroll-container">
              {activeTab === 'trending' ? (
                <div className="trending-grid">
                  {trendingTopics.map((topic, index) => (
                    <div 
                      key={index} 
                      className="trending-topic-card"
                      onClick={() => handleTopicClick(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="custom-topic-view">
                  <form onSubmit={handleCustomSubmit} className="custom-topic-form">
                    <p className="custom-hint">Type any subject or claim you want to debate about.</p>
                    <textarea 
                      placeholder="e.g. Is space exploration worth the cost?" 
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-premium">
                      Continue with this Topic
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="position-selection-view fade-in">
            <button className="debate-modal-back-top" onClick={() => setStep(1)}>
              Back
            </button>
            <div className="modal-logo-area">
              <span className="modal-dibot-logo">DiBot.AI✨</span>
            </div>
            <h2 className="selected-topic-display">"{selectedTopic}"</h2>
            <h3 className="position-prompt">What is your stance?</h3>
            
            <div className="position-buttons">
              <button 
                className="pos-btn for" 
                onClick={() => handlePositionSelect('for')}
              >
                <span className="pos-icon">✓</span>
                <span className="pos-text">I AGREE</span>
                <span className="pos-subtext">Defend this claim</span>
              </button>
              <button 
                className="pos-btn against" 
                onClick={() => handlePositionSelect('against')}
              >
                <span className="pos-icon">✕</span>
                <span className="pos-text">I DISAGREE</span>
                <span className="pos-subtext">Challenge this claim</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebateModal;
