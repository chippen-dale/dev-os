export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--gray-25)',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid var(--gray-50)',
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>
          Contract<span style={{ color: 'var(--blue-500)' }}>IQ</span>
        </span>
        <a href="/login" className="btn-ghost">
          Sign In
        </a>
      </header>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '96px 24px',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0,
            textTransform: 'uppercase',
            color: 'var(--blue-500)',
            background: 'var(--blue-50)',
            padding: '6px 12px',
            borderRadius: 999,
            marginBottom: 24,
          }}
        >
          NDA & MSA review, without a lawyer on call
        </span>

        <h1
          style={{
            fontSize: 48,
            lineHeight: '56px',
            fontWeight: 700,
            color: 'var(--gray-900)',
            maxWidth: 720,
            marginBottom: 20,
          }}
        >
          Understand any NDA or MSA in minutes.
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 500,
            color: 'var(--gray-500)',
            maxWidth: 560,
            marginBottom: 40,
          }}
        >
          Upload a contract and ContractIQ extracts the key terms — with the exact
          page, a confidence score, and the source sentence for every one. Then ask
          questions in plain English, answered strictly from your document.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/login?mode=signup" className="btn-primary">
            Get Started Free
          </a>
          <a href="/login" className="btn-ghost">
            Sign In
          </a>
        </div>

        <p style={{ fontSize: 12, lineHeight: '18px', color: 'var(--gray-300)', marginTop: 24 }}>
          Free 14-day trial · No credit card required
        </p>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '24px 48px',
          borderTop: '1px solid var(--gray-50)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 12,
          lineHeight: '18px',
          color: 'var(--gray-300)',
        }}
      >
        <span>This is an AI-assisted review tool, not legal advice.</span>
        <span>Powered by OpenAI GPT-4o</span>
      </footer>
    </main>
  )
}
