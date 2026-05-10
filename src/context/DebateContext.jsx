import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const DebateContext = createContext();

export const useDebate = () => {
    const context = useContext(DebateContext);
    if (!context) {
        throw new Error('useDebate must be used within a DebateProvider');
    }
    return context;
};

export const DebateProvider = ({ children }) => {
    // Session Info
    const [topic, setTopic] = useState("");
    const [position, setPosition] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [totalRounds, setTotalRounds] = useState(3);
    const [round, setRound] = useState(1);
    const [debateId, setDebateId] = useState(null);
    
    // Conversation State
    const [messages, setMessages] = useState([]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    
    // Performance State
    const [yourScore, setYourScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [metrics, setMetrics] = useState({
        pace: "—",
        filler: "—",
        clarity: "—",
        strength: "—",
    });

    // UI Controls
    const [isPaused, setIsPaused] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);

    // WebSocket Integration
    const { 
        isConnected, 
        isAiThinking, 
        incomingMessage, 
        incomingScore, 
        sendMessage,
        setIncomingMessage,
        setIncomingScore
    } = useWebSocket(debateId);

    // Sync AI Thinking state
    useEffect(() => {
        setIsAiTyping(isAiThinking);
    }, [isAiThinking]);

    // Handle incoming messages from Socket
    useEffect(() => {
        if (incomingMessage) {
            setMessages((prev) => [...prev, incomingMessage]);
            setIncomingMessage(null); // Clear after processing
        }
    }, [incomingMessage, setIncomingMessage]);

    // Handle incoming scores from Socket
    useEffect(() => {
        if (incomingScore) {
            const { target, points } = incomingScore;
            if (target === 'user') setYourScore(v => v + points);
            else setAiScore(v => v + points);
            setIncomingScore(null); // Clear after processing
        }
    }, [incomingScore, setIncomingScore]);

    // Helpers to update state
    const addMessage = useCallback((message) => {
        setMessages((prev) => [...prev, { id: Date.now(), ...message }]);
    }, []);

    const updateScore = useCallback((scoreType, val) => {
        if (scoreType === 'user') setYourScore(v => v + val);
        else setAiScore(v => v + val);
    }, []);

    const value = {
        topic, setTopic,
        position, setPosition,
        difficulty, setDifficulty,
        totalRounds, setTotalRounds,
        round, setRound,
        debateId, setDebateId,
        messages, setMessages, addMessage,
        isAiTyping, setIsAiTyping,
        yourScore, setYourScore, updateScore,
        aiScore, setAiScore,
        timeLeft, setTimeLeft,
        metrics, setMetrics,
        isPaused, setIsPaused,
        isLiveMode, setIsLiveMode,
        isMicOn, setIsMicOn,
        isConnected, sendMessage
    };

    return (
        <DebateContext.Provider value={value}>
            {children}
        </DebateContext.Provider>
    );
};
