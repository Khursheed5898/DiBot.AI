import React from "react";
import "../styles/RoomSelectionModal.css";

function RoomSelectionModal({ isOpen, onClose, onSelectMode, topic, position, difficulty }) {
  if (!isOpen) return null;

  return (
    <div className="room-modal-overlay active" onClick={onClose}>
      <div className="room-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="room-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="room-modal-header">
          <div className="modal-logo-area">
            <span className="modal-dibot-logo">DiBot.AI✨</span>
          </div>
          <h2 className="room-modal-title">CHOOSE YOUR ARENA MODE</h2>
          <p className="room-modal-subtitle">
            Select how you would like to experience your debate
          </p>
        </div>

        <div className="room-options-grid">
          {/* Option 1: Text Chatroom Mode */}
          <div
            className="room-card chat-card"
            onClick={() => onSelectMode("chat")}
          >
            <div className="room-icon-wrapper chat-icon">
              <i className="fas fa-comments"></i>
            </div>
            <h3 className="room-card-title">TEXT CHATROOM</h3>
            <p className="room-card-desc">
              Classic structured debate with detailed markdown reasoning and quick messaging.
            </p>
            <div className="feature-tags-row">
              <span className="ft-tag">💬 Text Chat</span>
              <span className="ft-tag">📝 Markdown</span>
              <span className="ft-tag">⚡ Fast Turn</span>
            </div>
            <div className="room-card-footer chat-footer">
              <span>ENTER CHATROOM</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>

          {/* Option 2: Virtual Live Debate Room Mode */}
          <div
            className="room-card live-card"
            onClick={() => onSelectMode("live")}
          >
            <div className="room-icon-wrapper live-icon">
              <i className="fas fa-user-astronaut"></i> {/* Face-to-Face 2-Way AI Voice Avatar */}
            </div>
            <h3 className="room-card-title">VIRTUAL LIVE ROOM</h3>
            <p className="room-card-desc">
              Interactive 2-way real-time voice speech, animated avatars & live captions stage.
            </p>
            <div className="feature-tags-row">
              <span className="ft-tag live-tag">🎙️ 2-Way Voice</span>
              <span className="ft-tag live-tag">🎭 Avatar Stage</span>
              <span className="ft-tag live-tag">📡 Live Captions</span>
            </div>
            <div className="room-card-footer live-footer">
              <span>ENTER LIVE ARENA</span>
              <i className="fas fa-bolt"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomSelectionModal;
