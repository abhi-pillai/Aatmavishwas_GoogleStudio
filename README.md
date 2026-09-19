# Aatmavishwas (आत्मविश्वास) — AI Communication & Speech Training Studio

> **Aatmavishwas** (*meaning "Self-Confidence"*) is an intelligent communication training platform engineered to help speakers, job candidates, leaders, and students build poise, overcome speech anxiety, eliminate filler words, and master articulate delivery across speeches, job interviews, group discussions, and presentations.

---

## 🌟 Key Features

### 1. 🎙️ Speech Practice Studio
- **Real-Time Acoustic Visualizer**: Live audio waveform rendered via Web Audio API frequency analysis.
- **Live Performance HUD**: Dynamic tracking of speaking time, live Words Per Minute (WPM), and real-time filler word detection (`um`, `uh`, `like`, `you know`, `basically`).
- **Verbatim AI Audio Transcription**: Uses multimodal Gemini models (`gemini-3.8-flash`) to accurately capture spoken words, hesitation markers, and disfluencies without altering or sanitizing raw speech.
- **Comprehensive Feedback Engine**: Deep analytical scoring on:
  - **Clarity** (diction, articulation, sentence completion)
  - **Confidence** (assertive phrasing, vocal stability)
  - **Pacing** (rhythm consistency against the 130–160 WPM ideal window)
  - **Structure** (hook, body arguments, transitions, call-to-action)
  - **Vocabulary** (identifies repetitive or informal phrases and provides executive-level upgrades)
- **Actionable Micro-Drills**: Tailored vocal exercises (e.g., *One-Breath Delivery*, *Silent Pause Drill*) and an improved executive rewrite of the user's speech.

### 2. 💼 Job Interview Simulator
- Curated question banks across **HR / Behavioral**, **Technical**, **Leadership**, and **Problem Solving** roles.
- **STAR Framework Evaluation**: Automatically breaks down behavioral answers into **Situation**, **Task**, **Action**, and **Result**, rating each component and offering targeted suggestions.
- **AI Audio Question Prompter**: Questions spoken aloud using Gemini Text-to-Speech (`gemini-3.1-flash-tts-preview`) with fallback to browser `SpeechSynthesis`.

### 3. 👥 Group Discussion (GD) Arena
- Multi-agent group discussion simulation with 3 distinct AI participant personas:
  - **The Analyst**: Data-driven, objective, benchmark-oriented.
  - **The Strategist**: High-level synthesizer balancing trade-offs and macro trajectories.
  - **The Challenger**: Contrarian who probes edge cases, stakeholder impact, and unexamined assumptions.
- Practice polite interjections, building on peer points, constructive debate, and discussion moderation.

### 4. 📊 Slide Presentation Rehearsal
- Slide-by-slide rehearsal with timer checkpoints, pace monitoring per slide, and transitions advice.
- Speaker notes scratchpad and pitch deck pacing analysis.

### 5. ⚡ Daily Micro-Challenges & Warmups
- 60-second impromptu speech drills, elevator pitches, and vocal warm-up exercises to build daily speaking habits.
- Instant streak counters and level progression.

### 6. 📈 Progress & Analytics Dashboard
- Comprehensive historical tracking across all practice modes.
- Visual radar charts for skill dimensions, score trends over time, and filler word frequency breakdowns.
- Local storage persistence for privacy and continuous progress tracking.

### 7. 🤖 Master Communication Coach Chatbot
- Context-aware communication coach providing real-time advice on vocal technique, anxiety management (e.g., box breathing, physiological sighs), and structured communication frameworks.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│  React 19 • TypeScript • Tailwind CSS v4 • Vite 6       │
│  Lucide Icons • Recharts • Canvas Confetti • Motion    │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON (Port 3000)
┌────────────────────────────▼────────────────────────────┐
│                   Server / API Layer                    │
│      Node.js Express Backend (Single Ingress Port 3000) │
│      Vite Middleware in Dev • Static Bundle in Prod     │
└────────────────────────────┬────────────────────────────┘
                             │ Server-Side Proxying
┌────────────────────────────▼────────────────────────────┐
│                 Google Gemini AI Engine                 │
│  @google/genai SDK • Resilient Multi-Model Failover     │
│  • gemini-3.8-flash (Transcription & Analysis)          │
│  • gemini-3.1-flash-lite (Demand Spike Fallback)        │
│  • gemini-3.1-flash-tts-preview (Speech Synthesis)      │
└─────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with mobile-first responsive layouts
- **Visualizations**: Recharts (radar charts, historical line graphs)
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, `MediaRecorder`)
- **Icons & Animations**: `lucide-react`, `motion`, `canvas-confetti`

### Backend
- **Server**: Express on Node.js (strictly bound to port 3000)
- **Compilation**: `esbuild` for bundling `server.ts` into a CommonJS production bundle (`dist/server.cjs`)
- **Development**: `tsx` with integrated Vite middleware

### AI & Speech Pipeline
- **SDK**: `@google/genai` (v2.4.0)
- **Models Used**:
  - `gemini-3.8-flash` (primary speech evaluation, verbatim audio transcription)
  - `gemini-3.1-flash-lite` (low-latency fallback during high demand)
  - `gemini-3.1-flash-tts-preview` (high-fidelity neural voice synthesis)
- **Multi-Model Failover**: The server automatically catches transient 503 / 429 high-demand spikes and switches models seamlessly with exponential backoff.

---

## 🎙️ Resilient Audio & MediaRecorder Pipeline

The audio recording engine (`src/utils/audioUtils.ts`) is designed for maximum reliability across devices:

1. **Browser Support Diagnostics**: Proactively checks for secure origin (`https:` or `localhost`), `navigator.mediaDevices.getUserMedia`, `MediaRecorder`, and supported audio MIME codecs (`audio/webm`, `audio/mp4`, `audio/ogg`, `audio/wav`).
2. **Interruption & Hardware Teardown**:
   - Listens to `track.onended` for hardware disconnects (e.g., unplugged headset, Bluetooth drops).
   - Monitors `visibilitychange` (tab backgrounding) and `beforeunload` / `pagehide` to cleanly stop tracks and close `AudioContext`, preventing persistent microphone indicator locks.
3. **Buffer Integrity Validation**: Validates chunk count and byte thresholds before attempting network transmission to prevent empty or corrupted uploads.
4. **Interactive Fallback / Rehearsal Mode**: If microphone access is denied or unavailable, provides interactive acoustic simulation and one-click sample speech loading.

---

## 🔌 API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health check endpoint returning server status and timestamp. |
| `/api/analyze-speech` | `POST` | Evaluates speech transcript across 5 dimensions, calculates WPM, identifies filler words, generates vocabulary upgrades, and formats STAR analysis for interviews. |
| `/api/transcribe` | `POST` | Receives base64 audio data and produces verbatim transcript with hesitation sounds (`um`, `uh`, etc.) via Gemini multimodal audio. |
| `/api/tts` | `POST` | Converts question or speech prompt text to neural audio via `gemini-3.1-flash-tts-preview`. |
| `/api/gd/ai-turn` | `POST` | Generates conversational discussion turns for AI personas (Analyst, Strategist, Challenger) based on discussion history. |
| `/api/coach-chat` | `POST` | Multi-turn communication coach chat utilizing Gemini conversational agent. |
| `/api/sessions` | `GET` | Retrieves recorded session history from server memory. |
| `/api/sessions` | `POST` | Persists a new feedback report to the session store. |

---

## 📁 Project Directory Structure

```
.
├── .env.example              # Environment variables template
├── metadata.json             # App title, description, permissions & capabilities
├── package.json              # Dependencies and npm scripts
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite build configuration with Tailwind v4
├── server.ts                 # Express backend API & Vite middleware entrypoint
├── index.html                # HTML entry point with responsive viewport settings
├── public/                   # Static public assets
└── src/
    ├── main.tsx              # React application root
    ├── App.tsx               # Primary layout, navigation, and state router
    ├── index.css             # Tailwind CSS entrypoint
    ├── types.ts              # TypeScript definitions, interfaces, and enums
    ├── components/
    │   ├── SpeechPractice.tsx          # Speech practice studio & recording HUD
    │   ├── InterviewPractice.tsx       # Job interview simulator with STAR analysis
    │   ├── GroupDiscussionPractice.tsx # Multi-agent AI group discussion arena
    │   ├── PresentationPractice.tsx    # Slide deck rehearsal & pacing tracker
    │   ├── DailyChallenges.tsx         # 60-second impromptu drills & streaks
    │   ├── ProgressDashboard.tsx       # Historical analytics & radar charts
    │   ├── FeedbackModal.tsx           # Detailed session report dialog
    │   ├── CoachChatModal.tsx          # AI communication coach chat drawer
    │   └── AudioWaveform.tsx           # Responsive audio visualizer
    ├── data/
    │   └── mockData.ts       # Curated interview questions, prompts & GD topics
    └── utils/
        ├── audioUtils.ts     # MediaRecorder controller, browser checks & Gemini transcription
        └── progressUtils.ts  # Session scoring calculations & localStorage persistence
```

---

## 📚 Practice Content & Topic Library

The platform includes an extensive collection of structured prompts and randomizer buttons (`Shuffle`) across all practice modes:

- **Group Discussions (GD)**: 16 structured topics across Business Strategy, Tech Ethics, Environmental Policy, and Abstract/Philosophical themes with dynamic multi-agent persona interactions.
- **Speech Practice Studio**: 16 oratory prompts across Leadership & Vision, Persuasive Oratory, Tech & Society, Personal Narrative, and Crisis Communication, with category filtering and instant prompt randomization.
- **Interview Simulator**: 16 STAR-method questions covering General HR Behavioral, Software Engineering & System Design, Product Strategy, Management & Scaling, and Sales Negotiations.
- **Daily Spontaneous Drills**: 10 micro-challenges across Impromptu, Opinion, Storytelling, Pitch, Warmup, and Technical Explanation formats with prep and speech timers.
- **Presentation Decks**: 4 complete multi-slide rehearsal decks (Seed Pitch Deck, Product Architecture Review, Company All-Hands Roadmap, and Crisis Management Briefing).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd aatmavishwas
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 3. Development Mode
Start the development server:
```bash
npm run dev
```
The application will boot on `http://localhost:3000`.

### 4. Production Build & Execution
Build the client and bundle the backend server:
```bash
npm run build
npm start
```

### 5. Type Checking & Validation
Run TypeScript validation:
```bash
npm run lint
```

---

## 🔒 Security & Privacy

- **Server-Side API Proxying**: The Gemini API key is strictly accessed in `server.ts` via `process.env.GEMINI_API_KEY`. It is never exposed or bundled into client-side code.
- **Hardware Privacy**: Microphone streams are accessed only after explicit user consent and are closed immediately upon pause, stop, tab hide, or unmount.
- **Data Retention**: Audio recordings remain client-side; only temporary base64 audio is sent to `/api/transcribe` for processing and is not permanently stored on disk.

---

## 📄 License
This project is private and developed for Google AI Studio Build.
