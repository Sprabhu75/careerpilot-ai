# CareerPilot AI

> **Evidence-Grounded Placement & Resume Assistant for Indian Students & Freshers**

CareerPilot AI analyzes candidate resumes against target job descriptions strictly using verified documentary evidence (verbatim quotes under 20 words) with zero hallucinated skills or metrics. It includes an interactive 5-stage Application Tracker with persistent `localStorage`, a 10-Question Interview Practice Simulator with real-time answer scoring across Correctness, Clarity, and Completeness, and tailored resume bullet rewrites.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Express 4, TypeScript (`tsx`), `@google/genai` (Gemini 2.5/Flash), Zod v4, `express-rate-limit`
- **Document Parsing**: `pdf-parse`, `mammoth` (DOCX)
- **Deployment Target**: Render.com, Cloud Run, or any Node.js 20+ host

---

## Project Structure

```
├── server.ts               # Express backend (API routes, rate-limiting, Gemini proxy)
├── prompts.ts              # System instructions & structured Gemini prompts
├── schemas.ts              # Gemini JSON response schemas (Type definitions)
├── render.yaml             # Render.com blueprint deployment configuration
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build config
├── index.html              # HTML entry point with metadata
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── src/
    ├── main.tsx            # React application entry
    ├── App.tsx             # Root application coordinator
    ├── index.css           # Global Tailwind CSS imports
    ├── components/
    │   ├── Header.tsx                 # Navigation & action bar
    │   ├── RulesBanner.tsx            # Core operational ethics banner
    │   ├── HomeScreen.tsx             # Document upload, paste text & sample profiles
    │   ├── MatchReportScreen.tsx      # Requirements table, PDF download, tracker button
    │   ├── TailoringScreen.tsx        # Resume bullet rewrites & learning priority
    │   ├── InterviewPracticeScreen.tsx# 10 role questions & real-time answer evaluator
    │   └── ApplicationTrackerScreen.tsx# 5-stage application pipeline tracker
    ├── data/
    │   └── sample-profiles.ts         # Realistic Indian fresher demo profiles
    └── utils/
        ├── career-pilot-logic.ts      # Deterministic fallback engine & score formula
        ├── match-score.test.ts        # Unit tests for scoring logic
        ├── career-pilot.test.ts       # Unit tests for parsing, auditing & limits
        └── api-validation.ts          # Zod request validators & file magic-byte checks
```

---

## Local Development Setup

### 1. Prerequisites
- Node.js 20+ or 22+
- npm 10+
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd careerpilot-ai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Open `.env` and set your key:
```env
GEMINI_API_KEY="AIzaSy..."
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests
```bash
npx --yes tsx --test src/utils/*.test.ts
```

---

## Pushing to Your GitHub Repository

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files
git add .

# 3. Commit changes
git commit -m "feat: CareerPilot AI with Express backend and Gemini integration"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 6. Push code to GitHub
git push -u origin main
```

---

## Deploying to Render.com

### Method 1: Using Render Dashboard (Recommended)

1. Log in to [Render.com](https://render.com/).
2. Click **New +** in the top right and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `careerpilot-ai`
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Region**: Choose the closest region (e.g., *Singapore* or *Frankfurt*)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Click **Advanced** and add your **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production static bundle serving |
   | `GEMINI_API_KEY` | `your_gemini_api_key` | From [Google AI Studio](https://aistudio.google.com/apikey) |
6. Click **Create Web Service**.
7. Render will build the Vite frontend into `dist/` and start `server.ts` to serve both the API and client on the assigned URL!

---

### Method 2: Using `render.yaml` Blueprint

1. Push this repository to GitHub (which already includes `render.yaml`).
2. In Render, click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically detect `render.yaml`.
4. Enter your `GEMINI_API_KEY` when prompted and click **Apply**.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Evaluates resume against job description criteria |
| `POST` | `/api/tailor` | Generates bullet point rewrites and skill gaps |
| `POST` | `/api/questions` | Generates 10 interview questions targeting candidate gaps |
| `POST` | `/api/evaluate` | Evaluates interview answer across Correctness, Clarity, Completeness |
| `POST` | `/api/parse-document` | Parses PDF/DOCX resumes (max 2 MB) |
| `GET` | `/api/rate-limit-status`| Returns current rate-limiting status |

---

## License
Apache-2.0

## Web Access
You can access this AI via this link 
https://careerpilot-ai-4-1p6y.onrender.com

