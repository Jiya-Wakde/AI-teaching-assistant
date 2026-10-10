# AI Coding Mentor — Project Plan

## Top-Level Overview

**Goal:** Build a hackathon-ready, AI-powered web application that helps students and developers understand code, debug errors, and learn programming concepts — prioritising explanation and understanding over blind answer delivery.

**Problem Statement:** AI for Learning & Developer Productivity

**Approach:** A React + Vite frontend separated from a Python Flask backend. The backend owns all AI communication, prompt engineering, and data persistence. The frontend delivers a structured, polished developer workspace. Google Gemini powers all three core features via the official `google-generativeai` Python SDK.

**Scope (MVP):**
- Feature A: Smart Error Explainer
- Feature B: Code Mentor
- Feature C: Guided Fix

**Out of scope for MVP (evaluated below):**
- Code execution
- Repository-aware analysis
- Authenticated user accounts

**Non-goals:** Generic chatbot UX, code auto-complete, IDE plugin.

---

## Product Requirements Document (PRD)

### Target Users

| User Type | Pain Points |
|-----------|-------------|
| CS students | Copy AI answers without understanding; stuck on cryptic error messages |
| Self-taught developers | No mentor to explain WHY code fails or works |
| Junior developers | Lack structured debugging vocabulary and root-cause thinking |

### Proposed Solution

A web workspace where the user submits code + an optional error message, selects a language and skill level, and receives a structured AI response broken into: **Root Cause → Explanation → Guided Fix → Verification Steps**. The interface discourages copy-paste by surfacing reasoning prominently.

### MVP Feature List with Priorities and Acceptance Criteria

| # | Feature | Priority | Acceptance Criteria |
|---|---------|----------|---------------------|
| A | Smart Error Explainer | P0 | Given code + error message + language, response must identify root cause, cite the relevant line(s), suggest a correction, and distinguish confirmed from potential causes |
| B | Code Mentor | P0 | Given code + language + skill level, response explains code by logical blocks with concept definitions appropriate to skill level; follow-up question input is present |
| C | Guided Fix | P0 | Response displays original vs. corrected code side-by-side, highlights changed lines, explains the reasoning, and provides a manual verification step; the word "tested" is never used unless execution was performed |
| D | Landing page | P0 | Clear CTA, feature summary, 3-feature navigation |
| E | Loading / error states | P0 | All API calls show a spinner; network errors and rate-limit errors display actionable messages |
| F | Skill level selector | P1 | Beginner / Intermediate / Advanced affects explanation depth in prompt |
| G | Language selector | P1 | Dropdown covers Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, Other |

### Additional Features — Classification

| Enhancement | Classification | Rationale |
|-------------|---------------|-----------|
| Learning mode (hints before answer) | **MVP** — lightweight prompt switch | Adds pedagogical value with zero extra infrastructure; just a UI toggle and prompt variant |
| Debugging history (save sessions) | **Post-MVP** | Requires auth or persistent local storage; adds scope without improving core demo |
| Code quality / complexity review | **Post-MVP** | Valuable but separate feature; risks diluting focus |
| Repository-aware explanations | **Out of scope** | Requires file upload, AST parsing, or GitHub OAuth; significant security surface |
| Personalized learning profile | **Post-MVP** | Needs user model; useful after core loop is validated |

---

## System Architecture

### Component Responsibilities

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│  React + Vite SPA                                   │
│  - Landing page                                     │
│  - Workspace (code input, language, skill level)    │
│  - Feature tabs: Explain Error / Mentor / Guided Fix│
│  - Structured response renderer                     │
│  - Learning mode toggle                             │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS JSON REST
┌───────────────────▼─────────────────────────────────┐
│                 FLASK BACKEND                       │
│  /api/explain-error                                 │
│  /api/mentor                                        │
│  /api/guided-fix                                    │
│  /api/health                                        │
│                                                     │
│  Services:                                          │
│  - prompt_builder.py  (constructs prompts)          │
│  - ai_client.py       (calls LLM API)               │
│  - response_parser.py (validates + structures resp) │
│  - session_store.py   (SQLite via SQLAlchemy)        │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────┐
│              LLM API PROVIDER                       │
│  Google Gemini API                                  │
│  SDK: google-generativeai (Python)                  │
│  Model: configured via GEMINI_MODEL env var         │
└─────────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│              SQLite DATABASE                        │
│  sessions, requests, responses                      │
└─────────────────────────────────────────────────────┘
```

### LLM Provider Decision

**Confirmed:** Google Gemini is the sole AI provider. No OpenAI or Groq integration will be built.

| Provider | SDK Package | Structured Output | Notes |
|----------|-------------|-------------------|-------|
| Google Gemini | `google-generativeai` | `response_mime_type="application/json"` | Confirmed; API key already available |

**Model selection:** The model is configured via the `GEMINI_MODEL` environment variable so it can be changed without a code deployment. Do not hardcode a model name. At Sub-Task 2, verify which models are available to your API key using `genai.list_models()` and choose a model that supports `generateContent` and JSON output mode. Current stable candidates (subject to change — always verify): `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`. Prefer a Flash-class model for hackathon use (lower latency, generous free-tier quota).

**Free-tier rate limits (verify at https://ai.google.dev/pricing before Sub-Task 2):** Typically 15 RPM and 1M TPM on the free tier for Flash models. Design the demo to stay well within these limits.

**Note:** IBM Bob is a development assistant tool, NOT an LLM API that the application's end users would call. Do not attempt to expose Bob as a backend AI service.

---

## Folder Structure

### Frontend

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Router + layout shell
│   ├── pages/
│   │   ├── Landing.jsx           # Hero, feature cards, CTA
│   │   └── Workspace.jsx         # Main workspace page
│   ├── components/
│   │   ├── CodeInput.jsx         # Monaco-based code editor
│   │   ├── FeatureTabs.jsx       # Explain / Mentor / Fix tabs
│   │   ├── LanguageSelector.jsx
│   │   ├── SkillLevelSelector.jsx
│   │   ├── LearningModeToggle.jsx
│   │   ├── ResponsePanel.jsx     # Renders structured AI response
│   │   ├── DiffViewer.jsx        # Original vs corrected code
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBanner.jsx
│   ├── hooks/
│   │   ├── useAIRequest.js       # Wraps fetch calls, loading/error state
│   │   └── useLocalHistory.js    # Optional: sessionStorage history
│   ├── services/
│   │   └── api.js                # All fetch calls to backend
│   └── styles/
│       ├── global.css
│       └── tokens.css            # Design tokens (colors, spacing)
├── index.html
├── vite.config.js
└── package.json
```

### Backend

```
backend/
├── app/
│   ├── __init__.py               # Flask app factory
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── explain_error.py
│   │   ├── mentor.py
│   │   ├── guided_fix.py
│   │   └── health.py
│   ├── services/
│   │   ├── prompt_builder.py     # Constructs all prompts
│   │   ├── ai_client.py          # LLM API wrapper (provider-agnostic)
│   │   └── response_parser.py    # Parses + validates structured JSON from LLM
│   ├── models/
│   │   ├── __init__.py
│   │   └── session.py            # SQLAlchemy models
│   └── utils/
│       ├── validators.py         # Input validation (size limits, sanitisation)
│       └── errors.py             # Centralised error responses
├── migrations/
├── tests/
│   ├── test_explain_error.py
│   ├── test_mentor.py
│   ├── test_guided_fix.py
│   └── test_validators.py
├── .env.example                  # Template (no secrets)
├── requirements.txt
├── run.py                        # Dev entry point
└── config.py                     # Config class (reads env vars)
```

---

## Database Schema

```sql
-- sessions table
CREATE TABLE sessions (
    id          TEXT PRIMARY KEY,          -- UUID
    created_at  DATETIME NOT NULL,
    skill_level TEXT NOT NULL,             -- beginner | intermediate | advanced
    language    TEXT NOT NULL
);

-- requests table
CREATE TABLE requests (
    id           TEXT PRIMARY KEY,         -- UUID
    session_id   TEXT REFERENCES sessions(id),
    feature      TEXT NOT NULL,            -- explain_error | mentor | guided_fix
    code_input   TEXT NOT NULL,
    error_input  TEXT,                     -- nullable; only for explain_error
    learning_mode INTEGER NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL
);

-- responses table
CREATE TABLE responses (
    id           TEXT PRIMARY KEY,
    request_id   TEXT REFERENCES requests(id),
    raw_json     TEXT NOT NULL,            -- full LLM response stored as-is
    parsed_ok    INTEGER NOT NULL,         -- 1 if response_parser succeeded
    created_at   DATETIME NOT NULL
);
```

**Notes:**
- Session ID is generated client-side (UUID v4) and sent in every request header (`X-Session-ID`). No authentication required.
- Code input is stored as plain text. Do NOT store API keys or user PII.
- SQLite file lives outside the repo (`instance/app.db`), added to `.gitignore`.

---

## API Endpoint Specifications

### POST /api/explain-error

**Request:**
```json
{
  "code": "string (max 8000 chars)",
  "error_message": "string (max 2000 chars)",
  "language": "python | javascript | ...",
  "skill_level": "beginner | intermediate | advanced",
  "learning_mode": false
}
```

**Response:**
```json
{
  "root_cause": {
    "confirmed": "string",
    "potential": ["string"]
  },
  "explanation": "string",
  "relevant_lines": [12, 13],
  "suggested_fix": {
    "code": "string",
    "reasoning": "string"
  },
  "hint": "string | null"
}
```

---

### POST /api/mentor

**Request:**
```json
{
  "code": "string (max 8000 chars)",
  "question": "string (optional, max 500 chars)",
  "language": "string",
  "skill_level": "string",
  "learning_mode": false
}
```

**Response:**
```json
{
  "blocks": [
    {
      "lines": "1-5",
      "explanation": "string",
      "concept": "string | null"
    }
  ],
  "summary": "string",
  "follow_up_prompt": "string"
}
```

---

### POST /api/guided-fix

**Request:**
```json
{
  "code": "string (max 8000 chars)",
  "error_message": "string (optional)",
  "language": "string",
  "skill_level": "string"
}
```

**Response:**
```json
{
  "original_code": "string",
  "fixed_code": "string",
  "changes": [
    {
      "line": 12,
      "original": "string",
      "fixed": "string",
      "reason": "string"
    }
  ],
  "verification_steps": ["string"],
  "explanation": "string"
}
```

---

### GET /api/health

**Response:**
```json
{ "status": "ok", "provider": "openai" }
```

**Error format (all endpoints):**
```json
{
  "error": "string",
  "code": "VALIDATION_ERROR | RATE_LIMIT | AI_UNAVAILABLE | INTERNAL"
}
```

---

## AI Integration Approach

### Prompt Design Principles

1. **Role + Context first:** Every prompt opens with `You are an expert programming tutor...`
2. **Structured JSON output:** Use the Gemini SDK's `generation_config` with `response_mime_type="application/json"` to request JSON output natively. Do not rely solely on a system instruction to force JSON — use the SDK parameter. Validate the returned JSON in `response_parser.py` before sending it to the frontend.
3. **Skill-level injection:** A descriptor is appended per skill level:
   - Beginner: "Explain as if the reader has less than 6 months of programming experience. Avoid jargon."
   - Intermediate: "Assume familiarity with basic syntax and control flow."
   - Advanced: "Be concise. Focus on edge cases and best practices."
4. **Learning mode variant:** When `learning_mode=true`, the prompt instructs the model to provide a hint field and withhold the direct fix until explicitly requested.
5. **Hallucination guardrail:** Include `"If you are not certain of the root cause, say so clearly in the potential array rather than guessing in the confirmed field."` in all explain-error prompts.
6. **Gemini SDK usage pattern:** Use `genai.configure(api_key=...)` at app startup. Instantiate `genai.GenerativeModel(model_name, generation_config, system_instruction)`. Call `model.generate_content(user_prompt)` and read `response.text`.

### Example Prompt Contract (Explain Error)

```
System:
You are an expert programming tutor. The user will provide code and an error message.
Respond ONLY with a valid JSON object matching this schema: { root_cause: {...}, ... }
Skill level: beginner. Explain as if the reader has less than 6 months of programming experience.
If you are not certain, use the potential array rather than the confirmed field.

User:
Language: Python
Code:
---
def add(a, b)
    return a + b
---
Error: SyntaxError: invalid syntax (line 1)
```

### Token Budget

| Feature | Estimated Input Tokens | Estimated Output Tokens |
|---------|----------------------|------------------------|
| Explain Error | ~600 | ~400 |
| Mentor | ~700 | ~600 |
| Guided Fix | ~650 | ~700 |

Gemini Flash models have a generous free tier (verify current limits at https://ai.google.dev/pricing). At typical free-tier quotas a hackathon demo of 200 requests is well within daily limits. If a paid key is used, costs are proportional to token volume — confirm pricing before the demo.

---

## Security, Privacy, and Reliability Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| API key exposed in frontend | Critical | Keys stored only in backend `.env`; never sent to browser |
| API key committed to Git | Critical | `.env` in `.gitignore`; `.env.example` with placeholders checked in |
| Prompt injection via user code | High | Treat code as data inside a delimited block (triple-dash fences); do not interpolate raw input into instruction lines |
| Oversized input causing high token cost | Medium | Hard limit: 8000 chars code, 2000 chars error message; validated server-side before calling LLM |
| Rate limit exhaustion during demo | Medium | Implement exponential backoff; surface `RATE_LIMIT` error to frontend with retry message |
| LLM returns malformed JSON | Medium | `response_parser.py` validates schema; returns `AI_UNAVAILABLE` error if parse fails |
| Submitted code containing malicious content | Low (no execution) | Code is never executed in MVP; stored as text only |
| SQLite data exposure | Low | Instance folder outside web root; `.gitignore` covers it |
| CORS misconfiguration | Low | Flask-CORS configured to allow only the local frontend origin in dev; explicit origin list in production |

---

## Testing Strategy and Hackathon Demo Plan

### Test Case Matrix

| Test Case | Feature | Input | Expected Output Quality Criteria |
|-----------|---------|-------|----------------------------------|
| Python SyntaxError — missing colon | Explain Error | `def foo()\n  pass` + `SyntaxError: invalid syntax` | Root cause cites line 1; confirms colon missing; fix adds colon |
| JavaScript undefined variable | Explain Error | `console.log(x)` + `ReferenceError: x is not defined` | Identifies undeclared variable; explains scope |
| Off-by-one loop error | Explain Error | `for i in range(1, n):` iterating wrong bounds | Distinguishes confirmed vs potential; suggests fix |
| Vague error (no message) | Explain Error | Code only, no error | Graceful response; uses potential array; no hallucinated cause |
| Recursive function explanation | Mentor | Fibonacci with recursion | Block-by-block breakdown; base case explained; skill-adjusted |
| Follow-up question on same code | Mentor | "What does the base case do?" | Responds in context without re-explaining full code |
| Simple typo fix | Guided Fix | `pritn("hello")` | Original vs fixed diff; verification step is "run and observe output" |
| Logic error — wrong operator | Guided Fix | `if x = 5:` | Fix shown; reasoning explains assignment vs comparison |

### Measuring Explanation Quality (No Unsupported Claims)

- **Accuracy:** For each test case, manually verify the suggested fix compiles / runs correctly in the target language.
- **Clarity:** Have one non-technical observer rate each explanation 1–5 on "Did you understand the problem after reading this?"
- **Correctness of root cause:** Check whether the confirmed field matches the actual error. Track false positives.
- **Hallucination rate:** Count responses where the model claims certainty in the confirmed field for ambiguous inputs.
- Report raw numbers only. Do not claim "100% accuracy" unless all cases have been verified.

---

## Phased Implementation Roadmap

### Phase 0 — Project Setup
- Initialise monorepo with `frontend/` and `backend/` directories
- Scaffold Vite + React frontend
- Scaffold Flask backend with app factory
- Configure CORS, environment variables, and `.gitignore`
- Verify frontend-to-backend health check works end-to-end

**Milestone:** `GET /api/health` returns `{"status":"ok"}` and the React app renders on localhost.

### Phase 1 — AI Integration Core
- Implement `ai_client.py` with OpenAI + Groq switching
- Implement `prompt_builder.py` for all three features
- Implement `response_parser.py` with JSON validation
- Test all three prompt flows with raw `curl` or a Python test script

**Milestone:** All three prompt flows return valid structured JSON from the LLM in isolation (no frontend yet).

### Phase 2 — Backend Routes
- Implement and validate `/api/explain-error`, `/api/mentor`, `/api/guided-fix`
- Add input validation (size limits, required fields, enum checks)
- Implement SQLite session persistence
- Add error handling middleware

**Milestone:** All three endpoints return correct structured responses; invalid inputs return correct error codes.

### Phase 3 — Frontend Workspace
- Build `CodeInput.jsx` (Monaco Editor)
- Build `LanguageSelector`, `SkillLevelSelector`, `LearningModeToggle`
- Build `FeatureTabs` and wire to `useAIRequest` hook
- Implement `ResponsePanel` (structured sections)
- Implement `DiffViewer` (original vs fix)
- Implement loading spinner and error banner

**Milestone:** Full round-trip: user enters code + error → submits → sees structured response in the UI.

### Phase 4 — Landing Page and Polish
- Build `Landing.jsx` with hero section, feature cards, CTA
- Apply consistent design tokens (spacing, colour, typography)
- Mobile responsive layouts
- Final copy and label review

**Milestone:** App looks polished and navigable end-to-end on both desktop and mobile.

### Phase 5 — Testing and Demo Preparation
- Run the full test case matrix (8 cases above)
- Fix any prompt failures or parse errors discovered
- Prepare a demo script covering one case per feature
- Verify API key is not exposed; verify `.env.example` is clean

**Milestone:** All 8 test cases produce valid, accurate responses. Demo script rehearsed.

---

## Sub-Tasks

---

### Sub-Task 1: Project Scaffolding and Environment Setup

**Status:** [x] done

**Intent:** Create the monorepo skeleton, install base dependencies, and validate the dev environment is functional before writing any feature code.

**Expected Outcomes:**
- `frontend/` folder exists with Vite + React + React Router scaffolding
- `backend/` folder exists with Flask app factory, CORS, and `/api/health`
- `.env.example` committed; `.env` and `instance/` gitignored
- Frontend dev server proxies `/api` requests to Flask
- Health check confirms end-to-end connectivity

**Todo List:**
1. Create `frontend/` using `npm create vite@latest frontend -- --template react`
2. Install frontend deps: `react-router-dom`, `@monaco-editor/react`, `axios`
3. Create `backend/` with `app/__init__.py` (Flask app factory), `run.py`, `config.py`
4. Install backend deps: `flask`, `flask-cors`, `python-dotenv`, `google-generativeai`, `sqlalchemy`, `pytest`
5. Add Vite proxy config: `/api` → `http://localhost:5000`
6. Implement `GET /api/health` — include `"provider": "gemini"` and `"model": "<GEMINI_MODEL value>"` in the response
7. Create `.env.example` with `GEMINI_API_KEY=your_key_here` and `GEMINI_MODEL=gemini-1.5-flash` placeholders
8. Create `.gitignore` covering `.env`, `instance/`, `__pycache__`, `node_modules`, `dist`
9. Verify: run both servers, hit health endpoint from browser

**Relevant Context:** Blank workspace. No existing files.

---

### Sub-Task 2: AI Client and Prompt Engine

**Status:** [x] done

**Intent:** Build the Gemini-backed AI client and all prompt templates so the LLM integration can be tested in isolation before routes are wired.

**Expected Outcomes:**
- `ai_client.py` configures `google-generativeai`, selects the model from `GEMINI_MODEL`, and exposes a single `complete(system_prompt, user_prompt, max_output_tokens)` method
- `prompt_builder.py` produces correct system and user prompt strings for all three features
- `response_parser.py` validates the three JSON schemas and raises a typed error on failure
- A standalone pytest integration test confirms all three features return parseable JSON from the live Gemini API

**Todo List:**
1. At the start of Sub-Task 2, run `genai.list_models()` in a scratch script and record which models support `generateContent`; choose the best available Flash model and set it as the default value for `GEMINI_MODEL` in `.env.example`
2. Implement `GeminiClient` in `ai_client.py`: call `genai.configure(api_key=...)` at startup, instantiate `GenerativeModel` with `generation_config={"response_mime_type": "application/json"}` and a system instruction, expose `complete(user_prompt, max_output_tokens=1024) -> str`
3. Implement failure handling in `GeminiClient`: catch `google.api_core.exceptions.ResourceExhausted` (rate limit / quota), `google.api_core.exceptions.InvalidArgument` (bad request), `google.api_core.exceptions.Unauthenticated` (bad key), and general network errors — map each to a typed internal exception (`RateLimitError`, `AuthError`, `AIUnavailableError`)
4. Implement `build_explain_error_prompt(code, error, language, skill_level, learning_mode)` → returns `(system_str, user_str)`
5. Implement `build_mentor_prompt(code, question, language, skill_level, learning_mode)` → returns `(system_str, user_str)`
6. Implement `build_guided_fix_prompt(code, error, language, skill_level)` → returns `(system_str, user_str)`
7. Implement `ResponseParser` with `parse_explain_error(raw)`, `parse_mentor(raw)`, `parse_guided_fix(raw)` — validate required keys and types; raise `ParseError` on failure
8. Write pytest unit tests for `ResponseParser` using hardcoded JSON strings (no API calls)
9. Write an integration smoke test that calls the real Gemini API for each feature and asserts parse success

**Relevant Context:** Sub-Task 1 must be complete. Refer to the AI Integration Approach and Prompt Design Principles sections above. The `GEMINI_API_KEY` and `GEMINI_MODEL` env vars must be set in `.env` before running the integration test.

---

### Sub-Task 3: Backend Routes and Validation

**Status:** [ ] pending

**Intent:** Expose the three feature endpoints, add input validation and error handling, and persist requests/responses to SQLite.

**Expected Outcomes:**
- All three POST routes accept valid input and return the correct structured JSON
- Invalid input (missing fields, oversized code, bad enum) returns `400` with an error code
- Rate-limit errors from the LLM provider are caught and returned as `429` with `RATE_LIMIT` code
- Sessions and requests are written to SQLite on every successful call

**Todo List:**
1. Define SQLAlchemy models (`Session`, `Request`, `Response`) in `models/session.py`
2. Create `utils/validators.py` with `validate_explain_error_request`, `validate_mentor_request`, `validate_guided_fix_request`
3. Create `utils/errors.py` with `make_error(code, message, http_status)` helper
4. Implement `routes/explain_error.py` — validate → build prompt → call AI → parse → persist → return
5. Implement `routes/mentor.py`
6. Implement `routes/guided_fix.py`
7. Register all routes in `app/__init__.py`
8. Add global error handler for uncaught exceptions
9. Test all endpoints with `pytest` and `requests` (or Flask test client)

**Relevant Context:** Sub-Task 2 must be complete. Refer to API Endpoint Specifications and Database Schema sections.

---

### Sub-Task 4: Frontend Workspace UI

**Status:** [ ] pending

**Intent:** Build the main workspace page with all input components, the feature tab bar, and the structured response renderer. Wire everything to the backend.

**Expected Outcomes:**
- User can enter code in a Monaco editor, select language, skill level, and feature tab
- Submit button triggers the correct API call with a loading spinner
- Structured AI response renders clearly in labelled sections
- DiffViewer shows original vs fixed code for Guided Fix
- Error banner appears on API failure with an actionable message

**Todo List:**
1. Create `src/services/api.js` with `explainError`, `mentor`, `guidedFix` fetch functions
2. Create `src/hooks/useAIRequest.js` managing `{loading, data, error}` state
3. Build `CodeInput.jsx` wrapping `@monaco-editor/react` with language prop
4. Build `LanguageSelector.jsx` and `SkillLevelSelector.jsx` (controlled dropdowns)
5. Build `LearningModeToggle.jsx` (checkbox or switch)
6. Build `FeatureTabs.jsx` with three tabs
7. Build `ResponsePanel.jsx` — renders each section of the structured response
8. Build `DiffViewer.jsx` — side-by-side original and fixed code blocks
9. Build `LoadingSpinner.jsx` and `ErrorBanner.jsx`
10. Assemble `Workspace.jsx` composing all components; wire to `useAIRequest`
11. Manual end-to-end test: submit each of the 8 test cases from the browser

**Relevant Context:** Sub-Task 3 must be complete. Refer to Folder Structure and API Response schemas.

---

### Sub-Task 5: Landing Page and Visual Polish

**Status:** [ ] pending

**Intent:** Deliver a professional first impression and consistent design across the app.

**Expected Outcomes:**
- Landing page explains the product, lists the three features, and has a CTA linking to the workspace
- Consistent typography, colour tokens, and spacing throughout
- Mobile-responsive layouts for landing page and workspace
- No broken styles or layout regressions on desktop and mobile viewports

**Todo List:**
1. Create `styles/tokens.css` with colour, spacing, and font variables
2. Build `Landing.jsx` — hero section, three feature cards, CTA button
3. Set up React Router with routes `/` (Landing) and `/workspace` (Workspace)
4. Update `App.jsx` with router shell and a minimal nav bar
5. Apply tokens consistently in all component stylesheets
6. Test on 375px (mobile), 768px (tablet), 1280px (desktop) viewports

**Relevant Context:** Sub-Tasks 3 and 4 must be complete.

---

### Sub-Task 6: Testing, Demo Preparation, and Security Audit

**Status:** [ ] pending

**Intent:** Validate the full product against the test matrix, prepare the hackathon demo script, and confirm no secrets are exposed.

**Expected Outcomes:**
- All 8 test cases produce valid, correctly structured AI responses
- No API keys appear in browser network requests or committed files
- `.env.example` contains only placeholders
- Demo script rehearsed: one scenario per feature, covers learning mode toggle
- README documents setup steps for judges

**Todo List:**
1. Run all 8 test cases from the test matrix; document results in a table
2. Fix any prompt failures or parse errors found
3. Run `git grep -i "sk-"` and `git grep -i "api_key"` to confirm no secrets committed
4. Verify browser DevTools network tab shows no API keys in request/response payloads
5. Write `README.md` with: project description, setup steps, env var instructions, demo notes
6. Write demo script covering: one error explanation, one mentor session, one guided fix
7. Rehearse demo end-to-end

**Relevant Context:** All previous sub-tasks must be complete.

---

## Technical Uncertainties and Open Questions

| # | Uncertainty | Decision Needed | Fallback |
|---|-------------|-----------------|---------|
| 1 | **Which Gemini model to use:** `list_models()` must be called at Sub-Task 2 start to confirm available models | Run `genai.list_models()` and pick the best available Flash model; record it in `.env.example` | If no Flash model is available, use the next capable model returned by `list_models()` |
| 2 | **Gemini free-tier RPM during demo:** Free tier is typically 15 RPM; a rapid live demo could hit this | Check current limits at https://ai.google.dev/pricing before Sub-Task 2 | Add exponential backoff + a visible "please wait" UI message |
| 3 | **JSON output reliability:** Does `response_mime_type="application/json"` consistently return parseable JSON for all three prompt types? | Validate in Sub-Task 2 smoke tests across all three features | Add one retry with a stricter "return ONLY JSON, no prose" instruction appended; if still failing, fall back to regex extraction in `response_parser.py` |
| 4 | **Monaco Editor bundle size (~2MB) acceptable?** | Check Lighthouse score after Sub-Task 4 | Replace with CodeMirror 6 (~300KB) |
| 5 | **CORS configuration for deployed demo** | Decide hosting (Vercel + Render vs. local only) | Run both on localhost for hackathon |
| 6 | **SQLite file permissions on deployment host** | Test on target environment | Disable persistence and run stateless if blocked |

---

## First Development Task

After this plan is approved, the **first task to begin** is **Sub-Task 1: Project Scaffolding and Environment Setup**.

Switch to Agent mode and use `start_subtask` to execute Sub-Task 1, instructing the agent to read this plan file for full context.

Before starting Sub-Task 1, confirm:
- [x] Google Gemini API key is available (confirmed)
- [ ] Node.js 18+ and Python 3.10+ are installed on the development machine
- [ ] Git is initialised (or you want the plan to include `git init`)

**Do not start Sub-Task 2 until Sub-Task 1 is verified end-to-end** (health check returns `{"status":"ok","provider":"gemini"}` from the browser).
