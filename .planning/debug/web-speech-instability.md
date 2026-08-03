---
status: resolved
trigger: "Kabhi chrome me work kar raha hai to kabhi edge me ... Web speech"
created: 2026-05-13
updated: 2026-05-13
---

# Debug Session: Web Speech Instability

## Expected Behavior
Speech recognition should remain continuously listening during a debate turn, automatically restarting if it times out naturally due to silence, and handling minor network blips or aborted connections without permanently stopping.

## Actual Behavior
The speech recognition works intermittently. It stops working on Chrome or Edge after varying intervals. Once it stops, it does not restart itself, requiring manual refreshes or clicks.

## Investigation & Hypotheses
- **Hypothesis 1**: The current `onerror` handler sets `shouldListenRef.current = false` for ALL non-"no-speech" errors.
  - *Verification*: Confirmed in `useSpeechToText.js` line 78-82. Common errors like `aborted` and `network` (highly common in Edge due to Cloud backend) fall into this else block and permanently disable listening.
- **Hypothesis 2**: Chromium audio device locks are causing `InvalidStateError` or rapid `aborted` loops when immediately calling `.start()` inside `onend`.
  - *Verification*: Edge/Chrome Speech API triggers `onend` while still cleaning up resources. Calling `.start()` immediately often causes an overlapping state, resulting in `aborted` which triggers Hypothesis 1 and kills the engine.

## Evidence
1. Line 73-83 of `useSpeechToText.js`:
```javascript
            rec.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                // Don't set hard error for common silence timeout
                if (event.error === "no-speech") {
                    // We let it auto-restart silently in onend
                } else {
                    setError(event.error);
                    // Stop auto-restart loop on fatal errors (permission, network, service etc)
                    shouldListenRef.current = false; // <-- ROOT CAUSE
                }
            };
```

## Proposed Fix
1. Categorize errors into **Fatal** (not-allowed, service-not-allowed, language-not-supported) vs **Recoverable** (no-speech, aborted, network, audio-capture).
2. Only set `shouldListenRef.current = false` for fatal errors.
3. Prevent memory leaks and multiple instance proliferation by stripping listeners from the old SpeechRecognition object in `onend` before spinning up the new one.
4. Enforce an intelligent backoff/throttle logic on restarts to prevent aggressive spin-locking if browser is offline or failing.

## Resolution
- **Status**: FIXED & VERIFIED
- **Changes Implemented**: Refactored `src/hooks/useSpeechToText.js`. Introduced explicit `cleanupRecognition` callback to strip listeners inside `onend` and `useEffect` returns. Introduced dynamic throttle delay ranging from 300ms to 3000ms when auto-restarting. Refactored `onerror` to skip setting `shouldListenRef.current = false` for non-fatal errors like `aborted` and `network`.
- **Follow-up Fix (AI Response Trigger)**: Fixed a regression in `stopListening` where event listeners were being stripped and `recognitionRef.current` nulled immediately. This prevented the native `onend` callback from ever executing, which was blocking the dispatch of the final transcript back to `DebatePage.jsx` (thus stopping AI triggers). Refactored `stopListening` to set `shouldListenRef.current = false` and call `recognition.stop()` only, allowing the final asynchronous `onend` handler to naturally fire, clean up, and dispatch the transcript.
- **Verification**: Both speech continuity and automatic AI-turn dispatch are fully operational.

