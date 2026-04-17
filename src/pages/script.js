const mobileToggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelector(".nav-links");
const header = document.querySelector("header");

const debateModal = document.getElementById("debate-modal");
const topicSection = document.getElementById("topic-section");
const positionSection = document.getElementById("position-section");
const customTopicSection = document.getElementById("custom-topic-section");

const startDebateButtons = document.querySelectorAll(".start-debate-btn");
const topicItems = document.querySelectorAll(".topic-item");
const positionCards = document.querySelectorAll(".position-card");

const selectedTopicText = document.getElementById("selected-topic-text");
const continueToDebateBtn = document.getElementById("continue-to-debate");
const customTopicBtn = document.querySelector(".custom-topic-btn");
const customTopicTextarea = document.getElementById("custom-topic-textarea");
const confirmCustomTopicBtn = document.getElementById("confirm-custom-topic");
const charCount = document.getElementById("char-count");

const backToTopicsBtn = document.getElementById("back-to-topics");
const backToTopicsFromCustomBtn = document.getElementById(
  "back-to-topics-from-custom",
);

const state = {
  selectedTopic: "",
  selectedPosition: "",
};

function toggleBodyScroll(isLocked) {
  document.body.classList.toggle("modal-open", isLocked);
}

function resetPositionSelection() {
  state.selectedPosition = "";
  positionCards.forEach((card) => card.classList.remove("selected"));

  if (continueToDebateBtn) {
    continueToDebateBtn.disabled = true;
    continueToDebateBtn.textContent = "Continue to Difficulty Selection";
    continueToDebateBtn.style.opacity = "";
  }
}

function showTopicSelection() {
  if (topicSection) {
    topicSection.hidden = false;
  }

  if (positionSection) {
    positionSection.classList.remove("active");
  }
}

function openModal() {
  if (!debateModal) {
    return;
  }

  debateModal.classList.add("active");
  toggleBodyScroll(true);
  closeCustomTopicOverlay();
  resetFlow();
}

function closeModal() {
  if (!debateModal) {
    return;
  }

  debateModal.classList.remove("active");
  closeCustomTopicOverlay();
  toggleBodyScroll(false);
}

function resetFlow() {
  state.selectedTopic = "";
  resetPositionSelection();
  topicItems.forEach((item) => item.classList.remove("selected"));
  showTopicSelection();
}

function openPositionSelection(topic) {
  state.selectedTopic = topic.trim();
  resetPositionSelection();

  if (selectedTopicText) {
    selectedTopicText.textContent = `"${state.selectedTopic}"`;
  }

  if (topicSection) {
    topicSection.hidden = true;
  }

  if (positionSection) {
    positionSection.classList.add("active");
  }

  closeCustomTopicOverlay();
}

function openCustomTopicOverlay() {
  if (!customTopicSection) {
    return;
  }

  customTopicSection.classList.add("active");

  if (customTopicTextarea) {
    const value =
      state.selectedTopic &&
      !Array.from(topicItems).some(
        (item) => item.dataset.topic === state.selectedTopic,
      )
        ? state.selectedTopic
        : "";
    customTopicTextarea.value = value;
    updateCharCount();
    customTopicTextarea.focus();
  }
}

function closeCustomTopicOverlay() {
  if (customTopicSection) {
    customTopicSection.classList.remove("active");
  }
}

function updateCharCount() {
  if (!customTopicTextarea || !charCount || !confirmCustomTopicBtn) {
    return;
  }

  const value = customTopicTextarea.value.trim();
  charCount.textContent = String(customTopicTextarea.value.length);
  confirmCustomTopicBtn.disabled = value.length < 10;
}

function continueToDifficulty() {
  if (!state.selectedTopic || !state.selectedPosition) {
    return;
  }

  localStorage.setItem("debateTopic", state.selectedTopic);
  localStorage.setItem("userPosition", state.selectedPosition);

  if (continueToDebateBtn) {
    continueToDebateBtn.disabled = true;
    continueToDebateBtn.textContent = "Opening...";
    continueToDebateBtn.style.opacity = "0.7";
  }

  setTimeout(() => {
    window.location.href = "difficulty-selection.html";
  }, 350);
}

startDebateButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });
});

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

if (navLinks) {
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

if (debateModal) {
  debateModal.addEventListener("click", (event) => {
    if (event.target === debateModal) {
      closeModal();
    }
  });
}

topicItems.forEach((item) => {
  item.addEventListener("click", () => {
    topicItems.forEach((topic) => topic.classList.remove("selected"));
    item.classList.add("selected");
    openPositionSelection(item.dataset.topic || "");
  });
});

positionCards.forEach((card) => {
  card.addEventListener("click", () => {
    positionCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
    state.selectedPosition = card.dataset.position || "";

    if (continueToDebateBtn) {
      continueToDebateBtn.disabled =
        !state.selectedTopic || !state.selectedPosition;
    }
  });
});

if (continueToDebateBtn) {
  continueToDebateBtn.addEventListener("click", continueToDifficulty);
}

if (customTopicBtn) {
  customTopicBtn.addEventListener("click", openCustomTopicOverlay);
}

if (backToTopicsBtn) {
  backToTopicsBtn.addEventListener("click", () => {
    showTopicSelection();
    resetPositionSelection();
  });
}

if (backToTopicsFromCustomBtn) {
  backToTopicsFromCustomBtn.addEventListener("click", closeCustomTopicOverlay);
}

if (customTopicTextarea) {
  customTopicTextarea.addEventListener("input", updateCharCount);
}

if (confirmCustomTopicBtn) {
  confirmCustomTopicBtn.addEventListener("click", () => {
    if (!customTopicTextarea) {
      return;
    }

    const customTopic = customTopicTextarea.value.trim();
    if (customTopic.length < 10) {
      return;
    }

    topicItems.forEach((item) => item.classList.remove("selected"));
    openPositionSelection(customTopic);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (customTopicSection?.classList.contains("active")) {
      closeCustomTopicOverlay();
      return;
    }

    if (debateModal?.classList.contains("active")) {
      closeModal();
    }
  }
});

window.addEventListener("scroll", () => {
  if (!header) {
    return;
  }

  header.style.boxShadow =
    window.scrollY > 100
      ? "0 5px 20px rgba(0, 0, 0, 0.1)"
      : "0 2px 10px rgba(0, 0, 0, 0.1)";
});

updateCharCount();

const debateRoom = {
  fallbackTopic: "Universal Basic Income is necessary for a modern economy",
  fallbackPosition: "for",
  fallbackDifficulty: "medium",
  difficultyLabels: {
    easy: "Beginner",
    medium: "Intermediate",
    hard: "Advanced",
    expert: "Expert",
  },
  roundDurations: {
    3: 300,
    5: 600,
    7: 900,
    10: 1200,
  },
  topic:
    localStorage.getItem("debateTopic") ||
    "Universal Basic Income is necessary for a modern economy",
  position: (localStorage.getItem("userPosition") || "for").toLowerCase(),
  difficulty: (
    localStorage.getItem("debateDifficulty") || "medium"
  ).toLowerCase(),
  totalRounds: Number(localStorage.getItem("debateRounds")) || 3,
  round: 1,
  yourScore: 0,
  aiScore: 0,
  timeLeft: 300,
  timerInterval: null,
  isAiTyping: false,
  isMicOn: false,
  debateEnded: false,
  conversationHistory: [],
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMessage(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function updateDebateTimerDisplay() {
  const timerEl = document.getElementById("timer");
  if (!timerEl) {
    return;
  }

  const minutes = Math.floor(debateRoom.timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (debateRoom.timeLeft % 60).toString().padStart(2, "0");

  timerEl.textContent = `${minutes}:${seconds}`;
  timerEl.className = "timer";

  if (debateRoom.timeLeft <= 120) {
    timerEl.classList.add("warn");
  }

  if (debateRoom.timeLeft <= 30) {
    timerEl.classList.remove("warn");
    timerEl.classList.add("danger");
  }
}

function updateDebateRoundUi() {
  const roundNum = document.getElementById("roundNum");
  const roundTotal = document.getElementById("roundTotal");
  const roundFill = document.getElementById("roundFill");
  const roundLabel = document.getElementById("roundLabel");
  const initialRoundLabel = document.getElementById("initialRoundLabel");

  if (roundNum) {
    roundNum.textContent = String(debateRoom.round);
  }

  if (roundTotal) {
    roundTotal.textContent = `of ${debateRoom.totalRounds}`;
  }

  if (roundFill) {
    roundFill.style.width = `${(debateRoom.round / debateRoom.totalRounds) * 100}%`;
  }

  if (roundLabel) {
    roundLabel.textContent = `Round ${debateRoom.round} of ${debateRoom.totalRounds} · Your turn to speak`;
  }

  if (initialRoundLabel) {
    initialRoundLabel.textContent = `Round 1 of ${debateRoom.totalRounds}`;
  }
}

function buildOpeningMessage() {
  const aiSide = debateRoom.position === "for" ? "AGAINST" : "FOR";
  return `Welcome to the debate. The topic is "${debateRoom.topic}". You are arguing ${debateRoom.position.toUpperCase()} this position, and I will argue ${aiSide}. Start with your clearest opening claim, then defend it with one concrete reason.`;
}

function setDebateOpeningMessage(message) {
  const openingEl = document.querySelector(".ai-bubble");
  if (!openingEl) {
    return;
  }

  openingEl.innerHTML = formatMessage(message);
  debateRoom.conversationHistory = [{ role: "assistant", content: message }];
}

function addDebateMessage(role, text) {
  const messages = document.getElementById("messages");
  if (!messages) {
    return;
  }

  const item = document.createElement("div");
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  item.className = `msg ${role}`;
  item.innerHTML =
    role === "ai"
      ? `<div class="avatar ai-av">AI</div>
         <div class="bubble">
           <div class="bubble-meta">DiBot.AI · ${time}</div>
           <div class="bubble-text ai-bubble">${formatMessage(text)}</div>
         </div>`
      : `<div class="avatar user-av">U</div>
         <div class="bubble">
           <div class="bubble-meta">${time}</div>
           <div class="bubble-text user-bubble">${formatMessage(text)}</div>
         </div>`;

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

function addTypingIndicator() {
  const messages = document.getElementById("messages");
  if (!messages) {
    return "";
  }

  const item = document.createElement("div");
  const id = `typing-${Date.now()}`;
  item.className = "msg ai";
  item.id = id;
  item.innerHTML = `<div class="avatar ai-av">AI</div>
    <div class="bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function addDebateRoundSeparator(roundNumber) {
  const messages = document.getElementById("messages");
  if (!messages) {
    return;
  }

  const item = document.createElement("div");
  item.className = "round-sep";
  item.innerHTML = `<div class="round-sep-line"></div>
    <div class="round-sep-label">Round ${roundNumber} of ${debateRoom.totalRounds}</div>
    <div class="round-sep-line"></div>`;

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

function updateDebateMetrics() {
  const samples = [
    { pace: "118 wpm", filler: "1", clarity: "High", strength: "Strong" },
    {
      pace: "132 wpm",
      filler: "0",
      clarity: "Very High",
      strength: "Excellent",
    },
    { pace: "104 wpm", filler: "2", clarity: "Medium", strength: "Good" },
    { pace: "141 wpm", filler: "1", clarity: "High", strength: "Strong" },
  ];

  const sample = samples[Math.floor(Math.random() * samples.length)];

  const paceVal = document.getElementById("paceVal");
  const fillerVal = document.getElementById("fillerVal");
  const clarityVal = document.getElementById("clarityVal");
  const strengthVal = document.getElementById("strengthVal");

  if (paceVal) {
    paceVal.textContent = sample.pace;
    paceVal.className = "metric-val good";
  }

  if (fillerVal) {
    fillerVal.textContent = sample.filler;
    fillerVal.className = `metric-val ${sample.filler === "2" ? "ok" : "good"}`;
  }

  if (clarityVal) {
    clarityVal.textContent = sample.clarity;
    clarityVal.className = `metric-val ${sample.clarity === "Medium" ? "ok" : "good"}`;
  }

  if (strengthVal) {
    strengthVal.textContent = sample.strength;
    strengthVal.className = `metric-val ${sample.strength === "Good" ? "ok" : "good"}`;
  }
}

function buildFallbackReply(userText) {
  const cleaned = userText.replace(/\s+/g, " ").trim();
  const shortClaim =
    cleaned.length > 110 ? `${cleaned.slice(0, 107)}...` : cleaned;
  const aiSide = debateRoom.position === "for" ? "against" : "for";

  const variants = {
    easy: [
      `You argue that "${shortClaim}", but that still assumes the policy will work as intended in every case. If the idea is truly necessary, what evidence shows it can be funded and managed without creating new problems?`,
      "That sounds reasonable on the surface, but necessity is a much stronger claim than usefulness. Why should the judge accept this as essential rather than simply helpful?",
    ],
    medium: [
      "Your point highlights one benefit, but it does not prove the trade-off is worth the national cost. If the state must carry that burden long term, where is the evidence that productivity and public revenue will keep pace?",
      "You are treating a possible outcome as a reliable one. Why should we commit to a system this large before you show that the same resources could not solve the problem more efficiently elsewhere?",
    ],
    hard: [
      "That argument depends on the best-case version of the policy, not the version that survives contact with tax pressure, uneven participation, and political compromise. If necessity is your standard, how do you justify a model that can weaken incentives while demanding permanent funding?",
      "You are asking the judge to ignore the implementation gap. Even if the principle sounds fair, why should society accept a costly universal promise when targeted intervention could produce stronger outcomes with less distortion?",
    ],
    expert: [
      `Your claim collapses the distinction between moral appeal and policy sufficiency. On the ${aiSide.toUpperCase()} side, I only need to show that your mechanism is under-justified, fiscally vulnerable, and less efficient than narrower alternatives, so what is your strongest proof that universality adds value rather than waste?`,
      "You are defending necessity, yet your reasoning shows at most plausibility. If the burden is that high, how do you answer the charge that universality creates deadweight cost while leaving the core structural problem largely untouched?",
    ],
  };

  const pool = variants[debateRoom.difficulty] || variants.medium;
  return pool[debateRoom.conversationHistory.length % pool.length];
}

async function getDebateReply(userText) {
  try {
    const response = await fetch("http://localhost:5000/api/debate/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
        topic: debateRoom.topic,
        position: debateRoom.position,
        difficulty: debateRoom.difficulty,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof data?.reply === "string" && data.reply.trim()) {
        return data.reply.trim();
      }
    }
  } catch (error) {
    console.warn("Falling back to local debate engine:", error);
  }

  return buildFallbackReply(userText);
}

function initDebateRoom() {
  debateRoom.timeLeft =
    debateRoom.roundDurations[debateRoom.totalRounds] || 300;

  const sidebarTopic = document.getElementById("sidebarTopic");
  const sidebarPosition = document.getElementById("sidebarPosition");
  const difficultyText = document.getElementById("difficultyText");

  if (sidebarTopic) {
    sidebarTopic.textContent = debateRoom.topic;
  }

  if (sidebarPosition) {
    sidebarPosition.textContent = `✓ ${debateRoom.position.toUpperCase()}`;
  }

  if (difficultyText) {
    difficultyText.textContent =
      debateRoom.difficultyLabels[debateRoom.difficulty] || "Intermediate";
  }

  updateDebateRoundUi();
  updateDebateTimerDisplay();
  setDebateOpeningMessage(buildOpeningMessage());

  clearInterval(debateRoom.timerInterval);
  debateRoom.timerInterval = window.setInterval(() => {
    if (debateRoom.debateEnded) {
      clearInterval(debateRoom.timerInterval);
      return;
    }

    debateRoom.timeLeft -= 1;
    updateDebateTimerDisplay();

    if (debateRoom.timeLeft <= 0) {
      endDebate();
    }
  }, 1000);

  onType();
}

function onType() {
  const input = document.getElementById("inputBox");
  const sendBtn = document.getElementById("sendBtn");
  const charCountEl = document.getElementById("charCount");

  if (!input || !sendBtn || !charCountEl) {
    return;
  }

  charCountEl.textContent = `${input.value.length} / 500`;
  sendBtn.disabled =
    input.value.trim().length < 3 ||
    debateRoom.isAiTyping ||
    debateRoom.debateEnded;
}

function onKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    void sendMessage();
  }
}

function toggleMic() {
  const button = document.getElementById("micBtn");
  const input = document.getElementById("inputBox");

  if (!button || !input || debateRoom.debateEnded) {
    return;
  }

  debateRoom.isMicOn = !debateRoom.isMicOn;

  if (debateRoom.isMicOn) {
    button.classList.add("recording");
    button.innerHTML =
      '<div class="waveform"><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div></div>';
    input.placeholder = "Listening... speak your argument";

    window.setTimeout(() => {
      if (!debateRoom.isMicOn || debateRoom.debateEnded) {
        return;
      }

      input.value =
        "A reliable safety net gives people room to keep learning, change careers, and stay economically active during disruption.";
      onType();
      toggleMic();
    }, 2500);
  } else {
    button.classList.remove("recording");
    button.textContent = "🎤";
    input.placeholder = "Type your argument here, or use the mic to speak...";
  }
}

async function sendMessage() {
  const input = document.getElementById("inputBox");
  const sendBtn = document.getElementById("sendBtn");
  const roundLabel = document.getElementById("roundLabel");
  const yourScoreEl = document.getElementById("yourScore");
  const aiScoreEl = document.getElementById("aiScore");

  if (!input || !sendBtn || !roundLabel || !yourScoreEl || !aiScoreEl) {
    return;
  }

  const text = input.value.trim();
  if (!text || debateRoom.isAiTyping || debateRoom.debateEnded) {
    return;
  }

  addDebateMessage("user", text);
  debateRoom.conversationHistory.push({ role: "user", content: text });

  input.value = "";
  input.disabled = true;
  onType();

  updateDebateMetrics();
  debateRoom.yourScore += Math.floor(Math.random() * 8) + 12;
  yourScoreEl.textContent = String(debateRoom.yourScore);

  debateRoom.isAiTyping = true;
  roundLabel.textContent = `Round ${debateRoom.round} of ${debateRoom.totalRounds} · AI is responding...`;

  const typingId = addTypingIndicator();
  const aiReply = await getDebateReply(text);

  removeTypingIndicator(typingId);
  addDebateMessage("ai", aiReply);
  debateRoom.conversationHistory.push({ role: "assistant", content: aiReply });

  debateRoom.aiScore += Math.floor(Math.random() * 6) + 10;
  aiScoreEl.textContent = String(debateRoom.aiScore);

  debateRoom.isAiTyping = false;
  input.disabled = false;
  input.focus();

  if (debateRoom.round >= debateRoom.totalRounds) {
    endDebate();
    return;
  }

  debateRoom.round += 1;
  updateDebateRoundUi();
  addDebateRoundSeparator(debateRoom.round);
  onType();
}

function endDebate() {
  if (debateRoom.debateEnded) {
    return;
  }

  debateRoom.debateEnded = true;
  clearInterval(debateRoom.timerInterval);

  const input = document.getElementById("inputBox");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");

  if (input) {
    input.disabled = true;
  }

  if (sendBtn) {
    sendBtn.disabled = true;
  }

  if (micBtn) {
    micBtn.disabled = true;
  }

  const won = debateRoom.yourScore >= debateRoom.aiScore;
  const modal = document.createElement("div");
  modal.id = "end-modal";
  modal.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:999;animation:fadeIn 0.35s ease;";
  modal.innerHTML = `
    <div style="background:#141418;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px 44px;max-width:420px;width:90%;text-align:center;animation:slideUp 0.35s ease;">
      <div style="font-size:52px;margin-bottom:16px;">${won ? "🏆" : "🤖"}</div>
      <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;color:${won ? "#00c896" : "#e84040"};font-family:'JetBrains Mono',monospace;margin-bottom:10px;">${won ? "DEBATE COMPLETE · YOU WON" : "DEBATE COMPLETE · AI WINS"}</div>
      <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;margin-bottom:6px;">${won ? "Well Argued!" : "Keep Practicing!"}</div>
      <div style="font-size:14px;color:#6a6a7a;margin-bottom:28px;line-height:1.6;">${won ? "Your arguments held up better across the exchange." : "The rebuttals were tougher this round, but your next attempt will be sharper."}</div>
      <div style="display:flex;justify-content:center;gap:32px;margin-bottom:28px;">
        <div>
          <div style="font-size:32px;font-weight:700;color:#4f8ef7;">${debateRoom.yourScore}</div>
          <div style="font-size:11px;color:#6a6a7a;margin-top:2px;">Your Score</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,0.08);"></div>
        <div>
          <div style="font-size:32px;font-weight:700;color:#00c896;">${debateRoom.aiScore}</div>
          <div style="font-size:11px;color:#6a6a7a;margin-top:2px;">AI Score</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button onclick="goHome()" style="width:100%;padding:14px;background:#1e2535;border:1px solid rgba(79,142,247,0.3);border-radius:12px;color:#e8e8e8;font-size:15px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;">← Back to Home</button>
        <button onclick="location.reload()" style="width:100%;padding:13px;background:transparent;border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#6a6a7a;font-size:14px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;">Debate Again</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function goHome() {
  window.location.href = "index.html";
}

window.toggleMic = toggleMic;
window.onType = onType;
window.onKey = onKey;
window.sendMessage = sendMessage;
window.endDebate = endDebate;
window.goHome = goHome;

if (
  document.getElementById("messages") &&
  document.getElementById("inputBox")
) {
  initDebateRoom();
}
