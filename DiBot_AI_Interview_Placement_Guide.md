# 🎓 DiBot.Ai - Technical Interview & Placement Master Guide

## 1. Executive Summary & Project Pitch (30-Second Elevator Pitch)

> **"DiBot.Ai is a transparent AI debate partner engineered to sharpen critical thinking and structured reasoning for students. Unlike traditional chatbots that operate as black boxes, DiBot.Ai reveals its internal logical reasoning process in real time using WebSocket streaming, giving debaters live feedback on fallacies, counter-arguments, and persuasion metrics."**

---

## 2. Technology Stack & Architectural Overview

### 🎨 Frontend Layer
- **Core Framework**: React 19 (Built with Vite 7)
- **Routing & State**: React Router DOM v7, React Hooks
- **Real-Time Communication**: `socket.io-client`
- **HTTP Client**: Axios
- **UI & Aesthetics**: Custom Vanilla CSS ("Mercury" Glassmorphism & Metallic Theme), Google Fonts (Inter/Outfit), Markdown rendering with `react-markdown` and `remark-gfm`.

### ⚙️ Backend Layer
- **Runtime**: Node.js v20 LTS
- **Web Framework**: Express.js (ES Modules syntax)
- **Real-Time Engine**: Socket.io Server (`ws` protocol with fallback to HTTP long-polling)
- **Database ORM**: Mongoose v8
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing

### 🧠 AI & LLM Engine Layer
- **Google Generative AI**: `@google/generative-ai` (Gemini API) for reasoning transparency
- **Groq SDK**: `groq-sdk` (`llama-3.3-70b-versatile`) for ultra-low-latency real-time response generation

### ☁️ Cloud Infrastructure & DevOps
- **Cloud Provider**: AWS EC2 (Amazon Linux 2023 `t3.micro` - 2 vCPU, 1 GB RAM)
- **Memory Optimization**: 2 GB Linux Swap Space (`/swapfile`)
- **Process Manager**: PM2 (24/7 background execution, process monitoring, auto-restart)
- **Web Server / Reverse Proxy**: Nginx (Routes Port 80 traffic to internal Express Port 5000)
- **Database Storage**: MongoDB Atlas Cloud Database

---

## 3. DevOps & Deployment Engineering Challenges Solved

During the live deployment on AWS EC2, the following key engineering challenges were encountered and resolved:

| # | Challenge | Root Cause | Engineering Solution |
| :--- | :--- | :--- | :--- |
| 1 | **Out-Of-Memory (OOM) Crashes** | 1 GB RAM instance ran out of memory during `npm install` and Vite production build. | Created and enabled **2 GB Linux Swap Space** (`sudo fallocate -l 2G /swapfile` & `swapon`). |
| 2 | **Node.js Engine Incompatibility** | Amazon Linux 2023 default Node v18 was unsupported by Vite 7 and React Router 7. | Upgraded OS Node.js to **Node 20 LTS** (`v20.20.2`) via NodeSource repositories. |
| 3 | **Infinite `postinstall` Recursion** | Root `package.json` had a `postinstall` script triggering `npm install --prefix server`, creating a circular installation loop. | Installed dependencies using `npm install --ignore-scripts` to isolate root and server packages. |
| 4 | **Nginx Default Server Override** | Nginx on Amazon Linux 2023 used `/etc/nginx/nginx.conf` default server block instead of custom site configs. | Created proxy pass location block in `/etc/nginx/default.d/dibot.conf` using `sudo tee`. |
| 5 | **MongoDB Atlas Access Control** | Cloud database rejected connections from EC2 public IP (`54.234.184.111`). | Whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access and removed rigid `bufferCommands = false` settings. |

---

## 4. Top 10 Technical Interview Questions & Answers

### Q1: Why did you use WebSockets (Socket.io) instead of traditional HTTP REST endpoints for AI Debates?
**Answer**: 
> "HTTP REST operates on a request-response model, which is inefficient for real-time AI debate streaming. With LLMs like Gemini and Llama 3.3 70B, tokens are generated incrementally. Socket.io allows bi-directional event-driven streaming (`socket.emit` / `socket.on`), allowing AI responses and reasoning steps to stream word-by-word to the UI without polling overhead."

### Q2: What is the role of Nginx in front of your Node.js application?
**Answer**:
> "Nginx acts as a High-Performance Reverse Proxy. It listens on standard HTTP Port 80 and securely proxies requests to Express running internally on Port 5000. It also handles WebSocket protocol upgrades (`Upgrade` and `Connection` headers), static asset caching, and abstracts internal ports from external users."

### Q3: Why did you use PM2 instead of running `node server.js` directly with `nohup` or `&`?
**Answer**:
> "PM2 is an enterprise-grade Process Manager. It provides:
> 1. **Zero-downtime auto-restarts** if the process crashes due to unhandled exceptions.
> 2. **System boot survival** (`pm2 startup` & `pm2 save`) to auto-start the server on EC2 reboots.
> 3. **Resource monitoring** (`pm2 monit`) for real-time CPU and memory telemetry."

### Q4: How did you optimize a MERN stack application to run smoothly on an AWS `t3.micro` instance with only 1 GB RAM?
**Answer**:
> "We implemented 3 key optimizations:
> 1. **Offloaded Heavy Compute**: AI inference is delegated entirely to cloud LLM APIs (Gemini/Groq), so the EC2 server only handles light network proxying.
> 2. **Configured Swap Memory**: Added 2 GB Swap space on disk to absorb memory spikes during production builds.
> 3. **Static Build Serving**: Built static production React bundles using Vite (`npm run build`) served directly by Express static middleware."

### Q5: How is Authentication handled in DiBot.Ai?
**Answer**:
> "Authentication is stateless using JSON Web Tokens (JWT). Passwords are encrypted using `bcryptjs` with salt rounds before storing in MongoDB. Upon successful login, a signed JWT is issued to the client and stored in `localStorage`. Protected API routes verify the token using custom Express middleware (`authMiddleware.js`)."

### Q6: What is the difference between `npm install` and `npm ci`?
**Answer**:
> "`npm install` reads `package.json`, resolves version ranges, and can update `package-lock.json`. `npm ci` (Clean Install) strictly installs exact versions from `package-lock.json`, bypasses dependency tree resolution, and deletes existing `node_modules`—making it significantly faster and deterministic for CI/CD and deployment environments."

### Q7: How do you handle environment security for sensitive keys like `GROQ_API_KEY` and `MONGODB_URI`?
**Answer**:
> "Environment variables are managed through `.env` files using `dotenv`. The `.env` file is explicitly listed in `.gitignore` to prevent secret leakage in public repositories. On EC2, production secrets are injected directly into the server environment."

### Q8: What design pattern does your Express backend follow?
**Answer**:
> "Our backend follows a modular MVC / Layered Architecture:
> - **Routes**: Layer defining API endpoints (`authRoutes.js`, `debateRoutes.js`).
> - **Controllers / Handlers**: Request processing logic and Socket.io event handlers (`debateHandler.js`).
> - **Models**: Mongoose schemas defining MongoDB document structure (`User.js`, `Debate.js`).
> - **Services**: Third-party integrations (Gemini AI service & Groq API service)."

### Q9: How would you scale DiBot.Ai to handle 100,000 active debaters?
**Answer**:
> "To scale horizontally:
> 1. **Load Balancing**: Place an AWS Application Load Balancer (ALB) in front of multiple EC2 instances.
> 2. **Socket.io Redis Adapter**: Use Redis Pub/Sub so WebSocket connections across multiple EC2 instances can communicate seamlessly.
> 3. **Database Indexing & Sharding**: Index frequent query fields in MongoDB Atlas and implement horizontal sharding.
> 4. **CDN**: Serve React static assets (`dist/`) via AWS CloudFront."

### Q10: How do you handle errors or timeouts when an AI API fails?
**Answer**:
> "We implement defensive fallback logic:
> 1. Timeout limits on API calls (`serverSelectionTimeoutMS: 5000`).
> 2. Fallback routing between Groq Llama-3.3 and Gemini if one provider hits rate limits or experiences latency spikes.
> 3. Global Express error-handling middleware that catches unhandled promise rejections without crashing the Node.js event loop."
