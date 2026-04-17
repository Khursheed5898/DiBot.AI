import React, { useEffect, useMemo, useState } from "react";

const POPULAR_TOPICS = [
  "Universal Basic Income is necessary for a modern economy",
  "Social media does more harm than good to society",
  "Artificial Intelligence will create more jobs than it destroys",
  "Climate change requires immediate government intervention",
  "Remote work is better than office work for productivity",
  "Cryptocurrency should replace traditional banking",
];

function DebateModal({ onClose, onSelect }) {
  const [view, setView] = useState("topics");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const canConfirmCustomTopic = customTopic.trim().length >= 10;
  const topicLabel = useMemo(
    () => (selectedTopic ? `"${selectedTopic}"` : '"Choose a topic first"'),
    [selectedTopic],
  );

  useEffect(() => {
    document.body.classList.add("modal-open");

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (view === "custom") {
          setView("topics");
          return;
        }

        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, view]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSelectedPosition("");
    setView("position");
  };

  const handleCustomTopicConfirm = () => {
    if (!canConfirmCustomTopic) {
      return;
    }

    handleTopicSelect(customTopic.trim());
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
  };

  const handleContinue = () => {
    if (!selectedTopic || !selectedPosition) {
      return;
    }

    onSelect(selectedTopic, selectedPosition);
  };

  return (
    <>
      <div
        className="modal-overlay active"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="modal-content"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Choose debate topic and position"
        >
          <div className="modal-body">
            {view === "topics" && (
              <div className="topic-section active">
                <div className="logos-header">
                  <h1>DiBot.AI✨</h1>
                  <p>
                    The Transparent AI Debate Partner
                    <br />
                    Sharpen your critical thinking through intelligent debate
                    practice
                  </p>
                </div>

                <div className="selection-container">
                  <h2>Choose Your Debate Topic</h2>

                  <div className="topics-header">
                    <span className="topics-label">Popular Topics</span>
                    <button
                      type="button"
                      className="custom-topic-btn"
                      onClick={() => setView("custom")}
                    >
                      Custom Topic
                    </button>
                  </div>

                  <div className="topics-grid">
                    {POPULAR_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        className={`topic-item${
                          selectedTopic === topic ? " selected" : ""
                        }`}
                        onClick={() => handleTopicSelect(topic)}
                      >
                        <span className="topic-text">{topic}</span>
                      </button>
                    ))}
                  </div>

                  <p className="selection-hint">
                    Select a topic to continue, or create your own custom
                    prompt.
                  </p>
                </div>
              </div>
            )}

            {view === "position" && (
              <div className="position-section active">
                <div className="selection-container">
                  <h2>Choose Your Position</h2>

                  <div className="current-topic-display">
                    <p>
                      Topic: <span id="selected-topic-text">{topicLabel}</span>
                    </p>
                  </div>

                  <div className="position-cards-container">
                    <button
                      type="button"
                      className={`position-card${
                        selectedPosition === "for" ? " selected" : ""
                      }`}
                      data-position="for"
                      onClick={() => handlePositionSelect("for")}
                    >
                      <h3>I'm FOR this position</h3>
                      <p>I will argue in support of this statement</p>
                    </button>

                    <button
                      type="button"
                      className={`position-card${
                        selectedPosition === "against" ? " selected" : ""
                      }`}
                      data-position="against"
                      onClick={() => handlePositionSelect("against")}
                    >
                      <h3>I'm AGAINST this position</h3>
                      <p>I will argue against this statement</p>
                    </button>
                  </div>

                  <div className="selection-actions">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setView("topics")}
                    >
                      Back to Topics
                    </button>
                    <button
                      type="button"
                      className="btn"
                      disabled={!selectedPosition}
                      onClick={handleContinue}
                    >
                      Continue to Difficulty Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`custom-topic-section${view === "custom" ? " active" : ""}`}
        onClick={() => setView("topics")}
        role="presentation"
      >
        <div
          className="selection-container"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Enter a custom topic"
        >
          <div className="logos-header">
            <h1>DiBot.AI</h1>
            <p>
              The Transparent AI Debate Partner
              <br />
              Sharpen your critical thinking through intelligent debate practice
            </p>
          </div>

          <h2>Enter your debate topic</h2>

          <div className="custom-topic-input">
            <textarea
              id="custom-topic-textarea"
              value={customTopic}
              onChange={(event) => setCustomTopic(event.target.value)}
              placeholder="e.g., Technology addiction is a serious problem in modern society"
              maxLength={200}
            />
            <div className="character-count">{customTopic.length}/200 characters</div>
          </div>

          <div className="selection-actions">
            <button
              type="button"
              className="back-btn"
              onClick={() => setView("topics")}
            >
              Back to Topics
            </button>
            <button
              type="button"
              className="btn"
              disabled={!canConfirmCustomTopic}
              onClick={handleCustomTopicConfirm}
            >
              Confirm Topic
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DebateModal;
