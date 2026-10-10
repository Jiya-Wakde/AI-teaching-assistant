import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { explainError, mentorCode, guidedFix } from '../services/api'
import { useAIRequest } from '../hooks/useAIRequest'

// ── Constants ───────────────────────────────────────────
const TABS = [
  { id: 'explain', label: '🔍 Error Explainer' },
  { id: 'mentor',  label: '📖 Code Mentor' },
  { id: 'fix',     label: '🛠️ Guided Fix' },
]

const LANGUAGES = [
  'python','javascript','typescript','java','c++','c',
  'go','rust','sql','html','css','bash','other',
]

const SKILL_LEVELS = ['beginner','intermediate','advanced']

const DEMO_CODE = `def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    average = total / len(numbers)
    return average

scores = [85, 92, 78, 95, 88]
print("Average:", calculate_average(scores))
print("Empty average:", calculate_average([]))`

const DEMO_ERROR = `ZeroDivisionError: division by zero`

// ── Sub-components ──────────────────────────────────────

function ErrorBanner({ error }) {
  const hints = {
    RATE_LIMIT: 'The AI provider rate limit was reached. Please wait a moment and try again.',
    AUTH_ERROR:  'The Gemini API key is missing or invalid. Add GEMINI_API_KEY to backend/.env.',
    PARSE_ERROR: 'The AI returned an unexpected response format. Please try again.',
  }
  return (
    <div className="error-banner">
      <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700, marginBottom: '4px' }}>
          {error.code === 'AUTH_ERROR' ? 'API Key Not Configured' : 'Request Failed'}
        </div>
        <div>{hints[error.code] || error.message}</div>
      </div>
    </div>
  )
}

function Section({ icon, title, color, children }) {
  return (
    <div className="response-section">
      <div className="response-section-title">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span style={{ color: color || 'var(--text-muted)' }}>{title}</span>
      </div>
      <div className="response-section-body">{children}</div>
    </div>
  )
}

function CodeBlock({ code, label, labelColor }) {
  return (
    <div>
      {label && (
        <div className="diff-label" style={{ color: labelColor || 'var(--text-muted)' }}>
          {label}
        </div>
      )}
      <pre className="code-block">{code}</pre>
    </div>
  )
}

function VerificationSteps({ steps }) {
  if (!steps?.length) return null
  return (
    <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {steps.map((s, i) => (
        <li key={i} style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{s}</li>
      ))}
    </ol>
  )
}

// ── Response renderers ──────────────────────────────────

function ExplainErrorResponse({ data }) {
  const rc = data.root_cause
  return (
    <div>
      {data.hint && (
        <div style={{
          background: '#2d2006', border: '1px solid var(--warning)',
          borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: '16px',
          fontSize: '14px', color: '#e3b341',
        }}>
          💡 <strong>Hint:</strong> {data.hint}
        </div>
      )}

      <Section icon="🎯" title="Root Cause" color="var(--danger)">
        {rc.confirmed && (
          <p style={{ marginBottom: rc.potential?.length ? '8px' : 0 }}>
            <span className="badge badge-danger" style={{ marginRight: '8px', verticalAlign: 'middle' }}>Confirmed</span>
            {rc.confirmed}
          </p>
        )}
        {rc.potential?.map((p, i) => (
          <p key={i} style={{ marginTop: '6px' }}>
            <span className="badge badge-warning" style={{ marginRight: '8px', verticalAlign: 'middle' }}>Possible</span>
            {p}
          </p>
        ))}
      </Section>

      {data.relevant_lines?.length > 0 && (
        <Section icon="📍" title="Relevant Lines">
          <span className="text-mono text-muted">Lines: {data.relevant_lines.join(', ')}</span>
        </Section>
      )}

      <div className="divider" />

      <Section icon="💬" title="Explanation">
        <p style={{ whiteSpace: 'pre-wrap' }}>{data.explanation}</p>
      </Section>

      <div className="divider" />

      <Section icon="✅" title="Suggested Fix" color="var(--success)">
        <CodeBlock code={data.suggested_fix.code} />
        <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
          {data.suggested_fix.reasoning}
        </p>
      </Section>

      {data.verification_steps?.length > 0 && (
        <>
          <div className="divider" />
          <Section icon="🧪" title="Verification Steps">
            <VerificationSteps steps={data.verification_steps} />
          </Section>
        </>
      )}
    </div>
  )
}

function MentorResponse({ data }) {
  return (
    <div>
      <Section icon="📋" title="Summary" color="var(--accent)">
        <p style={{ whiteSpace: 'pre-wrap' }}>{data.summary}</p>
      </Section>

      <div className="divider" />

      <Section icon="🧩" title="Block-by-Block Explanation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.blocks?.map((block, i) => (
            <div key={i} style={{
              borderLeft: '3px solid var(--accent)',
              paddingLeft: '14px',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                Lines {block.lines}
              </div>
              <p style={{ fontSize: '14px', marginBottom: block.concept ? '6px' : 0 }}>
                {block.explanation}
              </p>
              {block.concept && (
                <span className="badge badge-violet" style={{ marginTop: '4px' }}>
                  Concept: {block.concept}
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {data.follow_up_prompt && (
        <>
          <div className="divider" />
          <Section icon="🤔" title="Think About This" color="var(--violet)">
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              {data.follow_up_prompt}
            </p>
          </Section>
        </>
      )}
    </div>
  )
}

function GuidedFixResponse({ data }) {
  return (
    <div>
      <div className="diff-grid" style={{ marginBottom: '20px' }}>
        <CodeBlock code={data.original_code} label="Original" labelColor="var(--danger)" />
        <CodeBlock code={data.fixed_code} label="Fixed" labelColor="var(--success)" />
      </div>

      {data.changes?.length > 0 && (
        <>
          <div className="divider" />
          <Section icon="📝" title="Changes Explained">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.changes.map((c, i) => (
                <div key={i} style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--danger)' }}>− Line {c.line}: {c.original}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--success)' }}>+ Line {c.line}: {c.fixed}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.reason}</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      <div className="divider" />
      <Section icon="💬" title="Explanation">
        <p style={{ whiteSpace: 'pre-wrap' }}>{data.explanation}</p>
      </Section>

      {data.verification_steps?.length > 0 && (
        <>
          <div className="divider" />
          <Section icon="🧪" title="Verification Steps">
            <VerificationSteps steps={data.verification_steps} />
          </Section>
        </>
      )}
    </div>
  )
}

// ── Main Workspace ──────────────────────────────────────

export default function Workspace() {
  const [tab, setTab]               = useState('explain')
  const [code, setCode]             = useState(DEMO_CODE)
  const [errorMsg, setErrorMsg]     = useState(DEMO_ERROR)
  const [question, setQuestion]     = useState('')
  const [language, setLanguage]     = useState('python')
  const [skillLevel, setSkillLevel] = useState('intermediate')
  const [learningMode, setLearning] = useState(false)

  const explainReq = useAIRequest(explainError)
  const mentorReq  = useAIRequest(mentorCode)
  const fixReq     = useAIRequest(guidedFix)

  const activeReq = tab === 'explain' ? explainReq : tab === 'mentor' ? mentorReq : fixReq

  const handleSubmit = useCallback(() => {
    const base = { code, language, skill_level: skillLevel, learning_mode: learningMode }
    if (tab === 'explain') explainReq.execute({ ...base, error_message: errorMsg })
    else if (tab === 'mentor') mentorReq.execute({ ...base, question })
    else fixReq.execute({ ...base, error_message: errorMsg })
  }, [tab, code, errorMsg, question, language, skillLevel, learningMode, explainReq, mentorReq, fixReq])

  const loadDemo = () => {
    setCode(DEMO_CODE)
    setErrorMsg(DEMO_ERROR)
    setLanguage('python')
    setTab('explain')
    explainReq.reset(); mentorReq.reset(); fixReq.reset()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>

      {/* ── Top toolbar ── */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Language */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ margin: 0, whiteSpace: 'nowrap' }}>Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Skill level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ margin: 0, whiteSpace: 'nowrap' }}>Skill</label>
          <select
            value={skillLevel}
            onChange={e => setSkillLevel(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            {SKILL_LEVELS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Learning mode */}
        <label className="toggle-wrap" title="Get hints before the full answer">
          <input type="checkbox" checked={learningMode} onChange={e => setLearning(e.target.checked)} />
          <div className="toggle-track" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {learningMode ? '💡 Hint mode on' : 'Learning mode'}
          </span>
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={loadDemo} style={{ fontSize: '13px', padding: '6px 12px' }}>
            Load demo
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={activeReq.loading || !code.trim()}
            style={{ minWidth: '120px' }}
          >
            {activeReq.loading
              ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Analyzing…</>
              : '⚡ Analyze'
            }
          </button>
        </div>
      </div>

      {/* ── Main split layout ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>

        {/* LEFT — inputs */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Code editor */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase',
              color: 'var(--text-dim)', padding: '8px 14px 6px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              Code Editor
            </div>
            <Editor
              height="100%"
              language={language === 'c++' ? 'cpp' : language === 'other' ? 'plaintext' : language}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                padding: { top: 12 },
                renderLineHighlight: 'none',
              }}
            />
          </div>

          {/* Error input + question */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', background: 'var(--surface)', flexShrink: 0 }}>
            {tab === 'mentor' ? (
              <div>
                <label>Follow-up question <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="e.g. What does the base case do? Why is recursion used here?"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                />
              </div>
            ) : (
              <div>
                <label>Error message <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Paste the full error message or traceback here…"
                  value={errorMsg}
                  onChange={e => setErrorMsg(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — results */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Feature tabs */}
          <div style={{ background: 'var(--surface)', flexShrink: 0 }}>
            <div className="tabs" style={{ padding: '0 14px' }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {activeReq.loading && (
              <div className="loading-row">
                <div className="spinner" />
                Analyzing with Gemini AI…
              </div>
            )}

            {!activeReq.loading && activeReq.error && (
              <ErrorBanner error={activeReq.error} />
            )}

            {!activeReq.loading && !activeReq.error && !activeReq.data && (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                  Results will appear here
                </div>
                <div style={{ fontSize: '13px', maxWidth: '280px' }}>
                  Paste your code, choose a feature tab, and click <strong>⚡ Analyze</strong>.
                </div>
                <button className="btn btn-ghost" onClick={loadDemo} style={{ marginTop: '8px', fontSize: '13px', padding: '6px 14px' }}>
                  Load demo example
                </button>
              </div>
            )}

            {!activeReq.loading && !activeReq.error && activeReq.data && (
              <div>
                {tab === 'explain' && <ExplainErrorResponse data={activeReq.data} />}
                {tab === 'mentor'  && <MentorResponse       data={activeReq.data} />}
                {tab === 'fix'     && <GuidedFixResponse    data={activeReq.data} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile warning ── */}
      <style>{`
        @media (max-width: 768px) {
          .workspace-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
