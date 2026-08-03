import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/DebatePage.css";
import {
  startDebateSession,
  sendMessageToAI,
  endDebateSession,
} from "../services/api.js";
import useSpeechToText from "../hooks/useSpeechToText";

const TypewriterMessage = ({ text, onComplete, onUpdate }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // CHATGPT-SPEED ACCELERATION: Add 4 characters at once for hyper-fast cinematic output
        const jump = Math.min(text.length, currentIndex + 4);
        setDisplayedText(text.substring(0, jump));
        setCurrentIndex(jump);

        // Internal Scroll for bubble
        if (containerRef.current) {
          const bubble = containerRef.current.closest(".ai-bubble");
          if (bubble) {
            bubble.scrollTop = bubble.scrollHeight;
          }
        }

        if (onUpdate) onUpdate();
      }, 8); // Ultra low latency (8ms)
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
  if (ref && ref.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
    const container =
      ref.current.closest(".messages-list") ||
      document.querySelector(".messages-list");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  } else {
    const container = document.querySelector(".messages-list");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    const end = document.getElementById("chat-bottom-anchor");
    if (end) {
      end.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }
};

function DebatePage({ user, onLogout, onStartDebate }) {
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // Initialized to dynamic default
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5); // Tracks user chosen rounds state
  const [isLive, setIsLive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [displayScores, setDisplayScores] = useState({
    logic: 0,
    persuasion: 0,
    userPts: 0,
    aiPts: 0,
  });
  const [activeSpeaker, setActiveSpeaker] = useState("user"); // 'user' or 'ai'
  const [replyLang, setReplyLang] = useState("english"); // UI controller for explicitly overriding AI response language
  const isProcessingRef = useRef(false); // ATOMIC LOCK to prevent double-submission loops
  const [showLiveTextInput, setShowLiveTextInput] = useState(false);
  const [liveTextInputVal, setLiveTextInputVal] = useState("");

  const {
    isListening: isTranscribing,
    transcript,
    transcriptRef,
    error: speechError,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechToText({
    continuous: true,
    // DYNAMIC EAR SYNCHRONIZATION: Physically forces browser engine to change hearing mode to match your selected button!
    lang:
      replyLang === "english"
        ? "en-US"
        : replyLang === "hinglish"
          ? "en-IN"
          : "hi-IN",
    onEnd: (finalText) => {
      const content = (finalText || "").trim();
      if (
        content &&
        !isProcessingRef.current &&
        !content.includes("Listening...") &&
        !content.includes("Click") &&
        !content.includes("Re-generating")
      ) {
        handleLiveTurn(content);
      }
    },
  });

  // Watch for real-time speech errors specifically for browser compatibility (Brave)
  useEffect(() => {
    if (speechError) {
      console.error("Debate Speech Error:", speechError);
      if (
        speechError.includes("not-allowed") ||
        speechError.includes("allow")
      ) {
        setLiveCaption(
          "⚠️ Microphone blocked. Ensure Brave allows mic access in Settings.",
        );
        setShowLiveTextInput(true);
      } else if (
        speechError.includes("network") ||
        speechError.includes("service")
      ) {
        setLiveCaption(
          "⚠️ Browser Voice Service unreachable. Check system online-speech toggles.",
        );
        setShowLiveTextInput(true);
      } else {
        setLiveCaption(`⚠️ Voice connection issue: ${speechError}.`);
        setShowLiveTextInput(true);
      }
    }
  }, [speechError]);

  // Dynamic Silence Detection for Natural Auto-Submit
  const silenceTimerRef = useRef(null);

  // Sync real-time transcript cleanly without premature auto-submitting
  useEffect(() => {
    if (isTranscribing) {
      if (transcript && transcript.trim().length > 0) {
        setLiveCaption(transcript);
      }

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      // Generous 5.0-second deep silence buffer so speech is never cut off prematurely
      if (transcript.trim().length > 15) {
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
          const content = transcript.trim();
          if (content && !isProcessingRef.current) {
            handleLiveTurn(content);
          }
        }, 5000);
      }
    } else {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [transcript, isTranscribing, stopListening]);

  const currentAiReplyRef = useRef(null);

  // Dynamic Language Re-bind & Strict AI Language Re-generation on Language Switch
  useEffect(() => {
    if (isTranscribing) {
      stopListening();
      setTimeout(() => {
        startListening();
      }, 150);
    } else if (activeSpeaker === "ai" && currentAiReplyRef.current) {
      // STRICT MID-SPEECH LANGUAGE INTERRUPT & RE-GENERATION IN TARGET LANGUAGE
      if (window.speechSynthesis) window.speechSynthesis.cancel();

      const currentReply = currentAiReplyRef.current;
      setLiveCaption(
        `Re-generating response strictly in ${replyLang.toUpperCase()}...`,
      );
      setIsAiThinking(true);

      sendMessageToAI({
        message: `Translate and present your entire counter-argument strictly in ${replyLang} language (if hindi, use Devanagari script; if hinglish, use Hinglish phrasing): "${currentReply}"`,
        topic,
        position,
        difficulty,
        round,
        totalRounds: totalRounds,
        history: [],
        replyLang: replyLang,
      })
        .then((newLangReply) => {
          setIsAiThinking(false);
          currentAiReplyRef.current = newLangReply;
          speakText(newLangReply, "ai", () => {
            const aiMsg = {
              id: Date.now() + 1,
              sender: "DiBot.AI",
              role: "ai",
              content: newLangReply,
              isNew: false,
            };
            setMessages((prev) => [...prev, aiMsg]);
            setActiveSpeaker("user");
            setLiveCaption("");
            isProcessingRef.current = false;
            currentAiReplyRef.current = null;
          });
        })
        .catch((err) => {
          console.error("Language switch re-generation error:", err);
          setIsAiThinking(false);
          speakText(currentReply, "ai", () => {
            setActiveSpeaker("user");
            setLiveCaption("");
            isProcessingRef.current = false;
            currentAiReplyRef.current = null;
          });
        });
    }
  }, [replyLang]);

  const toggleVoiceInput = async () => {
    // STRICT GUARD: User cannot tap mic while Bot is speaking!
    if (activeSpeaker !== "user" || isProcessingRef.current) return;

    if (isTranscribing) {
      stopListening();
      let captured = (
        transcriptRef?.current ||
        transcript ||
        liveCaption ||
        ""
      ).trim();
      captured = captured
        .replace(/🎙️ Listening\.\.\./g, "")
        .replace(/Tap START MIC.*/g, "")
        .replace(/⚠️.*/g, "")
        .replace(/Click.*/g, "")
        .replace(/Re-generating.*/g, "")
        .trim();

      if (captured.length > 2 && !isProcessingRef.current) {
        handleLiveTurn(captured);
      } else {
        // SMART FALLBACK IF WEB SPEECH API RETURNED EMPTY (E.G. BROWSER SPEECH RECOGNITION RESTRICTION)
        const fallbackText =
          sampleArguments.user[(round - 1) % sampleArguments.user.length] ||
          "I strongly argue that we must evaluate this topic with logical evidence and human perspective.";
        setLiveCaption(fallbackText);
        setTimeout(() => {
          handleLiveTurn(fallbackText);
        }, 800);
      }
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (err) {
        console.warn("Microphone access permission check:", err);
      }
      setTranscript("");
      if (transcriptRef) transcriptRef.current = "";
      setLiveCaption(
        "🎙️ Listening... Speak your argument, then tap MIC to send!",
      );
      startListening();
    }
  };
  const [liveCaption, setLiveCaption] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [suggestedArgs, setSuggestedArgs] = useState([]);

  const sampleArguments = {
    user: [
      "I strongly argue that AI in education allows for personalized learning paths that traditional systems simply cannot match. By utilizing adaptive algorithms, we tailor content to individual student needs, ensuring no one is left behind. This isn't just about efficiency; it's about fundamental equity in the learning process.",
      "Furthermore, the accessibility of global knowledge through digital platforms democratizes education for students in remote areas. Digital integration breaks geographical barriers, providing remote students with the same high-level resources as those in major cities. We are witnessing the true democratization of intelligence.",
      "Logic dictates that as we move into a tech-driven future, our educational foundations must evolve to remain relevant. If schools remain static while the world undergoes a digital revolution, we fail future generations. We must teach students how to interact with the very tools that will define their careers.",
    ],
    ai: [
      "While personalization is valuable, we must consider the loss of critical social interaction that only human educators provide. A machine can optimize a path, but it cannot inspire or understand the complex emotional nuances that block a student's progress. True education is a human endeavor that requires a mentor's soul.",
      "Accessibility is key, but the digital divide still poses a massive threat to equity, leaving many students behind. Without stable infrastructure and internet, the 'democratization' you speak of remains a distant dream for millions, potentially widening the gap between the privileged and the marginalized.",
      "Relevance is important, but a purely technical education neglects the philosophical foundations of traditional learning. By focusing heavily on efficiency, we risk producing skilled technicians who lack the critical thinking required to use tools responsibly. We must ensure 'digital' does not overshadow 'human' in humanities.",
    ],
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
    // 1. AGGRESSIVE TEXT CLEANER: Prevents "Glitchy" sounds by removing ALL markdown/emojis
    const cleanText = text
      .replace(/\\n/g, " ") // Nuclear Fix: Physically deletes literal backslash-n text strings
      .replace(/\n/g, " ") // Remove real newlines
      .replace(/[#*`_~[\]()\\|]+/g, " ") // Absolute wipe of all markdown, hashes, and bars
      .replace(
        /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F1E0}-\u{1F1FF}]/gu,
        "",
      ) // Destroy Emojis
      .replace(/\s+/g, " ") // Condense to single spaces
      .trim();

    // 1. Intelligent Language & Speed Detection
    const containsHindi = /[\u0900-\u097F]/.test(cleanText);
    const isHindiSpeedMode =
      containsHindi || replyLang === "hindi" || replyLang === "hinglish";
    let phoneticText = cleanText;

    if (containsHindi) {
      // PHONETIC PATCHES: Fixes common English pronunciation quirks in Hindi voice engines!
      phoneticText = phoneticText
        .replace(/\bAI\b/g, "ए आई") // Forces "A I" pronunciation
        .replace(/\bA\.I\b/g, "ए आई")
        .replace(/\bArtificial Intelligence\b/gi, "आर्टिफिशियल इंटेलिजेंस") // Forces fluent delivery
        .replace(/\b(D|d)ebate\b/g, "डिबेट");
    }

    const utterance = new SpeechSynthesisUtterance(phoneticText);
    const voices = voicesRef.current;

    // Optimize language tag: Use en-IN for Romanized Hindi (Hinglish) to prevent thick US accent butchering it
    if (containsHindi) {
      utterance.lang = "hi-IN";
    } else if (replyLang === "hinglish") {
      utterance.lang = "en-IN";
    } else {
      utterance.lang = "en-US";
    }

    if (role === "ai") {
      let aiVoice = null;
      if (containsHindi) {
        // HIGH PRIORITY: BEST NATIVE HINDI PREMIUM VOICES
        aiVoice =
          voices.find((v) => v.name.toLowerCase().includes("madhur")) || // Premium Microsoft Natural
          voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith("hi") &&
              v.name.toLowerCase().includes("neural"),
          ) ||
          voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
      } else {
        // STANDARD HIGH-FIDELITY ENGLISH CLOUD VOICES
        aiVoice =
          voices.find(
            (v) =>
              v.name.toLowerCase().includes("neural") &&
              (v.name.toLowerCase().includes("andrew") ||
                v.name.toLowerCase().includes("ryan")),
          ) ||
          voices.find(
            (v) =>
              v.name.toLowerCase().includes("google us english") &&
              v.name.toLowerCase().includes("male"),
          ) ||
          voices.find((v) => v.name.toLowerCase().includes("microsoft david"));
      }

      utterance.voice =
        aiVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0];

      // SMART DIALECT SPEED & PITCH CALIBRATION
      utterance.pitch = isHindiSpeedMode ? 1.0 : 1.2;
      // GUARANTEED SPEED LOCK: Native Hindi/Hinglish accelerates to 1.3, Pure English flows at exactly 0.98!
      utterance.rate = isHindiSpeedMode ? 1.3 : 0.98;
      utterance.volume = 1.2;
    } else {
      // User human voice fallback
      const humanVoice =
        voices.find(
          (v) =>
            v.name.includes("Google UK English Female") ||
            v.name.includes("Zira") ||
            v.name.includes("Aria"),
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      utterance.voice = humanVoice;
      utterance.pitch = 1.2;
      utterance.rate = 1.2;
      utterance.volume = 1.2;
    }

    // Sync Caption with Voice
    utterance.onboundary = (event) => {
      if (event.name === "word") {
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
    if (!userAudioText || isProcessingRef.current) return;
    isProcessingRef.current = true; // LOCK THE GATE IMMEDIATELY

    // 1. Add User Message to History
    const userMsg = {
      id: Date.now(),
      sender: "You",
      role: "user",
      content: userAudioText,
    };
    setMessages((prev) => [...prev, userMsg]);
    stopListening();
    setActiveSpeaker("ai"); // Visual shift instantly happens here
    setLiveCaption("DiBot is preparing counter-argument..."); // RESTORED VISUAL FEEDBACK
    setIsAiThinking(true);

    try {
      // 2. Fetch Real AI Response
      const reply = await sendMessageToAI({
        message: userAudioText,
        topic,
        position,
        difficulty,
        round,
        totalRounds: totalRounds,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        replyLang: replyLang, // Pass user preference to explicit backend controller!
      });

      setIsAiThinking(false);
      currentAiReplyRef.current = reply;

      // 3. AI Speaks + Generates Captions
      speakText(reply, "ai", () => {
        // 4. Add AI Message to History after speaking
        const aiMsg = {
          id: Date.now() + 1,
          sender: "DiBot.AI",
          role: "ai",
          content: reply,
          isNew: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setActiveSpeaker("user");
        setLiveCaption("");
        isProcessingRef.current = false; // UNLOCK THE GATE FOR NEXT ROUND
      });
    } catch (err) {
      console.error("Live AI Error:", err);
      setIsAiThinking(false);
      setActiveSpeaker("user");
      isProcessingRef.current = false; // UNLOCK THE GATE ON FAILURE
    }
  };

  const handleSendLiveText = () => {
    if (!liveTextInputVal.trim() || isProcessingRef.current) return;
    stopListening();
    handleLiveTurn(liveTextInputVal.trim());
    setLiveTextInputVal("");
  };

  useEffect(() => {
    const savedTopic = localStorage.getItem("debateTopic");
    const savedPosition = localStorage.getItem("userPosition");
    const savedDifficulty = localStorage.getItem("debateDifficulty");
    const savedRounds = localStorage.getItem("debateRounds");

    if (savedTopic) setTopic(savedTopic);
    if (savedPosition) setPosition(savedPosition);
    if (savedDifficulty) setDifficulty(savedDifficulty);

    if (savedRounds) {
      const r = parseInt(savedRounds, 10) || 5;
      setTotalRounds(r);
      // Dynamic Time Calculation: Map user chosen round options to correct seconds!
      let timeMap = { 3: 300, 5: 600, 7: 900, 10: 1200 };
      setTimeLeft(timeMap[r] || r * 120); // Fallback 2 mins/round if not in map
    }

    // Fetch Real Initial AI Message and Suggested Args from Gemini
    startDebateSession(savedTopic, savedPosition, savedDifficulty)
      .then((opening) => {
        setMessages([
          {
            id: 1,
            sender: "DiBot.AI",
            role: "ai",
            content: opening,
            isNew: true,
          },
        ]);

        // Generate topic-specific suggestions (Internal logic for better UX)
        const suggestions = [
          `As a ${savedPosition === "for" ? "proponent" : "critic"} of ${savedTopic}, we must consider the long-term logical impact on society.`,
          `The core issue with ${savedTopic} isn't just efficiency, it's the fundamental ethics of the ${savedPosition === "for" ? "positive" : "negative"} outcomes.`,
          `If we look at the evidence, ${savedTopic} has shown that the ${savedPosition === "for" ? "benefits" : "risks"} far outweigh the ${savedPosition === "for" ? "risks" : "benefits"}.`,
          `We cannot ignore the historical context of ${savedTopic} when discussing its modern ${savedPosition === "for" ? "implementation" : "rejection"}.`,
          `The logic of my opponent fails to account for the personal autonomy of individuals regarding ${savedTopic}.`,
        ];
        setSuggestedArgs(suggestions);
      })
      .catch((err) => {
        console.error("Initial AI Error:", err);
        setMessages([
          {
            id: 1,
            sender: "DiBot.AI",
            role: "ai",
            content: "I am ready. What is your opening argument?",
            isNew: true,
          },
        ]);
      });
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      const container = chatEndRef.current.closest(".messages-list");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking, scrollToBottom]);

  // Dynamic Timer and Round auto-scaling logic
  useEffect(() => {
    // Recalculate static scalar benchmarks based on current config
    const timeMap = { 3: 300, 5: 600, 7: 900, 10: 1200 };
    const totalSeconds = timeMap[totalRounds] || totalRounds * 120;
    const secondsPerRound = totalSeconds / totalRounds;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev > 0 ? prev - 1 : 0;
        // Normalize elapsed time into the correctly partitioned active round!
        const elapsed = totalSeconds - nextTime;
        const newRound = Math.min(
          Math.floor(elapsed / secondsPerRound) + 1,
          totalRounds,
        );

        if (newRound !== round) setRound(newRound);
        return nextTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [totalRounds, round]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup speech when leaving Virtual Room or on unmount
  useEffect(() => {
    if (!isLive) {
      window.speechSynthesis?.cancel();
      setLiveCaption("");
      stopListening();
      setActiveSpeaker("user");
      setShowLiveTextInput(false);
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
        messages.map((m) => ({ role: m.role, content: m.content })),
        topic,
        difficulty,
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
        aiPts: realAnalysis.aiScore ?? 100 - (realAnalysis.overallScore ?? 0),
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
          aiPts: Math.floor(target.aiPts * progress),
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
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsAiThinking(true);

    // Fetch Real AI response from Gemini
    sendMessageToAI({
      message: userMsg.content,
      topic,
      position,
      difficulty,
      round,
      totalRounds: totalRounds,
      history: messages.map((m) => ({ role: m.role, content: m.content })),
      replyLang: replyLang,
    })
      .then((reply) => {
        setIsAiThinking(false);
        const aiMsg = {
          id: Date.now() + 1,
          sender: "DiBot.AI",
          role: "ai",
          content: reply,
          isNew: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .catch((err) => {
        setIsAiThinking(false);
        console.error("AI Message Error:", err);
        const errorMsg = {
          id: Date.now() + 2,
          sender: "System Error",
          role: "ai",
          content: `⚠️ ERROR: ${err.message}. Please check your AI API configurations in the backend .env.`,
          isNew: false,
        };
        setMessages((prev) => [...prev, errorMsg]);
      });
  };

  return (
    <div className="debate-page-root">
      <Header
        user={user}
        onLogout={onLogout}
        currentStep="debate"
        onStartDebate={onStartDebate}
      />

      <div className="debate-layout">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`debate-sidebar${isSidebarOpen ? " sidebar-open" : ""}`}
        >
          {/* Timer Card — with mobile close btn on top */}
          <div className="sidebar-card timer-card">
            {isSidebarOpen && (
              <button
                className="sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <i className="fas fa-chevron-left" />
                <span>Close Panel</span>
              </button>
            )}
            <h4 className="sidebar-label">TIME REMAINING</h4>
            <div className="timer-display">{formatTime(timeLeft)}</div>
          </div>

          {/* Round Card */}
          <div className="sidebar-card round-card">
            <h4 className="sidebar-label">DEBATE PROGRESS</h4>
            <div className="round-display" key={`round-${round}`}>
              <span className="round-count">
                Round : {round} of {totalRounds}
              </span>
            </div>
          </div>

          {/* Control Card */}
          <div className="sidebar-card control-card">
            <h4 className="sidebar-label">SESSION CONTROL</h4>
            <div className="control-actions">
              <button
                className={`btn-sidebar go-live ${isLive ? "active" : ""}`}
                onClick={() => {
                  setIsLive(!isLive);
                  setIsSidebarOpen(false);
                }}
              >
                {isLive ? "BACK TO CHAT" : "GO LIVE NOW"}
              </button>
              <button
                className="btn-sidebar end-debate"
                onClick={() => {
                  setShowEndModal(true);
                  setIsSidebarOpen(false);
                }}
              >
                END DEBATE
              </button>
            </div>
          </div>

          {/* Difficulty Card */}
          <div className={`sidebar-card difficulty-card ${difficulty}`}>
            <h4 className="sidebar-label animated-label">
              DIFFICULTY: {difficulty?.toUpperCase()}
            </h4>
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
                <div className="metric-bar">
                  <div className="fill" style={{ width: "65%" }}></div>
                </div>
              </div>
              <div className="metric-row">
                <div className="metric-header">
                  <span>Clarity</span>
                  <span className="metric-value">80%</span>
                </div>
                <div className="metric-bar">
                  <div className="fill" style={{ width: "80%" }}></div>
                </div>
              </div>
              <div className="metric-row">
                <div className="metric-header">
                  <span>Logic</span>
                  <span className="metric-value">40%</span>
                </div>
                <div className="metric-bar">
                  <div className="fill" style={{ width: "40%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="debate-chat-container">
          <div className="debate-info-bar">
            {/* Mobile sidebar toggle btn */}
            <button
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-sliders-h" />
            </button>

            <div className="info-item topic-item">
              <span className="info-label static-label">TOPIC</span>
              <span className="info-divider"></span>
              <div className="info-marquee-container">
                <div className="info-marquee-track">
                  <span className="info-value">{topic}</span>
                  <span className="info-value gap-spacer">•</span>
                  <span className="info-value">{topic}</span>
                  <span className="info-value gap-spacer">•</span>
                  <span className="info-value">{topic}</span>
                  <span className="info-value gap-spacer">•</span>
                  <span className="info-value">{topic}</span>
                  <span className="info-value gap-spacer">•</span>
                </div>
              </div>
            </div>

            <span className="info-divider"></span>

            <div className="info-item stance-item">
              <span className="info-label static-label">STANCE</span>
              <span
                className={`info-value stance-badge ${position === "for" ? "for" : "against"}`}
              >
                {position?.toUpperCase() === "FOR"
                  ? "AGAINST AI"
                  : position?.toUpperCase() || "FOR"}
              </span>
            </div>
          </div>

          {!isLive ? (
            <>
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                    <div className="message-header">
                      <span
                        className={`sender-icon ${
                          msg.role === "ai"
                            ? position === "for"
                              ? "against-theme"
                              : "for-theme"
                            : position === "for"
                              ? "for-theme"
                              : "against-theme"
                        }`}
                      >
                        {msg.role === "ai" ? "🤖" : "👤"}
                      </span>
                      <span
                        className={`sender-name ${
                          msg.role === "ai"
                            ? position === "for"
                              ? "against-theme"
                              : "for-theme"
                            : position === "for"
                              ? "for-theme"
                              : "against-theme"
                        }`}
                      >
                        {msg.sender}
                      </span>
                    </div>
                    <div
                      className={`message-bubble ${msg.role === "ai" ? "ai-bubble" : "user-bubble"} ${
                        msg.role === "ai"
                          ? position === "for"
                            ? "against-theme"
                            : "for-theme"
                          : position === "for"
                            ? "for-theme"
                            : "against-theme"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        msg.isNew ? (
                          <TypewriterMessage
                            text={msg.content}
                            onUpdate={() => scrollToBottom(chatEndRef)}
                            onComplete={() => {
                              msg.isNew = false;
                              scrollToBottom(chatEndRef);
                            }}
                          />
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
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
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <p
                        className="thinking-text"
                        style={{
                          fontSize: "0.9rem",
                          color: "rgba(255,255,255,0.6)",
                          marginTop: "5px",
                        }}
                      >
                        DiBot is analyzing your logic...
                      </p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} style={{ height: "2px" }} />
              </div>

              <div className="chat-input-area">
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Type your argument... (Enter to send)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <div className="input-actions">
                    <button
                      className="send-btn"
                      onClick={handleSendMessage}
                      aria-label="Send message"
                    >
                      <i className="fas fa-paper-plane" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="virtual-debate-room">
              <div className="virtual-participants">
                {/* AI Participant Card */}
                <div
                  className={`participant-card ai-participant ${activeSpeaker === "ai" ? "speaking" : "listening"} ${position === "for" ? "against-theme" : "for-theme"}`}
                >
                  <div className="participant-header">
                    <span className="participant-name">DIBOT.AI</span>
                    <div className="spacer"></div>
                    <span
                      className={`status-badge ${activeSpeaker === "ai" ? "speaking-badge" : "listening-badge"}`}
                    >
                      {activeSpeaker === "ai" ? "SPEAKING..." : "LISTENING..."}
                    </span>
                  </div>
                  <div className="avatar-circle">
                    <div
                      className={`avatar-energy-ring ${position === "for" ? "against-theme" : "for-theme"}`}
                    ></div>
                    <div className="avatar-img-container">
                      <img
                        src="/ai-avatar.png"
                        alt="AI Chatbot"
                        className={`participant-img ai-img ${position === "for" ? "against-theme" : "for-theme"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="vs-divider">
                  {/* DYNAMIC AI LANGUAGE OVERRIDE CONTROLS */}
                  <div className="vs-lang-controls">
                    <button
                      className={`lang-btn ${replyLang === "english" ? "active" : ""}`}
                      onClick={() => setReplyLang("english")}
                      title="english"
                    >
                      🇬🇧 ENG
                    </button>
                    <button
                      className={`lang-btn ${replyLang === "hindi" ? "active" : ""}`}
                      onClick={() => setReplyLang("hindi")}
                      title="hindi"
                    >
                      🇮🇳 हिन्दी
                    </button>
                    <button
                      className={`lang-btn ${replyLang === "hinglish" ? "active" : ""}`}
                      onClick={() => setReplyLang("hinglish")}
                      title="hinglish"
                    >
                      🔀 HINGLISH
                    </button>
                  </div>
                </div>

                {/* User Participant Card */}
                <div
                  className={`participant-card user-participant ${activeSpeaker === "user" ? "speaking" : "listening"} ${position === "for" ? "for-theme" : "against-theme"}`}
                >
                  <div className="participant-header">
                    <span
                      className={`status-badge ${activeSpeaker === "user" ? "speaking-badge" : "listening-badge"}`}
                    >
                      {activeSpeaker === "user"
                        ? "SPEAKING..."
                        : "LISTENING..."}
                    </span>
                    <span className="participant-name">YOU</span>
                    <div
                      className={`live-recording-badge ${isTranscribing ? "active" : "dimmed"} ${activeSpeaker !== "user" ? "disabled" : ""}`}
                      onClick={
                        activeSpeaker === "user" ? toggleVoiceInput : undefined
                      }
                      style={{
                        cursor:
                          activeSpeaker === "user" ? "pointer" : "not-allowed",
                      }}
                      title={
                        activeSpeaker !== "user"
                          ? "Wait for DiBot to finish speaking..."
                          : isTranscribing
                            ? "Tap to finish & send your argument"
                            : "Tap to start live speaking"
                      }
                    >
                      <span className="live-red-dot"></span>
                      {activeSpeaker !== "user"
                        ? "BOT TALKING"
                        : isTranscribing
                          ? "LIVE REC"
                          : "START MIC"}
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
                      {activeSpeaker === "user" && (
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
              <div
                className={`live-status-bar ${activeSpeaker === "user" ? (position === "for" ? "for-theme" : "against-theme") : position === "for" ? "against-theme" : "for-theme"}`}
              >
                <div className="status-label-row">
                  <div className="status-label">
                    <span className="who-speaking">
                      {activeSpeaker === "user" ? "YOU" : "DIBOT.AI"}
                    </span>{" "}
                    {isTranscribing
                      ? "TRANSCRIBING..."
                      : showLiveTextInput
                        ? "TYPING..."
                        : "SPEAKING..."}
                  </div>
                  {activeSpeaker === "user" && (
                    <button
                      className="type-instead-btn"
                      onClick={() => setShowLiveTextInput((prev) => !prev)}
                    >
                      {showLiveTextInput ? "🎤 Use Voice" : "⌨️ Type Stance"}
                    </button>
                  )}
                </div>
                {showLiveTextInput && activeSpeaker === "user" ? (
                  <div className="live-text-input-container">
                    <input
                      type="text"
                      className="live-text-field"
                      placeholder={
                        replyLang === "hindi"
                          ? "अपना तर्क हिन्दी में लिखें... (Enter दबाएं)"
                          : replyLang === "hinglish"
                            ? "Apna argument Hinglish mein likhein... (Enter to send)"
                            : "Type your argument here... (Enter to send)"
                      }
                      value={liveTextInputVal}
                      onChange={(e) => setLiveTextInputVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendLiveText();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      className="live-send-btn"
                      onClick={handleSendLiveText}
                    >
                      Send Stance
                    </button>
                  </div>
                ) : (
                  <div
                    className="status-hint italic"
                    key={`${activeSpeaker}-caption`}
                  >
                    {activeSpeaker === "user" &&
                    !isTranscribing &&
                    !liveCaption ? (
                      <span className="user-transcription">
                        Tap <strong>START MIC 🎙️</strong> above to speak your
                        argument, or toggle keyboard mode...
                      </span>
                    ) : (
                      <span className="live-caption-text">
                        {liveCaption || "..."}
                      </span>
                    )}
                    <div ref={captionEndRef} />
                  </div>
                )}
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
              Finalizing now will submit your current arguments for{" "}
              <strong>AI Performance Analysis</strong>. Are you ready for your
              final verdict?
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
                <span></span>
                <span></span>
                <span></span>
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
                  const uScore =
                    realAnalysis?.userScore ?? realAnalysis?.overallScore ?? 0;
                  const aScore =
                    realAnalysis?.aiScore ??
                    (realAnalysis ? 100 - (realAnalysis.overallScore ?? 0) : 0);
                  const userWon = uScore >= aScore;
                  const winnerStance = userWon
                    ? position
                    : position === "for"
                      ? "against"
                      : "for";
                  const winnerTheme =
                    winnerStance === "for" ? "for-theme" : "against-theme";

                  return (
                    <div className={`winner-badge ${winnerTheme}`}>
                      <span className="trophy-icon">🏆</span>
                      <h3 className="winner-status">
                        DEBATE COMPLETE • {userWon ? "YOU WON" : "DIBOT.AI WON"}
                      </h3>
                    </div>
                  );
                })()}

                <div className="eval-scores-grid">
                  <div className="eval-score-item logic-item">
                    <span className="eval-score-label">LOGIC</span>
                    <span className="eval-score-value animate-pop">
                      {displayScores.logic}
                    </span>
                  </div>
                  <div className="eval-score-item persuasion-item">
                    <span className="eval-score-label">PERSUASION</span>
                    <span className="eval-score-value animate-pop">
                      {displayScores.persuasion}
                    </span>
                  </div>
                </div>

                <div className="points-vs-card">
                  <div className="point-item user-pts">
                    <span className="point-label">Yours</span>
                    <span className="point-val animate-pop">
                      {displayScores.userPts}
                    </span>
                  </div>
                  <div className="vs-mid-badge">VS</div>
                  <div className="point-item ai-pts">
                    <span className="point-val animate-pop">
                      {displayScores.aiPts}
                    </span>
                    <span className="point-label">AI</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-eval btn-back-home"
                onClick={() => (window.location.href = "/")}
              >
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
                  <p>
                    "
                    {realAnalysis?.feedback ||
                      "Great effort! You maintained your position well."}
                    "
                  </p>
                </div>

                <div className="feedback-grid">
                  <div className="feedback-section strengths">
                    <h4 className="feedback-section-title">KEY STRENGTHS</h4>
                    <div className="feedback-list">
                      {(realAnalysis?.strengths || ["Persuasion"]).map(
                        (s, i) => (
                          <div key={i} className="feedback-item">
                            <span className="check-icon">✓</span> {s}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="feedback-section growth">
                    <h4 className="feedback-section-title">AREAS FOR GROWTH</h4>
                    <div className="feedback-list">
                      {(realAnalysis?.improvementAreas || ["Logic Depth"]).map(
                        (a, i) => (
                          <div key={i} className="feedback-item">
                            <span className="error-icon">!</span> {a}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="feedback-section fallacies">
                    <h4
                      className="feedback-section-title"
                      style={{ color: "#f59e0b" }}
                    >
                      DETECTED FALLACIES
                    </h4>
                    <div className="feedback-list">
                      {realAnalysis?.fallacies?.length > 0 ? (
                        realAnalysis.fallacies.map((f, i) => (
                          <div key={i} className="feedback-item">
                            <span className="warn-icon">⚠️</span> {f}
                          </div>
                        ))
                      ) : (
                        <div className="feedback-item" style={{ opacity: 0.6 }}>
                          <span className="check-icon">✓</span> Clean logic! No
                          fallacies detected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="eval-actions-row">
                <button
                  className="btn-eval btn-debate-again"
                  onClick={() => window.location.reload()}
                >
                  DEBATE AGAIN
                </button>
                <button
                  className="btn-eval btn-back-home mobile-only-btn"
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebatePage;
