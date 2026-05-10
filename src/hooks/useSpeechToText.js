import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechToText = (options = {}) => {
    const { 
        lang = 'en-US', 
        interimResults = true, 
        continuous = true 
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
            console.error("Speech recognition not supported");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.lang = lang;
        recognitionRef.current.interimResults = interimResults;
        recognitionRef.current.continuous = continuous;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setTranscript("");
        };

        recognitionRef.current.onresult = (event) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.start();
    }, [lang, interimResults, continuous]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        setTranscript
    };
};

export default useSpeechToText;
