import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDebate } from '../context/DebateContext';
import useSpeechToText from '../hooks/useSpeechToText';

// Helper: Typewriter Effect for AI Messages
function TypewriterMarkdown({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 3;
      if (index >= text.length) {
        setDisplayedText(text);
        if (onComplete) onComplete();
        window.clearInterval(intervalId);
      } else {
        setDisplayedText(text.slice(0, index));
      }
    }, 5);
    return () => window.clearInterval(intervalId);
  }, [text, onComplete]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>;
}

// Helper: Live Caption Writer for Live Mode
function LiveCaptionWriter({ text, color }) {
  const contentRef = useRef(null);
  return (
    <div className="live-caption-viewport" style={{ color: color }}>
      <div ref={contentRef} className="live-caption-content">
        {text}
      </div>
    </div>
  );
}

const DebateRoom = ({ onEndDebate }) => {
  const {
    topic, position, difficulty, round, setRound, totalRounds,
    messages, setMessages, isAiTyping, setIsAiTyping,
    updateScore, metrics, setMetrics, isPaused,
    isLiveMode, isMicOn, setIsMicOn,
    isConnected, sendMessage
  } = useDebate();

  const [input, setInput] = useState("");
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isListening, transcript, error, startListening, stopListening, setTranscript } = useSpeechToText({
    continuous: true,
    lang: 'hi-IN' // RESTORED: Universal Native Devnagri + English ear!
  });

  useEffect(() => {
    // Scroll only inside the messages container — never the whole page
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest(".messages-container") ||
        messagesEndRef.current.closest(".messages-list") ||
        messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isAiTyping]);

  // Handle Hard Errors (e.g. permissions blocked)
  useEffect(() => {
    if (error) {
      console.error("Hard mic error detected:", error);
      setIsMicOn(false);
      stopListening();
    }
  }, [error, stopListening, setIsMicOn]);

  // SMART Auto-Send on 2.5s Silence (Much more stable than browser native!)
  useEffect(() => {
    if (!isMicOn || !transcript.trim() || transcript.length <= 5) return;

    const silenceTimer = setTimeout(() => {
      console.log("User finished speaking (2.5s silence). Auto-sending...");
      void handleSendMessage(transcript);
      stopListening();
      setIsMicOn(false);
    }, 2500); // 2.5 seconds of stable silence

    return () => clearTimeout(silenceTimer);
  }, [transcript, isMicOn, stopListening]);

  const isFor = position === "for";
  const userColorHex = isFor ? "#10b981" : "#ef4444";
  const aiColorHex = isFor ? "#ef4444" : "#10b981";
  const aiColor = isFor ? "var(--danger)" : "var(--success)";

  const handleSendMessage = async (manualText = "") => {
    const userMessage = (manualText || input).trim();
    if (!userMessage || isAiTyping || !isConnected) return;

    const userEntry = { id: `user-${Date.now()}`, role: "user", content: userMessage };
    setMessages((current) => [...current, userEntry]);
    setInput("");
    setIsTypingEffect(true);

    // Calculate real-time analytics
    const words = userMessage.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const fillerWords = (userMessage.match(/\b(um|uh|ah|like|you know|so)\b/gi) || []).length;
    const wpm = Math.round((wordCount / 0.5)); // Simulated duration
    
    setMetrics({ 
      pace: `${wpm} wpm`, 
      filler: String(fillerWords), 
      clarity: fillerWords > 2 ? "Medium" : "High", 
      strength: wordCount > 20 ? "Strong" : "Good" 
    });

    updateScore('user', Math.min(15, Math.floor(wordCount / 5)));

    // Emit via WebSocket
    sendMessage({
      message: userMessage,
      topic,
      position,
      difficulty,
      round,
      totalRounds,
      history: [...messages, userEntry]
    });
  };

  const handleMicToggle = () => {
    if (isAiTyping || isTypingEffect) return;
    if (isMicOn) {
      stopListening();
      setIsMicOn(false);
      // Fallback: If user manually stops, send whatever they spoke
      if (transcript.trim().length > 5) {
        void handleSendMessage(transcript);
      }
    } else {
      setTranscript("");
      startListening();
      setIsMicOn(true);
    }
  };

  return (
    <div className="debate-room-content">
      {isLiveMode ? (
        <div className="live-debate-room">
          <div className="live-horizontal-split">
            {/* AI Persona */}
            <div className={`persona-container ${isAiTyping ? 'active' : ''}`} style={{ '--aura-color': aiColorHex }}>
              <div className="persona-label ai-brand-font" style={{ color: aiColorHex }}>DiBot.AI</div>
              <div className={`live-orb ${isAiTyping ? 'ai-speaking' : ''}`} />
              <div className="persona-stance">{isAiTyping ? "SPEAKING..." : "LISTENING..."}</div>
            </div>

            {/* User Persona */}
            <div className={`persona-container ${isMicOn ? 'active' : ''}`} style={{ '--aura-color': userColorHex }}>
              <div className="persona-label" style={{ color: userColorHex }}>You</div>
              <div className={`live-orb ${isMicOn ? 'user-speaking' : ''}`} />
              <div className="persona-stance" onClick={handleMicToggle}>
                {isMicOn ? "RECORDING..." : "YOUR TURN"}
              </div>
            </div>
          </div>

          <div className="live-captions">
            {isAiTyping ? (
              <LiveCaptionWriter text={messages[messages.length-1]?.content} color={aiColor} />
            ) : isMicOn ? (
              <span style={{ color: userColorHex }}>{transcript || "Speak now..."}</span>
            ) : "Ready for your argument"}
          </div>
        </div>
      ) : (
        <div className="chat-area">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`msg ${msg.role}`}>
                <div className="bubble">
                  <div className="bubble-meta">{msg.role === 'ai' ? 'DiBot.AI' : 'You'}</div>
                  <div className={`bubble-text ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
                    {msg.role === 'ai' && idx === messages.length - 1 && isTypingEffect ? (
                      <TypewriterMarkdown text={msg.content} onComplete={() => setIsTypingEffect(false)} />
                    ) : msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isAiTyping && <div className="typing-indicator"><span>.</span><span>.</span><span>.</span></div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-bar-container">
              <textarea
                ref={inputRef}
                value={isMicOn ? transcript : input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isMicOn ? "Listening..." : "Type your argument..."}
                disabled={isPaused || isAiTyping}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              />
              <button onClick={handleMicToggle} className={`mic-btn ${isMicOn ? 'active' : ''}`}>🎙️</button>
              <button onClick={() => handleSendMessage()} className="send-btn" disabled={isAiTyping}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateRoom;
