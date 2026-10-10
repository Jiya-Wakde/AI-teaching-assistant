# AI Coding Mentor

An AI-powered web application that helps students and developers understand code, debug errors, and learn programming concepts — powered by Google Gemini.

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Node.js | 18 | `node --version` |
| Python | 3.9 | `py --version` |
| pip | 22 | `py -m pip --version` |

---

## Project Structure

```
ai-coding-mentor/
├── frontend/          # React + Vite SPA
├── backend/           # Python Flask API
│   ├── app/           # Flask application package
│   │   ├── routes/    # API blueprints
│   │   ├── services/  # AI client, prompt builder (Sub-Task 2)
│   │   ├── models/    # SQLAlchemy models (Sub-Task 3)
│   │   └── utils/     # Validators, error helpers (Sub-Task 3)
│   ├── tests/         # pytest test suite
│   ├── config.py      # Config classes
│   ├── run.py         # Dev entry point
│   └── requirements.txt
├── .gitignore
└── README.md
```

---

## Setup (Windows — PowerShell)

### 1 — Clone / open the project

```powershell
cd "C:\Users\PRACHITESH\Desktop\Web Development\AI Learning assistant"
```

### 2 — Configure the backend environment

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend\.env` in your editor and fill in:

```
GEMINI_API_KEY=your_actual_key_here
GEMINI_MODEL=gemini-1.5-flash
```

> **Never commit `.env` to Git.** It is in `.gitignore`.

### 3 — Install Python dependencies

```powershell
# From the backend\ directory
py -m pip install -r requirements.txt
```

> If you prefer a virtual environment (recommended for production):
> ```powershell
> py -m venv .venv
> .venv\Scripts\Activate.ps1
> pip install -r requirements.txt
> ```

### 4 — Start the Flask backend

```powershell
# From the backend\ directory
py run.py
```

Expected output:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### 5 — Install and start the frontend

Open a **second PowerShell terminal**:

```powershell
cd "C:\Users\PRACHITESH\Desktop\Web Development\AI Learning assistant\frontend"
npm install
npm run dev
```

Expected output:
```
  VITE v6.x.x  ready in Xms
  ➜  Local:   http://localhost:5173/
```

### 6 — Verify the health check

With both servers running, open a third terminal:

```powershell
Invoke-WebRequest http://localhost:5173/api/health | Select-Object -ExpandProperty Content
```

Expected response:
```json
{"model":"gemini-1.5-flash","provider":"gemini","status":"ok"}
```

Or open `http://localhost:5173/api/health` directly in your browser.

---

## Running Tests

```powershell
cd backend
py -m pytest tests/ -v
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes (Sub-Task 2+) | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Gemini model name |
| `FLASK_ENV` | No | `development` | `development` or `production` |
| `SECRET_KEY` | No (dev) | random string | Flask session secret |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `MAX_CODE_LENGTH` | No | `8000` | Max code input characters |
| `MAX_ERROR_LENGTH` | No | `2000` | Max error message characters |

---

## Implementation Status

| Sub-Task | Status |
|----------|--------|
| 1 — Project scaffolding and setup | ✅ Complete |
| 2 — AI client and prompt engine | ⏳ Pending approval |
| 3 — Backend routes and validation | ⏳ Pending |
| 4 — Frontend workspace UI | ⏳ Pending |
| 5 — Landing page and visual polish | ⏳ Pending |
| 6 — Testing and demo preparation | ⏳ Pending |

---

## Security Notes

- `GEMINI_API_KEY` is stored in `backend/.env` only — never in frontend code, browser responses, logs, or Git.
- Submitted code is never executed.
- All AI calls are made server-side from Flask — the frontend never calls the Gemini API directly.
# AI-teaching-assistant
