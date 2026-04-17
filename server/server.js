import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import debateRoutes from "./routes/debateRoutes.js";

dotenv.config({ path: "../.env" });
dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173"],
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "dibotai-server" });
});

app.use("/api/debate", debateRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
