import { getAIReply } from "../services/aiService.js";

export const setupDebateHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-debate", (debateId) => {
      socket.join(debateId);
      console.log(`User ${socket.id} joined debate: ${debateId}`);
    });

    socket.on("user-message", async (data) => {
      const { debateId, message, topic, position, difficulty, round, totalRounds, history } = data;
      
      console.log(`Message from ${socket.id} in ${debateId}: ${message}`);
      
      // Emit "thinking" state
      io.to(debateId).emit("ai-thinking");
      
      try {
        const reply = await getAIReply(message, topic, position, difficulty, history);
        
        io.to(debateId).emit("ai-message", {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: reply
        });

        // Optional: Update AI score based on logic
        io.to(debateId).emit("score-update", {
          target: "ai",
          points: Math.floor(Math.random() * 8) + 5
        });
      } catch (err) {
        console.error("Socket AI Error:", err);
        io.to(debateId).emit("ai-message", {
          id: `error-${Date.now()}`,
          role: "ai",
          content: "I apologize, but I am experiencing some technical difficulties. Could you repeat that?"
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
