import React from 'react';

const TopicSelector = ({ selectedTopic, onSelectTopic, selectedPosition, onSelectPosition }) => {
  const topics = [
    { id: "ai-future", title: "AI will eventually replace all human labor.", category: "Technology" },
    { id: "climate-action", title: "Nuclear energy is essential to solve climate change.", category: "Environment" },
    { id: "social-media", title: "Social media has done more harm than good for society.", category: "Society" },
    { id: "space-exploration", title: "Space exploration is a waste of resources.", category: "Science" }
  ];

  return (
    <div className="topic-selector-container">
      <div className="topic-grid">
        {topics.map((t) => (
          <div 
            key={t.id} 
            className={`topic-card ${selectedTopic === t.title ? 'active' : ''}`}
            onClick={() => onSelectTopic(t.title)}
          >
            <div className="topic-category">{t.category}</div>
            <div className="topic-title">{t.title}</div>
          </div>
        ))}
      </div>

      <div className="position-selector">
        <button 
          className={`pos-btn for ${selectedPosition === 'for' ? 'active' : ''}`}
          onClick={() => onSelectPosition('for')}
        >
          ✓ AGREE (FOR)
        </button>
        <button 
          className={`pos-btn against ${selectedPosition === 'against' ? 'active' : ''}`}
          onClick={() => onSelectPosition('against')}
        >
          ✕ DISAGREE (AGAINST)
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;
