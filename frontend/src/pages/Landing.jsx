import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart Error Explainer',
    color: 'var(--accent)',
    desc: 'Paste your code and error message. Get a plain-language root-cause analysis, the exact lines involved, and a suggested fix — with confirmed and potential causes clearly separated.',
  },
  {
    icon: '📖',
    title: 'Code Mentor',
    color: 'var(--violet)',
    desc: 'Submit any code snippet and ask a question. Receive a block-by-block explanation pitched at your skill level, with concept definitions and follow-up prompts to deepen your understanding.',
  },
  {
    icon: '🛠️',
    title: 'Guided Fix',
    color: 'var(--success)',
    desc: 'See your original code alongside the corrected version, with every changed line explained. Includes manual verification steps — no false claims about code execution.',
  },
]

export default function Landing() {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 24px 80px' }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', marginBottom: '72px' }}>
        <div style={{ marginBottom: '16px' }}>
          <span className="badge badge-accent">Hackathon MVP · AI for Developer Productivity</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          letterSpacing: '-1px',
          lineHeight: 1.2,
          color: 'var(--text)',
          marginBottom: '20px',
        }}>
          Stop copying AI answers.<br />
          <span style={{ color: 'var(--accent)' }}>Start understanding your code.</span>
        </h1>
        <p style={{
          fontSize: '17px',
          color: 'var(--text-muted)',
          maxWidth: '580px',
          margin: '0 auto 36px',
          lineHeight: 1.7,
        }}>
          AI Coding Mentor explains errors in plain language, walks through code line by line,
          and shows guided fixes — built for developers who want to learn, not just ship.
        </p>
        <Link to="/workspace" className="btn btn-primary" style={{ fontSize: '15px', padding: '11px 28px' }}>
          Open Workspace →
        </Link>
      </section>

      {/* Feature cards */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '28px',
        }}>Three tools. One goal: understanding.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: f.color, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="card" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>
          How it works
        </h2>
        <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Paste your code into the editor and select your programming language.',
            'Optionally paste the error message you received.',
            'Choose a feature tab: explain the error, get a code walkthrough, or request a guided fix.',
            'Set your skill level so explanations match your experience.',
            'Toggle Learning Mode to get hints first and deepen your understanding before seeing the full answer.',
            'Click Analyze and read the structured response.',
          ].map((step, i) => (
            <li key={i} style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Step {i + 1}: </span>{step}
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center' }}>
        <Link to="/workspace" className="btn btn-violet" style={{ fontSize: '15px', padding: '11px 28px' }}>
          Try it now →
        </Link>
        <p style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-dim)' }}>
          Requires a Gemini API key configured in <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: '4px' }}>backend/.env</code>
        </p>
      </section>

    </main>
  )
}
