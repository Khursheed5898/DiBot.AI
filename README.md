# DiBot.AI 🌟

> **A Transparent AI Debate Partner for Educational Excellence & Critical Thinking**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Khursheed5898/DiBot.AI)
![React 19](https://img.shields.io/badge/React-19.1-blue?logo=react)
![Vite 7](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)

---

## 📖 Overview

**DiBot.AI** is a transparent, AI-powered debate platform designed to hone critical thinking, logical reasoning, and public speaking skills. Unlike conventional conversational AIs, DiBot.AI **opens the "black box" of AI logic**, giving debaters clear visibility into how arguments are deconstructed, evaluated, and counter-argued in real time.

Built with a high-fidelity **"Mercury" metallic glassmorphic design system**, DiBot.AI provides a premium experience for students, educators, competitive debaters, and lifelong learners.

---

## ✨ Key Features & Highlights

- 🔍 **Transparent AI Reasoning**: Inspect the AI's internal step-by-step logic, argument claims, counter-evidence structure, and reasoning breakdown during live debates.
- ⚔️ **Stance-Reactive Visual Arena**: Dynamic glassmorphic UI ("Mercury" theme) that seamlessly shifts visual ambiance and stance accents based on your position (**FOR** vs. **AGAINST**).
- 🎯 **Adaptive Difficulty Engine**: Choose across four dynamic difficulty levels—**Beginner**, **Intermediate**, **Advanced**, and **Expert**—adjusting tone, counter-argument tightness, and cross-examination aggressiveness.
- 📊 **Real-Time Debate Metrics Dashboard**: Monitor your debate performance live with instant tracking for:
  - ⚡ Pacing & Speaking Rate
  - 🗣️ Filler Word Frequency
  - 🎯 Argument Clarity Index
  - 🧠 Logic Strength Score
- 🚨 **Deep Fallacy Detection Engine**: Automatic post-debate and real-time detection of logical fallacies (e.g., *Ad Hominem*, *Straw Man*, *False Dilemma*, *Slippery Slope*).
- ⚡ **Real-Time Streaming & WebSockets**: Instantaneous turn-taking and response streaming powered by **Socket.io** and **Express**.
- 🔐 **JWT Auth & User Performance Dashboard**: Complete user profile dashboard tracking past debate history, win/loss stats, argument metrics over time, and difficulty progression.
- 🚀 **Production Ready Deployment**: Fully configured for one-click deployment on **Render** (`render.yaml`) and self-hosted **AWS EC2** with Nginx & PM2 ([`AWS_EC2_Deployment_Guide.md`](./AWS_EC2_Deployment_Guide.md)).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 7, React Router DOM v7 |
| **Styling & Theme** | Custom Vanilla CSS ("Mercury" Metallic Glassmorphism Design System) |
| **Real-time Engine** | Socket.io Client & Server |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ORM |
| **AI Intelligence** | Google Generative AI (Gemini) / Groq SDK (Llama 3.3 70B) |
| **Authentication** | JWT (JSON Web Tokens) & BcryptJS |
| **Deployment** | Render (`render.yaml`), AWS EC2 (Nginx + PM2), Docker-ready |

---

## 🚀 Getting Started

Follow these steps to get a local development instance of DiBot.AI running on your machine.

### Prerequisites

Make sure you have the following installed on your system:
- **[Node.js](https://nodejs.org/)** (`v18.0.0` or higher required; `v20 LTS` recommended)
- **[npm](https://www.npmjs.com/)** (`v9.0.0` or higher)
- **[MongoDB](https://www.mongodb.com/try/download/community)** (Running locally on `mongodb://localhost:27017/dibotai` or a MongoDB Atlas URI)
- **API Key**: [Google Gemini API Key](https://aistudio.google.com/app/apikey) or [Groq API Key](https://console.groq.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Khursheed5898/DiBot.AI.git
cd DiBot.AI
```

---

### 2. Configure Environment Variables

Create a `.env` file in the **root directory** of the project:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=mongodb://localhost:27017/dibotai

# Security
JWT_SECRET=your_secure_jwt_secret_here

# AI Service Keys (Provide either or both)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

*(Note: The server will read root `.env` or fallback to `server/.env` automatically).*

---

### 3. One-Command Installation

Install dependencies for both the root Vite client and the Express backend simultaneously:

```bash
npm run install-all
```

---

### 4. Run Development Servers

Launch both the Frontend (Vite) and Backend (Express) in parallel with one command:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches both Vite dev client and Express backend server in parallel |
| `npm run install-all` | Installs dependencies for both client and backend in one go |
| `npm run client` | Runs only the Vite frontend dev server |
| `npm run server` | Runs only the backend server with Nodemon live reloading |
| `npm run build` | Builds the optimized production bundle of the React client into `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm start` | Starts the production backend server (`node server/server.js`) |

---

## 📁 Directory Architecture

```text
DiBot.AI/
├── src/                        # React Frontend (Client)
│   ├── assets/                 # SVGs, images, and brand assets
│   ├── components/             # Reusable UI components (DebateRoom, MetricsPanel, ChatArea, etc.)
│   ├── context/                # React Context providers (AuthContext, DebateContext)
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Top-level pages (HomePage, DebatePage, DashboardPage, AuthPage, DifficultyPage)
│   ├── services/               # API service clients (Axios, Socket.io)
│   ├── styles/                 # Mercury design system CSS modules
│   ├── App.jsx                 # App routing & main container
│   └── main.jsx                # Entry point
├── server/                     # Express Backend & WebSocket Server
│   ├── config/                 # Database & environment configurations
│   ├── controllers/            # Request handler logic (Auth, Debate)
│   ├── handlers/               # Socket.io real-time event handlers
│   ├── middleware/             # JWT auth & error handling middleware
│   ├── models/                 # Mongoose schemas (User, DebateSession)
│   ├── routes/                 # Express API routes (`/api/auth`, `/api/debate`)
│   ├── services/               # AI reasoning service (Gemini / Groq integrators)
│   └── server.js               # Entry point for Express HTTP & WebSocket server
├── scripts/                    # Development automation scripts (`dev-runner.cjs`)
├── AWS_EC2_Deployment_Guide.md # Comprehensive AWS EC2 + Nginx + PM2 setup guide
├── DiBot_AI_Interview_Placement_Guide.md # Technical breakdown & interview preparation guide
├── render.yaml                 # Render cloud deployment specification
└── README.md                   # Project documentation
```

---

## 🌐 Production & Deployment

### 1. Render Deployment
DiBot.AI is pre-configured with `render.yaml`. Click the **Deploy to Render** button above or connect your GitHub repository directly to Render web services.

### 2. AWS EC2 Self-Hosting
For full control, refer to our detailed [`AWS_EC2_Deployment_Guide.md`](./AWS_EC2_Deployment_Guide.md) which includes:
- Amazon Linux 2023 environment setup & Node 20 LTS installation
- PM2 process management & auto-restart on reboot
- Nginx reverse proxy setup (Port 80 → Port 5000)
- System swap allocation and SSL configuration

---

## 🎓 Educational & Interview Reference

For deep technical insights into DiBot.AI's system architecture, design decisions, and AI prompt engineering techniques, see [`DiBot_AI_Interview_Placement_Guide.md`](./DiBot_AI_Interview_Placement_Guide.md).

---

## 📄 License & Attribution

&copy; 2026 **DiBot.AI** — All Rights Reserved.  
*Powered by Google Generative AI (Gemini) & Mercury Design Language.*
