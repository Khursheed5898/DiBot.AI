# DiBot.AI 🌟

DiBot.AI is a transparent AI debate partner designed to sharpen your critical thinking skills through intelligent debate practice. Unlike other AI tools, DiBot.AI is built specifically for education, letting you see exactly how the AI analyzes your arguments so you can learn to construct and deconstruct logic more effectively.

## Features ✨

- **Transparent AI Reasoning**: See exactly how the AI analyzes your arguments and formulates responses in real time.
- **Critical Thinking Training**: Engage in structured debate practice and learn to structure logical arguments.
- **Adaptive Difficulty**: Choose from Beginner, Intermediate, Advanced, to Expert levels. The AI dynamically adapts its tone, logic tightness, and aggressive cross-examination.
- **Live Debate Metrics**: Get real-time feedback on your pacing, filler words, clarity, and overall argument strength.
- **Fallacy Detection**: Spot logical fallacies in your arguments and in the AI's response so you can recognize and avoid common reasoning errors.

## Tech Stack 🛠️

- **Frontend**: React 19, Vite, React Router DOM
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Generative AI (Gemini)

## Getting Started 🚀

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on standard port `27017` (or provide your URI).
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository
```bash
git clone <repository_url>
cd DiBot.Ai
```

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy `.env.example` if available) and add the following details:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dibotai
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
Run the following convenient script from the root of the project to install both client and server dependencies:

```bash
npm run install-all
```

*(Alternatively, you can just run `npm install` in the root folder, and `npm install` in the `server/` folder).*

### 4. Run the Application
Start both the Frontend (Vite) and Backend (Express) servers simultaneously using our custom runner script:

```bash
npm run dev
```

The application client should now be running at [http://localhost:5173](http://localhost:5173) and the API server at `http://localhost:5000`.

## Directory Structure 📁

- `/src`: Frontend React components, pages, styles, and assets.
- `/server`: Backend Node.js/Express app (`server.js`) and API endpoints logic.
- `/scripts`: Custom JS scripts (like `dev-runner.cjs`) to aid the local development process.
- `/dist`: Build output folder for the frontend (generated after running `npm run build`).

## License 📜
&copy; 2026 DiBot.AI : All rights reserved | Powered by ✨ DiBot.AI
