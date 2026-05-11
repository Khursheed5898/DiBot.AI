import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "../styles/DebatePage.css";
import { startDebateSession, sendMessageToAI, endDebateSession } from "../services/api.js";

const TypewriterMessage = ({ text, onComplete, onUpdate }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        
        // Internal Scroll for bubble
        if (containerRef.current) {
          const bubble = containerRef.current.closest('.ai-bubble');
          if (bubble) {
            bubble.scrollTop = bubble.scrollHeight;
          }
        }

        if (onUpdate) onUpdate(); // Trigger global scroll
      }, 15);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete, onUpdate]);

  return (
    <div className="markdown-content" ref={containerRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedText + (currentIndex < text.length ? " |" : "")}
      </ReactMarkdown>
    </div>
  );
};

const scrollToBottom = (ref) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: "auto", block: "end" });
    // Force container scroll if ref is inside
    const container = ref.current.closest('.messages-list');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
};

function DebatePage({ user, onLogout, onStartDebate }) {
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(1200); // 20:00
  const [round, setRound] = useState(1);
  const [isLive, setIsLive] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [displayScores, setDisplayScores] = useState({ logic: 0, persuasion: 0, userPts: 0, aiPts: 0 });
  const [activeSpeaker, setActiveSpeaker] = useState('user'); // 'user' or 'ai'
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveCaption, setLiveCaption] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [suggestedArgs, setSuggestedArgs] = useState([]);
  
  const sampleArguments = {
    user: [
      "I strongly argue that AI in education allows for personalized learning paths that traditional systems simply cannot match. By utilizing adaptive algorithms, we tailor content to individual student needs, ensuring no one is left behind. This isn't just about efficiency; it's about fundamental equity in the learning process.",
      "Furthermore, the accessibility of global knowledge through digital platforms democratizes education for students in remote areas. Digital integration breaks geographical barriers, providing remote students with the same high-level resources as those in major cities. We are witnessing the true democratization of intelligence.",
      "Logic dictates that as we move into a tech-driven future, our educational foundations must evolve to remain relevant. If schools remain static while the world undergoes a digital revolution, we fail future generations. We must teach students how to interact with the very tools that will define their careers."
    ],
    ai: [
      "While personalization is valuable, we must consider the loss of critical social interaction that only human educators provide. A machine can optimize a path, but it cannot inspire or understand the complex emotional nuances that block a student's progress. True education is a human endeavor that requires a mentor's soul.",
      "Accessibility is key, but the digital divide still poses a massive threat to equity, leaving many students behind. Without stable infrastructure and internet, the 'democratization' you speak of remains a distant dream for millions, potentially widening the gap between the privileged and the marginalized.",
      "Relevance is important, but a purely technical education neglects the philosophical foundations of traditional learning. By focusing heavily on efficiency, we risk producing skilled technicians who lack the critical thinking required to use tools responsibly. We must ensure 'digital' does not overshadow 'human' in humanities."
    ]
  };

  const [argIndex, setArgIndex] = useState(0);
  const chatEndRef = useRef(null);
  const captionEndRef = useRef(null);
  const voicesRef = useRef([]);

  // Voice Engine Setup
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text, role, onComplete) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean text for speech synthesis (strip markdown and emojis)
    const cleanText = text
      .replace(/[#*`_~]/g, '') // Remove markdown symbols
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = voicesRef.current;

    if (role === 'ai') {
      // Prioritize more natural sounding voices
      const aiVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.name.includes('Aria') || v.name.includes('Guy')) || 
                      voices.find(v => v.name.includes('Google UK English Male') || v.lang.startsWith('en')) || 
                      voices[0];
      utterance.voice = aiVoice;
      utterance.pitch = 0.95; // Less robotic, slightly deeper but conversational
      utterance.rate = 0.92;  // Slightly relaxed pace for natural feel
      utterance.volume = 1.0;
    } else {
      const humanVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Microsoft Zira') || v.name.includes('Zira')) || 
                         voices.find(v => v.lang.startsWith('en')) || 
                         voices[0];
      utterance.voice = humanVoice;
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      utterance.volume = 1.0;
    }

    // Sync Caption with Voice
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const currentText = text.slice(0, event.charIndex + event.charLength);
        setLiveCaption(currentText);
      }
    };

    utterance.onend = () => {
      setLiveCaption(text); // Force full caption at end
      if (onComplete) {
        // Small buffer to ensure browser has actually finished audio output
        setTimeout(onComplete, 500);
      }
    };

    // Fallback for browsers where onend might fail
    utterance.onerror = (event) => {
      console.error("Speech Error:", event);
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Auto-scroll captions
  useEffect(() => {
    if (captionEndRef.current) {
      captionEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveCaption, activeSpeaker]);

  const handleLiveTurn = async (userAudioText) => {
    if (!userAudioText || isAiThinking) return;
    
    // 1. Add User Message to History
    const userMsg = {
      id: Date.now(),
      sender: "You",
      role: "user",
      content: userAudioText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTranscribing(false);
    setActiveSpeaker('ai');
    setIsAiThinking(true);

    try {
      // 2. Fetch Real AI Response
      const reply = await sendMessageToAI({
        message: userAudioText,
        topic,
        position,
        difficulty,
        round,
        totalRounds: 5,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      setIsAiThinking(false);
      
      // 3. AI Speaks + Generates Captions
      speakText(reply, 'ai', () => {
        // 4. Add AI Message to History after speaking
        const aiMsg = {
          id: Date.now() + 1,
          sender: "DiBot.AI",
          role: "ai",
          content: reply,
          isNew: false // No typewriter in Virtual Room, use captions
        };
        setMessages(prev => [...prev, aiMsg]);
        setActiveSpeaker('user');
        setLiveCaption("");
      });
    } catch (err) {
      console.error("Live AI Error:", err);
      setIsAiThinking(false);
      setActiveSpeaker('user');
    }
  };

  const startSmartTurn = () => {
    if (activeSpeaker !== 'user' || isTranscribing) return;

    // 1. Get user input (from chat or fallback)
    let inputToUse = "";
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    
    if (lastUserMsg) {
      inputToUse = lastUserMsg.content;
    } else {
      // GENERATE TOPIC-BASED FALLBACKS
      const fallbacks = [
        `How can we justify the current stance on ${topic} given the logical inconsistencies?`,
        `What is the most compelling evidence that supports the ${position.toUpperCase()} side of ${topic}?`,
        `If we look at the long-term impact of ${topic}, why is our position the only sustainable one?`,
        `How does the opponent address the moral implications of ${topic}?`
      ];
      inputToUse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // 2. Start transcription effect
    setIsTranscribing(true);
    let charIdx = 0;
    const transInterval = setInterval(() => {
      setLiveCaption(inputToUse.slice(0, charIdx + 1));
      charIdx++;
      if (charIdx >= inputToUse.length) {
        clearInterval(transInterval);
        setTimeout(() => handleLiveTurn(inputToUse), 800);
      }
    }, 25);
  };

  useEffect(() => {
    const savedTopic = localStorage.getItem("debateTopic");
    const savedPosition = localStorage.getItem("userPosition");
    const savedDifficulty = localStorage.getItem("debateDifficulty");

    if (savedTopic) setTopic(savedTopic);
    if (savedPosition) setPosition(savedPosition);
    if (savedDifficulty) setDifficulty(savedDifficulty);

    // Fetch Real Initial AI Message and Suggested Args from Gemini
    startDebateSession(savedTopic, savedPosition, savedDifficulty)
      .then(opening => {
        setMessages([
          {
            id: 1,
            sender: "DiBot.AI",
            role: "ai",
            content: opening,
            isNew: true
          }
        ]);
        
        // Generate topic-specific suggestions (Internal logic for better UX)
        const suggestions = [
          `As a ${savedPosition === 'for' ? 'proponent' : 'critic'} of ${savedTopic}, we must consider the long-term logical impact on society.`,
          `The core issue with ${savedTopic} isn't just efficiency, it's the fundamental ethics of the ${savedPosition === 'for' ? 'positive' : 'negative'} outcomes.`,
          `If we look at the evidence, ${savedTopic} has shown that the ${savedPosition === 'for' ? 'benefits' : 'risks'} far outweigh the ${savedPosition === 'for' ? 'risks' : 'benefits'}.`,
          `We cannot ignore the historical context of ${savedTopic} when discussing its modern ${savedPosition === 'for' ? 'implementation' : 'rejection'}.`,
          `The logic of my opponent fails to account for the personal autonomy of individuals regarding ${savedTopic}.`
        ];
        setSuggestedArgs(suggestions);
      })
      .catch(err => {
        console.error("Initial AI Error:", err);
        setMessages([{ id: 1, sender: "DiBot.AI", role: "ai", content: "I am ready. What is your opening argument?", isNew: true }]);
      });
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      const container = chatEndRef.current.closest('.messages-list');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking, scrollToBottom]);

  // Timer and Round logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev > 0 ? prev - 1 : 0;
        // Logic: Change round every 4 minutes (240 seconds) for 5 rounds total
        const newRound = Math.min(Math.floor((1200 - nextTime) / 240) + 1, 5);
        if (newRound !== round) setRound(newRound);
        return nextTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [round]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup speech when leaving Virtual Room or on unmount
  useEffect(() => {
    if (!isLive) {
      window.speechSynthesis?.cancel();
      setLiveCaption("");
      setIsTranscribing(false);
      setActiveSpeaker('user');
    }
    return () => window.speechSynthesis?.cancel();
  }, [isLive]);

  const [realAnalysis, setRealAnalysis] = useState(null);

  const handleFinalize = async () => {
    setShowEndModal(false);
    setIsAnalyzing(true);
    window.speechSynthesis?.cancel();
    setIsLive(false);

    try {
      const data = await endDebateSession(
        messages.map(m => ({ role: m.role, content: m.content })),
        topic,
        difficulty
      );
      setRealAnalysis(data.analysis);
      setIsAnalyzing(false);
      setShowEvaluation(true);
    } catch (err) {
      console.error("Finalization Error:", err);
      setIsAnalyzing(false);
      setShowEvaluation(true); // Show fallback evaluation if error
    }
  };

  // Animated Score Counter Effect
  useEffect(() => {
    if (showEvaluation && realAnalysis) {
      const target = { 
        logic: realAnalysis.logicScore || 0, 
        persuasion: realAnalysis.persuasionScore || 0, 
        userPts: realAnalysis.userScore ?? realAnalysis.overallScore ?? 0, 
        aiPts: realAnalysis.aiScore ?? (100 - (realAnalysis.overallScore ?? 0))
      };
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setDisplayScores({
          logic: Math.floor(target.logic * progress),
          persuasion: Math.floor(target.persuasion * progress),
          userPts: Math.floor(target.userPts * progress),
          aiPts: Math.floor(target.aiPts * progress)
        });

        if (currentStep >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [showEvaluation, realAnalysis]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      sender: "You",
      role: "user",
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsAiThinking(true);

    // Fetch Real AI response from Gemini
    sendMessageToAI({
      message: userMsg.content,
      topic,
      position,
      difficulty,
      round,
      totalRounds: 5,
      history: messages.map(m => ({ role: m.role, content: m.content }))
    })
    .then(reply => {
      setIsAiThinking(false);
      const aiMsg = {
        id: Date.now() + 1,
        sender: "DiBot.AI",
        role: "ai",
        content: reply,
        isNew: true
      };
      setMessages(prev => [...prev, aiMsg]);
    })
    .catch(err => {
      setIsAiThinking(false);
      console.error("AI Message Error:", err);
      const errorMsg = {
        id: Date.now() + 2,
        sender: "System Error",
        role: "ai",
        content: `⚠️ ERROR: ${err.message}. Please check your AI API configurations in the backend .env.`,
        isNew: false
      };
      setMessages(prev => [...prev, errorMsg]);
    });
  };

  return (
    <div className="debate-page-root">
      <Header user={user} onLogout={onLogout} currentStep="debate" onStartDebate={onStartDebate} />
      
      <div className="debate-layout">
        <aside className="debate-sidebar">
          {/* Timer Card */}
          <div className="sidebar-card timer-card">
            <h4 className="sidebar-label">TIME REMAINING</h4>
            <div className="timer-display">{formatTime(timeLeft)}</div>
          </div>

          {/* Round Card */}
          <div className="sidebar-card round-card">
            <h4 className="sidebar-label">DEBATE PROGRESS</h4>
            <div className="round-display" key={`round-${round}`}>
              <span className="round-count">Round : {round} of 5</span>
            </div>
          </div>

          {/* Control Card */}
          <div className="sidebar-card control-card">
            <h4 className="sidebar-label">SESSION CONTROL</h4>
            <div className="status-indicator">
              <span className="live-dot"></span>
              {isLive ? 'SESSION LIVE' : 'LIVE'}
            </div>
            <div className="control-actions">
              <button 
                className={`btn-sidebar go-live ${isLive ? 'active' : ''}`}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? 'BACK TO CHAT' : 'GO LIVE NOW'}
              </button>
              <button 
                className="btn-sidebar end-debate"
                onClick={() => setShowEndModal(true)}
              >
                END DEBATE
              </button>
            </div>
          </div>

          {/* Difficulty Card */}
          <div className={`sidebar-card difficulty-card ${difficulty}`}>
            <h4 className="sidebar-label animated-label">DIFFICULTY: {difficulty?.toUpperCase()}</h4>
            <div className={`diff-pill ${difficulty}`}>
              <span className="diff-dot"></span>
              {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
            </div>
          </div>

          {/* Metrics Card */}
          <div className="sidebar-card metrics-card">
            <h4 className="sidebar-label">LIVE PERFORMANCE</h4>
            <div className="metrics-list">
              <div className="metric-row">
                <div className="metric-header">
                  <span>Pace</span>
                  <span className="metric-value">65%</span>
                </div>
                <div className="metric-bar"><div className="fill" style={{width: '65%'}}></div></div>
              </div>
              <div className="metric-row">
                <div className="metric-header">
                  <span>Clarity</span>
                  <span className="metric-value">80%</span>
                </div>
                <div className="metric-bar"><div className="fill" style={{width: '80%'}}></div></div>
              </div>
              <div className="metric-row">
                <div className="metric-header">
                  <span>Logic</span>
                  <span className="metric-value">40%</span>
                </div>
                <div className="metric-bar"><div className="fill" style={{width: '40%'}}></div></div>
              </div>
            </div>
          </div>
        </aside>

        <main className="debate-chat-container">
          <div className="debate-info-bar">
            <div className="info-item">
              <span className="info-label">TOPIC:</span>
              <span className="info-value">{topic}</span>
            </div>
            <span className="info-separator">—</span>
            <div className="info-item">
              <span className="info-label">STANCE:</span>
              <span className="info-value">{position?.toUpperCase()}</span>
            </div>
          </div>

          {!isLive ? (
            <>
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                    <div className="message-header">
                      <span className={`sender-icon ${
                        msg.role === 'ai' 
                          ? (position === 'for' ? 'against-theme' : 'for-theme') 
                          : (position === 'for' ? 'for-theme' : 'against-theme')
                      }`}>
                        {msg.role === "ai" ? "🤖" : "👤"}
                      </span>
                      <span className={`sender-name ${
                        msg.role === 'ai' 
                          ? (position === 'for' ? 'against-theme' : 'for-theme') 
                          : (position === 'for' ? 'for-theme' : 'against-theme')
                      }`}>{msg.sender}</span>
                    </div>
                    <div className={`message-bubble ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'} ${
                      msg.role === 'ai' 
                        ? (position === 'for' ? 'against-theme' : 'for-theme') 
                        : (position === 'for' ? 'for-theme' : 'against-theme')
                    }`}>
                      {msg.role === 'ai' ? (
                        msg.isNew ? (
                          <TypewriterMessage 
                            text={msg.content} 
                            onUpdate={scrollToBottom}
                            onComplete={() => {
                              msg.isNew = false;
                              scrollToBottom();
                            }}
                          />
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        )
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="message-wrapper assistant thinking">
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                      <p className="thinking-text" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>
                        DiBot is analyzing your logic...
                      </p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} style={{ height: '2px' }} />
              </div>

              <div className="chat-input-area">
                <div className="input-container">
                  <input 
                    type="text" 
                    placeholder="Type your argument... (Enter to send)" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <div className="input-actions">
                    <button className="send-btn" onClick={handleSendMessage}>Send</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="virtual-debate-room">
              <div className="virtual-participants">
                {/* AI Participant Card */}
                <div className={`participant-card ai-participant ${activeSpeaker === 'ai' ? 'speaking' : 'listening'} ${position === 'for' ? 'against-theme' : 'for-theme'}`}>
                  <div className="participant-header">
                    <span className="participant-name">DIBOT.AI</span>
                    <div className="spacer"></div>
                    <span className={`status-badge ${activeSpeaker === 'ai' ? 'speaking-badge' : 'listening-badge'}`}>
                      {activeSpeaker === 'ai' ? 'SPEAKING...' : 'LISTENING...'}
                    </span>
                  </div>
                  <div className="avatar-circle">
                    <div className={`avatar-energy-ring ${position === 'for' ? 'against-theme' : 'for-theme'}`}></div>
                    <div className="avatar-img-container">
                      <img 
                        src="/ai-avatar.png" 
                        alt="AI Chatbot" 
                        className={`participant-img ai-img ${position === 'for' ? 'against-theme' : 'for-theme'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="vs-divider">
                  <div className="vs-line"></div>
                  <div className="vs-circle">VS</div>
                  <div className="vs-line"></div>
                </div>

                {/* User Participant Card */}
                <div className={`participant-card user-participant ${activeSpeaker === 'user' ? 'speaking' : 'listening'} ${position === 'for' ? 'for-theme' : 'against-theme'}`}>
                  <div className="participant-header">
                    <span className={`status-badge ${activeSpeaker === 'user' ? 'speaking-badge' : 'listening-badge'}`}>
                      {activeSpeaker === 'user' ? 'SPEAKING...' : 'LISTENING...'}
                    </span>
                    <span className="participant-name">YOU</span>
                    <div 
                      className={`live-recording-badge ${isTranscribing ? 'active' : 'dimmed'}`}
                      onClick={startSmartTurn}
                      style={{cursor: 'pointer'}}
                      title="Click to simulate argument"
                    >
                      <span className="live-red-dot"></span>
                      {isTranscribing ? 'REC' : (activeSpeaker === 'user' ? 'LIVE' : 'OFF')}
                      <span className="mic-icon">🎙️</span>
                    </div>
                  </div>
                  <div className="avatar-circle">
                    <div className="avatar-energy-ring"></div>
                    <div className="avatar-img-container">
                      <img 
                        src="/human-avatar.png" 
                        alt="Human Debater" 
                        className="participant-img"
                      />
                      {activeSpeaker === 'user' && (
                        <div className="voice-wave-container">
                          <div className="wave"></div>
                          <div className="wave"></div>
                          <div className="wave"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Status Bar */}
              <div className={`live-status-bar ${activeSpeaker === 'user' ? (position === 'for' ? 'for-theme' : 'against-theme') : (position === 'for' ? 'against-theme' : 'for-theme')}`}>
                <div className="status-label">
                  <span className="who-speaking">{activeSpeaker === 'user' ? 'YOU' : 'DIBOT.AI'}</span> {isTranscribing ? 'TRANSCRIBING...' : 'SPEAKING...'}
                </div>
                <div className="status-hint italic" key={`${activeSpeaker}-caption`}>
                  {activeSpeaker === 'user' && !isTranscribing ? (
                    <span className="user-transcription">
                      Click the Red Microphone to start speaking...
                    </span>
                  ) : (
                    <span className="live-caption-text">
                      {liveCaption || '...'}
                    </span>
                  )}
                  <div ref={captionEndRef} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* End Debate Confirmation Modal */}
      {showEndModal && (
        <div className="modal-overlay">
          <div className="end-debate-modal">
            <div className="modal-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <h2 className="modal-title">CONCLUDE DEBATE?</h2>
            <p className="modal-description">
              Finalizing now will submit your current arguments for <strong>**AI Performance Analysis**</strong>. 
              Are you ready for your final verdict?
            </p>
            <div className="modal-actions">
              <button 
                className="btn-modal btn-confirm"
                onClick={handleFinalize}
              >
                YES, END ASSESSMENT
              </button>
              <button 
                className="btn-modal btn-cancel"
                onClick={() => setShowEndModal(false)}
              >
                CONTINUE ARGUING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing Performance Overlay */}
      {isAnalyzing && (
        <div className="modal-overlay analyzing-overlay">
          <div className="analyzing-card">
            <div className="analyzing-header">
              <h2 className="analyzing-title">Analyzing your performance...</h2>
              <div className="analyzing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <p className="analyzing-subtitle">
              Our AI is evaluating your arguments, structure, and logic.
            </p>
            <div className="loading-bar-container">
              <div className="loading-bar-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* Final Evaluation Page */}
      {showEvaluation && (
        <div className="modal-overlay evaluation-overlay">
          <div className="evaluation-card">
            {/* Left Section: Stats */}
            <div className="evaluation-left">
              <div className="eval-left-top-content">
                {(() => {
                  const uScore = realAnalysis?.userScore ?? realAnalysis?.overallScore ?? 0;
                  const aScore = realAnalysis?.aiScore ?? (realAnalysis ? 100 - (realAnalysis.overallScore ?? 0) : 0);
                  const userWon = uScore >= aScore;
                  const winnerStance = userWon ? position : (position === 'for' ? 'against' : 'for');
                  const winnerTheme = winnerStance === 'for' ? 'for-theme' : 'against-theme';
                  
                  return (
                    <div className={`winner-badge ${winnerTheme}`}>
                      <span className="trophy-icon">🏆</span>
                      <h3 className="winner-status">
                        DEBATE COMPLETE • {userWon ? 'YOU WON' : 'DIBOT.AI WON'}
                      </h3>
                    </div>
                  );
                })()}
                
                <div className="eval-scores-grid">
                  <div className="eval-score-item logic-item">
                    <span className="eval-score-label">LOGIC</span>
                    <span className="eval-score-value animate-pop">{displayScores.logic}</span>
                  </div>
                  <div className="eval-score-item persuasion-item">
                    <span className="eval-score-label">PERSUASION</span>
                    <span className="eval-score-value animate-pop">{displayScores.persuasion}</span>
                  </div>
                </div>

                <div className="points-vs-card">
                  <div className="point-item user-pts">
                    <span className="point-val animate-pop">{displayScores.userPts}</span>
                    <span className="point-label">Yours</span>
                  </div>
                  <div className="vs-divider">vs</div>
                  <div className="point-item ai-pts">
                    <span className="point-val animate-pop">{displayScores.aiPts}</span>
                    <span className="point-label">AI</span>
                  </div>
                </div>
              </div>

              <button className="btn-eval btn-back-home" onClick={() => window.location.href = '/'}>
                Back to Home
              </button>
            </div>

            {/* Right Section: Detailed Feedback */}
            <div className="evaluation-right">
              <div className="eval-right-header">
                <h2 className="eval-main-title">Final Evaluation</h2>
                <p className="eval-main-subtitle">
                  The AI has concluded its full-spectrum analysis of the debate.
                </p>
              </div>

              <div className="eval-feedback-scroll">
                <div className="feedback-quote-box">
                  <p>"{realAnalysis?.feedback || "Great effort! You maintained your position well."}"</p>
                </div>

                <div className="feedback-grid">
                  <div className="feedback-section strengths">
                    <h4 className="feedback-section-title">KEY STRENGTHS</h4>
                    <div className="feedback-list">
                      {(realAnalysis?.strengths || ["Persuasion"]).map((s, i) => (
                        <div key={i} className="feedback-item">
                          <span className="check-icon">✓</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="feedback-section growth">
                    <h4 className="feedback-section-title">AREAS FOR GROWTH</h4>
                    <div className="feedback-list">
                      {(realAnalysis?.improvementAreas || ["Logic Depth"]).map((a, i) => (
                        <div key={i} className="feedback-item">
                          <span className="error-icon">!</span> {a}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="feedback-section fallacies">
                    <h4 className="feedback-section-title" style={{ color: '#f59e0b' }}>DETECTED FALLACIES</h4>
                    <div className="feedback-list">
                      {realAnalysis?.fallacies?.length > 0 ? (
                        realAnalysis.fallacies.map((f, i) => (
                          <div key={i} className="feedback-item">
                            <span className="warn-icon">⚠️</span> {f}
                          </div>
                        ))
                      ) : (
                        <div className="feedback-item" style={{ opacity: 0.6 }}>
                          <span className="check-icon">✓</span> Clean logic! No fallacies detected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-eval btn-debate-again" onClick={() => window.location.reload()}>
                DEBATE AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebatePage;
