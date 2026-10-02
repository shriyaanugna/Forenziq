# FORENZIQ – AUTOMATED DIGITAL FORENSICS REPORTER

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Storage-emerald.svg)](https://supabase.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20WebGL-black.svg)](https://threejs.org/)

**FORENZIQ** is a digital forensic investigation and incident response platform. Built from scratch, it combines cryptographic evidence integrity (SHA-256), multi-provider AI vision and text extraction (Groq, Cerebras, Gemini, OpenRouter), deterministic threat severity scoring, pairwise cross-evidence correlation, an interactive 2D/3D investigation graph, immutable chain of custody audit logging, and automated server-side PDF report generation.

---

## TABLE OF CONTENTS

- [1. Executive Summary](#1-executive-summary)
- [2. Interactive Landing Page & 3D WebGL Hero](#2-interactive-landing-page--3d-webgl-hero)
- [3. Core Platform Capabilities](#3-core-platform-capabilities)
- [4. Technology Stack](#4-technology-stack)
- [5. System Architecture](#5-system-architecture)
- [6. Directory Structure](#6-directory-structure)
- [7. Installation & Setup](#7-installation--setup)
- [8. Deployment Configuration (Render & Cloud)](#8-deployment-configuration-render--cloud)
- [9. Application Workflow](#9-application-workflow)
- [10. Security & Privacy Controls](#10-security--privacy-controls)
- [11. Limitations & Future Roadmap](#11-limitations--future-roadmap)
- [12. Contributing & License](#12-contributing--license)

---

## 1. EXECUTIVE SUMMARY

In digital forensics and incident response (DFIR), investigators analyze hundreds of image screenshots, darknet chat logs, system transcripts, and exfiltrated files. Manually correlating entities across disjointed files is time-consuming and error-prone.

**FORENZIQ** provides a streamlined, AI-assisted investigation workspace where investigators can:
1. Create isolated, tracked forensic cases.
2. Upload image evidence (PNG, JPG, WEBP) and text/chat transcripts (TXT, CSV, JSON).
3. Compute cryptographic SHA-256 hashes and maintain immutable chain of custody logs.
4. Extract structured entities (crypto wallet addresses, IP addresses, usernames, phone numbers, URLs, transaction IDs).
5. Apply a deterministic scoring engine to assign reproducible threat severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
6. Perform pairwise cross-evidence correlation to expose hidden overlaps.
7. Visualize entity relationship networks using interactive 2D force graphs and spatial 3D network visualizations.
8. Generate official forensic PDF reports stored in encrypted cloud storage.

---

## 2. INTERACTIVE LANDING PAGE & 3D WEBGL HERO

The platform features an entry landing page at `/` designed with a dark, cinematic cybersecurity aesthetic (`#06090e` obsidian base, `#0d121c` glass cards, deep cyan `#06b6d4` highlights, rose `#f43f5e` threat indicators, and emerald `#10b981` status accents).

### Features of the Landing Page:
- **Cinematic 3D WebGL Canvas (`Lock3DHero.tsx` / `Forensic3DHero.tsx`):** Built with Three.js, featuring an extruded 3D security lock with royal blue shackle, illuminated keyhole, studio lighting with `THREE.PCFShadowMap`, `performance.now()` time tracking, and smooth hovering/rotation animation. Includes WebGL support auto-detection and a static fallback card.
- **Split-Screen Editorial Design:** Hero headline (*"Every digital trace tells a story."*), supporting technical description, product metric counters, and floating live workspace preview card.
- **Workflow Pipeline:** Step-by-step visual workflow (*1. Collect Evidence → 2. Analyze & Investigate → 3. Generate Reports*).
- **Capability Cards:** Detailed feature cards covering Image/Vision Forensics, Chat Intelligence, Multi-AI Fallback, Deterministic Severity, Cross-Evidence Correlation, and Chain of Custody Audit.
- **Interactive Workspace Preview:** Real UI card preview showing active case metrics, critical finding highlights, and cryptographic hash verification.
- **Seamless Navigation:** Smooth scrolling navbar links (`#hero`, `#how-it-works`, `#capabilities`, `#preview`) with active section state tracking and CTA routing directly to `/dashboard`.

---

## 3. CORE PLATFORM CAPABILITIES

| Capability | Technical Description |
| :--- | :--- |
| **Cryptographic Hash Verification** | Computes SHA-256 hashes immediately upon file ingestion to ensure evidence integrity and prevent tampering. |
| **Image & OCR Vision Pipeline** | Runs OCR.space text extraction combined with Gemini Vision / multi-LLM vision models to analyze screenshots and documents. |
| **Chat & Text Intelligence** | Normalizes and extracts structured entities (emails, usernames, phone numbers, IP addresses, URLs, crypto addresses, account numbers) with contextual risk reasoning. |
| **Multi-Provider AI Fallback** | Backend AI provider orchestration fallback sequence: **Groq → Cerebras → Gemini → OpenRouter**. AI secrets are kept exclusively on the server. |
| **Deterministic Severity Engine** | Applies scoring rules (`severityEngine.ts`) based on explicit threat keywords, malware indicators, credential exposures, and financial risks. |
| **Cross-Evidence Correlation** | Pairwise matching engine (`correlationEngine.ts`) computes match confidence scores ($\ge85\%$ strong match, $60-84\%$ ambiguous with AI verification) to discover entity links across evidence items. |
| **2D & 3D Investigation Graph** | Interactive network graphs visualizing connections between Cases, Evidence, Findings, and Entities. |
| **Chain of Custody Audit Log** | Immutable event logger (`auditService.ts`) recording all case creations, evidence uploads, AI analyses, findings, and report downloads. |
| **PDFKit Forensic Report Generator** | Server-side PDF rendering (`reportGenerator.ts`) creating official PDF reports with summary tables, risk breakdowns, evidence timelines, and Unicode symbol support (`₹`, `€`, `$`, `£`, `¥`). |

---

## 4. TECHNOLOGY STACK

| Layer | Component | Technologies |
| :--- | :--- | :--- |
| **Frontend UI** | Client Web Application | React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router DOM |
| **3D & Graphs** | Visualizations | Three.js (WebGL), `react-force-graph-2d` |
| **Backend REST API** | Application Server | Node.js, Express, TypeScript, `tsx`, Multer |
| **Database** | Relational Persistence | Supabase PostgreSQL, Row-Level Security (RLS), SQL Migrations |
| **Storage** | Evidence & Report Buckets | Supabase Storage (`evidence`, `reports`) |
| **AI Processing** | Server-Side Orchestration | Groq, Cerebras, Gemini, OpenRouter, OCR.space, Sightengine |
| **Report Generation**| Document Engine | PDFKit (Node.js binary PDF rendering) |
| **Testing** | Suite & QA | Vitest, React Testing Library, Playwright |

---

## 5. SYSTEM ARCHITECTURE

```
                      INVESTIGATOR
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      Landing Page (/)           Dashboard (/dashboard)
     [3D Three.js Hero]          [Case Workspace & Vaults]
             │                           │
             └─────────────┬─────────────┘
                           ▼
                  Express REST API
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  PostgreSQL DB     Supabase Storage   AI Services
  (Cases, Evidence,  (Original Files,   (Groq, Cerebras,
  Findings, Audit)   PDF Reports)       Gemini, OpenRouter)
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
              Cross-Evidence Correlation
                     & Severity Engine
                           │
                           ▼
                 Forensic PDF Report
```

---

## 6. DIRECTORY STRUCTURE

```
/
├── frontend/                     # React + Vite + TypeScript Frontend
│   ├── public/                   # Static assets (favicon.svg, _redirects)
│   ├── src/
│   │   ├── components/           # Layout, Lock3DHero, InvestigationGraph
│   │   ├── pages/                # LandingPage, Dashboard, Cases, CaseWorkspace, Vaults, Reports, Auth
│   │   ├── services/             # Axios REST API Client (getApiBase)
│   │   ├── types/                # Shared Frontend Types
│   │   └── App.tsx               # React Router Definition
│   └── package.json
│
├── backend/                      # Express + TypeScript REST Backend
│   ├── src/
│   │   ├── routes/               # API Endpoints (cases, evidence, findings, correlations, audit, reports, auth, dashboard)
│   │   ├── services/             # AIService, SeverityEngine, CorrelationEngine, ReportGenerator, AuditService
│   │   ├── utils/                # idGenerator, hashUtils, entityNormalizer, supabaseClient
│   │   ├── middleware/           # errorHandler, uploadMiddleware, auth
│   │   └── index.ts              # Express Server Entrypoint (0.0.0.0:${PORT})
│   └── package.json
│
├── supabase/
│   └── migrations/               # PostgreSQL Schema & RLS Migrations
│       ├── 20250222000000_initial_schema.sql
│       └── 20250222000001_phase2_schema.sql
│
├── render.yaml                   # Infrastructure as Code for Render Deployment
├── README.md
└── .env.example
```

---

## 7. INSTALLATION & SETUP

### Prerequisites
- **Node.js:** `v18.0.0` or higher
- **npm:** `v9.0.0` or higher
- **Supabase Account:** PostgreSQL database & Storage access

### 1. Repository Setup
```bash
git clone https://github.com/your-org/forenziq.git
cd forenziq
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (or separate `.env` files in `backend/` and `frontend/` as defined in `.env.example`):

```env
# Frontend
VITE_SUPABASE_URL=https://your-supabase-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3001

# Backend
PORT=3001
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Providers (Backend Only - Keep Secret)
GROQ_API_KEY=your_groq_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OCR_SPACE_API_KEY=your_ocr_space_api_key
```

### 3. Database Migrations
Apply the SQL migrations located in `supabase/migrations/` using the Supabase CLI or Supabase Query Editor to establish the database schema (`users`, `cases`, `evidence`, `findings`, `correlations`, `audit_logs`, `reports`) and Storage buckets (`evidence`, `reports`).

### 4. Running the Development Server
```bash
# Start both Frontend and Backend concurrently
npm run dev

# Or run separately:
npm run server          # Backend on http://localhost:3001
npm run dev --workspace=frontend # Frontend on http://localhost:3000
```

### 5. Running Tests & Quality Checks
```bash
npm test                # Run Vitest test suite across backend and frontend
npm run typecheck       # Run TypeScript static compiler checks
npm run build           # Build production artifacts for frontend and backend
```

---

## 8. DEPLOYMENT CONFIGURATION (RENDER & CLOUD)

FORENZIQ includes a production-tested `render.yaml` specification for zero-downtime deployment on Render.

### 1. Backend Web Service Settings (`forenziq-backend`)
- **Environment:** Node
- **Root Directory:** `.` (Repository Root)
- **Build Command:** `npm run build --workspace=backend`
- **Start Command:** `npm run start --workspace=backend` (Executes `node dist/index.js`)
- **Host Binding:** `0.0.0.0`
- **Port:** Configured via `PORT` env var (Render assigns dynamically)
- **Health Check Path:** `/api/health`

#### Required Backend Environment Variables:
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
CEREBRAS_API_KEY=your_cerebras_key
OPENROUTER_API_KEY=your_openrouter_key
```

### 2. Frontend Static Site Settings (`forenziq-frontend`)
- **Environment:** Static Site
- **Build Command:** `npm run build --workspace=frontend`
- **Publish Directory:** `./frontend/dist`
- **SPA Route Rewrites:** `/* -> /index.html` (Handled via `render.yaml` and `frontend/public/_redirects`)

#### Required Frontend Environment Variables:
```env
VITE_SUPABASE_URL=https://your-supabase-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://forenziq-backend.onrender.com
```

### 3. Supabase Auth Configuration
To allow new investigators to register and access the platform immediately without waiting for confirmation emails:
1. Navigate to **Supabase Dashboard → Authentication → Providers → Email**.
2. Toggle **Confirm email** to **OFF**.
3. Save changes.

---

## 9. APPLICATION WORKFLOW

1. **Landing Page (`/`):** View platform introduction, interact with the Three.js 3D WebGL hero, explore capabilities, and click **"Launch Dashboard"**.
2. **Dashboard (`/dashboard`):** Review platform-wide metrics (Total Cases, Active Cases, Evidence Items, Critical Findings, Correlations, PDF Reports).
3. **Case Creation (`/cases/new`):** Define a new forensic investigation case with title, description, and lead investigator ID.
4. **Evidence Ingestion (`/cases/:caseId`):** Upload image screenshots or chat transcripts. FORENZIQ validates MIME types, calculates SHA-256 hashes, stores original files in Supabase Storage, and logs custody events.
5. **AI Analysis & Entity Extraction:** Trigger analysis on ingested evidence. The backend AI Service executes multi-provider fallback, OCR scanning, entity normalization, and threat classification.
6. **Severity Scoring & Correlation:** Deterministic severity rules assign severity classifications. The pairwise correlation engine links matching entities (e.g. identical crypto wallets across an image and chat log) and generates relationship links.
7. **Graph Visualization & Chain of Custody:** View entity connections on 2D force-directed graphs or spatial views, and audit all immutable custody events.
8. **Forensic Report Generation:** Click **"Generate PDF Report"** to render a PDFKit report and stream or download the official forensic document.

---

## 10. SECURITY & PRIVACY CONTROLS

- **API Secrets Protection:** AI provider keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, etc.) reside strictly on the Node.js backend and are never exposed to client bundles.
- **Evidence Integrity:** SHA-256 hashes are computed server-side prior to storage to guarantee anti-tampering verification.
- **Database Security:** Supabase PostgreSQL Row-Level Security (RLS) policies enforce isolated user access across database tables.
- **Input & File Validation:** Multer middleware validates file extensions, MIME types, and maximum file size limits (50 MB).
- **Privacy Guidelines:** Facial recognition on real human faces is explicitly disabled in vision analysis prompts to respect privacy standards.

---

## 11. LIMITATIONS & FUTURE ROADMAP

### Current Phase 1 & 2 Capabilities:
- Single & multi-source evidence ingestion (Images & Chats).
- Automated AI fallback & entity extraction.
- Deterministic severity scoring & cross-evidence correlation.
- 2D/3D investigation visualization.
- Chain of custody logging & PDF report generation.

### Phase 3 Roadmap:
- Bulk disk image processing (`.raw`, `.dd`, `.E01` support).
- Automated memory artifact analysis (Volatility integration).
- Multi-investigator real-time collaboration with WebSockets.
- Advanced timeline filtering and geo-IP mapping.

---

## 12. CONTRIBUTING & LICENSE

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Ensure all tests pass (`npm test`) and typecheck passes (`npm run typecheck`).
4. Commit your changes with descriptive messages.
5. Push to the branch and open a Pull Request.

### License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
