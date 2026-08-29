# AI-Powered Scheme Assistance Agent (Single-Service Full Stack)

An end-to-end full-stack web application for evaluating user eligibility across government schemes using a deterministic rule engine paired with an AI-generated explanation layer.

The project is structured as a **SINGLE deployable unit** — one repository and one Render web service serving both the React frontend and the FastAPI backend from the same origin.

---

## 📁 Repository Structure

```
scheme-assistent/
├── backend/
│   ├── main.py                          # FastAPI application, API routes & static SPA file serving
│   ├── rule_engine.py                   # Pure deterministic scheme eligibility rule engine
│   ├── llm_explainer.py                 # LLM explanation layer (Anthropic API with fallback)
│   ├── models.py                        # Pydantic data schemas (UserProfile, SchemeResult)
│   ├── schemes.json                     # Primary verified scheme database
│   ├── scheme.json                      # Synchronized scheme database
│   ├── requirements.txt                 # Backend Python dependencies
│   ├── runtime.txt                      # Python runtime specification (python-3.11.9)
│   ├── test_rule_engine.py              # Rule engine test suite
│   └── test_llm_explainer.py            # LLM explainer test suite (mocked API)
├── frontend/
│   ├── src/
│   │   ├── main.jsx                     # React entry point
│   │   ├── App.jsx                      # Navigation header, footer & layout routing
│   │   ├── api.js                       # Relative-path fetch client for backend endpoints
│   │   ├── pages/
│   │   │   ├── ProfileForm.jsx          # Profile input form (age, income, state, occupation, etc.)
│   │   │   └── Results.jsx              # Eligibility results, stats bar & filters
│   │   ├── components/
│   │   │   └── SchemeCard.jsx           # Card rendering status, AI explanation, docs & apply link
│   │   └── index.css                    # Modern, responsive CSS styling
│   ├── index.html                       # HTML template
│   ├── package.json                     # Frontend dependencies (React, React Router DOM, Vite)
│   └── vite.config.js                   # Vite configuration with local dev API proxy
├── .gitignore                           # Git ignore rules
└── README.md                            # Documentation
```

---

## 💻 Local Development Setup

During local development, you run the frontend dev server (with hot reload) and the backend server in separate terminals on different ports.

### Terminal 1: Backend Server (FastAPI)

```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend API will run on `http://127.0.0.1:8000`.

### Terminal 2: Frontend Dev Server (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will run on `http://localhost:5173`.

> **Note on Local Proxying:**  
> During local development, Vite proxies API requests (`/check-eligibility-with-explanation`, `/schemes`, etc.) from port `5173` to `http://127.0.0.1:8000`. In production, the built React SPA is served directly from FastAPI on the **exact same origin**, so no CORS or domain configuration is required.

---

## 🚀 Render Deployment (Single Web Service)

Deploy the entire full-stack app as a **single Render Web Service**. Do NOT create a separate frontend deployment.

### Render Settings

| Setting | Value |
|---|---|
| **Environment** | Python 3 |
| **Root Directory** | *(Leave BLANK — repo root)* |
| **Build Command** | `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT` |

### Environment Variables

Add the following environment variable in the Render Dashboard:

| Key | Value | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | `your-anthropic-api-key` | Anthropic Claude API key for natural language explanations |

---

## 🔒 Architecture & Core Principles

1. **Rules Decide, AI Explains:**  
   Eligibility logic (`eligible: true/false` and `failed_on`) is strictly determined by `rule_engine.py`. The LLM ONLY explains decisions that have already been made; it never overrides or evaluates rules directly.
2. **Single Service Architecture:**  
   FastAPI mounts the built React static files (`frontend/dist`) and handles client-side SPA routing fallback. One single URL serves both the UI and the API.
