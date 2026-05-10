import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatArea({ 
  messages, 
  isAiTyping, 
  input, 
  setInput, 
  handleSendMessage, 
  handleInputKeyDown, 
  handleMicToggle, 
  isMicOn, 
  showEndModal, 
  round, 
  totalRounds, 
  messagesEndRef, 
  inputRef 
}) {
  return (
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
            <div className={`avatar ${message.role === "ai" ? "ai-av" : "user-av"}`}>
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
              <div className={`bubble-text ${message.role === "ai" ? "ai-bubble" : "user-bubble"}`}>
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
                {[...Array(6)].map((_, i) => <div key={i} className="wave-bar" />)}
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
            onClick={handleSendMessage}
            disabled={input.trim().length < 3 || isAiTyping || showEndModal}
          >
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
