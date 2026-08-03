import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechToText = (options = {}) => {
    const { 
        lang = 'en-US', 
        interimResults = true, 
        continuous = true,
        onEnd = null
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);
    
    const recognitionRef = useRef(null);
    const onEndRef = useRef(onEnd);
    const transcriptRef = useRef("");
    
    // Track if we *should* be listening (user toggled it on)
    const shouldListenRef = useRef(false);
    // Accumulate text across browser restarts
    const finalTranscriptRef = useRef("");

    // Backoff and throttle mechanisms to prevent aggressive crash-loops
    const lastRestartTimeRef = useRef(0);
    const restartAttemptsRef = useRef(0);
    const restartTimeoutRef = useRef(null);

    useEffect(() => {
        onEndRef.current = onEnd;
    }, [onEnd]);

    const cleanupRecognition = useCallback((rec) => {
        if (!rec) return;
        try {
            rec.onstart = null;
            rec.onerror = null;
            rec.onend = null;
            rec.onresult = null;
        } catch (err) {
            console.warn("Failed cleaning up recognition listeners", err);
        }
    }, []);

    const startListening = useCallback(() => {
        setError(null);
        transcriptRef.current = "";
        finalTranscriptRef.current = "";
        setTranscript("");
        shouldListenRef.current = true;
        restartAttemptsRef.current = 0;

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError("Speech recognition not supported in this browser.");
            console.error("Speech recognition not supported");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        const initRecognition = () => {
            // Cleanup previous instance if it exists
            if (recognitionRef.current) {
                cleanupRecognition(recognitionRef.current);
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }

            const rec = new SpeechRecognition();
            rec.lang = lang;
            rec.interimResults = interimResults;
            rec.continuous = continuous;

            rec.onstart = () => {
                setIsListening(true);
                restartAttemptsRef.current = 0; // Reset attempts on successful start
            };

            rec.onresult = (event) => {
                let interimTranscript = "";
                let currentFinalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        currentFinalTranscript += event.results[i][0].transcript + " ";
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (currentFinalTranscript) {
                    finalTranscriptRef.current += currentFinalTranscript;
                }

                const fullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
                transcriptRef.current = fullTranscript;
                setTranscript(fullTranscript);
            };

            rec.onerror = (event) => {
                const errorType = event.error;
                console.warn(`Speech recognition error [${errorType}]`);

                // Classify Fatal vs Recoverable
                const fatalErrors = ['not-allowed', 'service-not-allowed', 'language-not-supported', 'network'];
                
                if (fatalErrors.includes(errorType)) {
                    setError(`Fatal: ${errorType}`);
                    shouldListenRef.current = false; // Stops the restart loop
                    setIsListening(false);
                } else {
                    // Transient issues (aborted, no-speech, audio-capture)
                    // We don't set shouldListen to false, allowing the loop to restart.
                    if (errorType !== 'no-speech' && errorType !== 'aborted') {
                        setError(`Notice: ${errorType}`);
                    }
                }
            };

            rec.onend = () => {
                // IMPORTANT: Clean up old handlers immediately to avoid leak / double execution
                cleanupRecognition(rec);

                if (shouldListenRef.current) {
                    console.log("Speech ended natively. Coordinating robust auto-restart...");
                    
                    // Implement intelligent backoff to prevent spinlocking the CPU
                    const now = Date.now();
                    const timeSinceLastRestart = now - lastRestartTimeRef.current;
                    lastRestartTimeRef.current = now;

                    if (timeSinceLastRestart < 1500) {
                        restartAttemptsRef.current += 1;
                    } else {
                        restartAttemptsRef.current = 0;
                    }

                    // Calculate delay: standard 300ms, goes up to 3000ms if failing repeatedly
                    let restartDelay = 300;
                    if (restartAttemptsRef.current > 3) {
                        restartDelay = 3000;
                        console.warn("Too many rapid restarts. Throttling restart to 3 seconds.");
                    }

                    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

                    restartTimeoutRef.current = setTimeout(() => {
                        if (shouldListenRef.current) {
                            try {
                                console.log("Attempting scheduled speech restart...");
                                recognitionRef.current = initRecognition();
                                recognitionRef.current.start();
                            } catch (err) {
                                console.error("Scheduled restart failed:", err);
                                // If starting throws instantly, it will not trigger onend. 
                                // Force another attempt later if shouldListen remains true.
                                if (shouldListenRef.current) {
                                    setIsListening(false);
                                    // Keep trying after delay
                                    setTimeout(() => {
                                        if (shouldListenRef.current) {
                                            try {
                                                recognitionRef.current = initRecognition();
                                                recognitionRef.current.start();
                                            } catch(e) {}
                                        }
                                    }, 2000);
                                }
                            }
                        }
                    }, restartDelay);
                } else {
                    setIsListening(false);
                    if (onEndRef.current) {
                        onEndRef.current(transcriptRef.current);
                    }
                }
            };

            return rec;
        };

        try {
            recognitionRef.current = initRecognition();
            recognitionRef.current.start();
            lastRestartTimeRef.current = Date.now();
        } catch (e) {
            setError("Failed to start engine.");
            setIsListening(false);
            console.error("Initial start error:", e);
        }
    }, [lang, interimResults, continuous, cleanupRecognition]);

    const stopListening = useCallback(() => {
        shouldListenRef.current = false; // Signal to onend that we are done
        restartAttemptsRef.current = 0;
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

        if (recognitionRef.current) {
            try {
                // Gracefully stop to trigger final onend asynchronously
                recognitionRef.current.stop();
            } catch(e) {
                try {
                    // If not started or error, force abort to trigger onend
                    recognitionRef.current.abort();
                } catch(err) {
                    // If both fail, it was already inactive. Cleanup manually.
                    setIsListening(false);
                    if (onEndRef.current) {
                        onEndRef.current(transcriptRef.current);
                    }
                }
            }
            // We DO NOT call cleanupRecognition or null the ref here.
            // We let the final 'onend' callback do the cleanup and dispatch transcript.
        } else {
            setIsListening(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            shouldListenRef.current = false;
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch(e) {}
                cleanupRecognition(recognitionRef.current);
                recognitionRef.current = null;
            }
        };
    }, [cleanupRecognition]);

    return {
        isListening,
        transcript,
        transcriptRef,
        error,
        startListening,
        stopListening,
        setTranscript
    };
};

export default useSpeechToText;
