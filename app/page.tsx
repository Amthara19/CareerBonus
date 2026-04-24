// app/page.tsx

export default function LandingPage() {
  return (
    <main className="landing-root">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">CareerBonus</span>
        </div>
        <p className="tagline">Where careers get rewarded</p>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Find Your <span className="accent">Next Role.</span>
          <br />
          Reward Your <span className="accent">Best Talent.</span>
        </h1>
        <p className="hero-sub">
          A unified platform for job seekers, clients, and administrators.
          <br />
          Choose your portal to get started.
        </p>
      </section>

      {/* Portal Cards */}
      <section className="portals">

        {/* Jobseeker */}
        <a href="/dashboard/candidate" className="portal-card portal-jobseeker">
          <div className="card-glow" />
          <div className="card-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="14" r="7" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-label">Job Seeker</div>
          <div className="card-desc">Browse open roles, apply, and track your applications</div>
          <div className="card-cta">
            Enter Portal
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </div>
        </a>

        {/* Client */}
        <a href="/login/client" className="portal-card portal-client">
          <div className="card-glow" />
          <div className="card-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M14 10V8a2 2 0 012-2h8a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M5 20h30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="20" cy="20" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="card-label">Client</div>
          <div className="card-desc">Post jobs, review candidates, and manage your hiring pipeline</div>
          <div className="card-cta">
            Enter Portal
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </div>
        </a>

        {/* Admin */}
        <a href="/login/admin" className="portal-card portal-admin">
          <div className="card-glow" />
          <div className="card-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4l2.8 8.6H32l-7.4 5.4 2.8 8.6L20 21.2l-7.4 5.4 2.8-8.6L8 12.6h9.2L20 4z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M10 30h20M13 35h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-label">Admin</div>
          <div className="card-desc">Manage users, jobs, and platform settings from one place</div>
          <div className="card-cta">
            Enter Portal
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </div>
        </a>

      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} CareerBonus · All rights reserved
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .landing-root {
          min-height: 100vh;
          background: linear-gradient(160deg, #eef2ff 0%, #f8faff 50%, #e8f0fe 100%);
          color: #1e3a8a;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding: 0 1.5rem 3rem;
        }

        .bg-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(79,106,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,106,255,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .bg-glow {
          position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
          width: 900px; height: 600px;
          background: radial-gradient(ellipse at center, rgba(99,130,255,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .header {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          padding: 3rem 0 0;
          animation: fadeDown 0.6s ease both;
        }
        .logo {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .logo-icon {
          font-size: 1.8rem; color: #4f6aff; line-height: 1;
        }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem; font-weight: 800;
          color: #1e3a8a; letter-spacing: -0.02em;
        }
        .tagline {
          font-size: 0.8rem; color: #6b7280; margin-top: 0.3rem;
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        .hero {
          position: relative; z-index: 1;
          text-align: center;
          margin: 4rem 0 3rem;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          color: #1e3a8a;
          letter-spacing: -0.03em;
        }
        .accent {
          background: linear-gradient(135deg, #4f6aff, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          margin-top: 1.2rem;
          font-size: 1.05rem;
          color: #6b7280;
          line-height: 1.7;
          font-weight: 300;
        }

        .portals {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
          width: 100%; max-width: 960px;
          animation: fadeUp 0.8s 0.2s ease both;
        }

        .portal-card {
          position: relative;
          display: flex; flex-direction: column;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 20px;
          padding: 2rem 1.8rem 1.8rem;
          text-decoration: none; color: inherit;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(79,106,255,0.06);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .portal-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(79,106,255,0.15);
        }

        .card-glow {
          position: absolute; inset: 0; border-radius: 20px;
          opacity: 0; transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .portal-card:hover .card-glow { opacity: 1; }

        .portal-jobseeker:hover { border-color: rgba(79,106,255,0.3); }
        .portal-jobseeker .card-glow {
          background: radial-gradient(ellipse at top left, rgba(79,106,255,0.08), transparent 60%);
        }
        .portal-jobseeker .card-icon { color: #4f6aff; background: rgba(79,106,255,0.08); }
        .portal-jobseeker .card-cta { color: #4f6aff; }

        .portal-client:hover { border-color: rgba(5,150,105,0.3); }
        .portal-client .card-glow {
          background: radial-gradient(ellipse at top left, rgba(5,150,105,0.08), transparent 60%);
        }
        .portal-client .card-icon { color: #059669; background: rgba(5,150,105,0.08); }
        .portal-client .card-cta { color: #059669; }

        .portal-admin:hover { border-color: rgba(217,119,6,0.3); }
        .portal-admin .card-glow {
          background: radial-gradient(ellipse at top left, rgba(217,119,6,0.08), transparent 60%);
        }
        .portal-admin .card-icon { color: #d97706; background: rgba(217,119,6,0.08); }
        .portal-admin .card-cta { color: #d97706; }

        .card-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.4rem;
        }
        .card-icon svg { width: 28px; height: 28px; }

        .card-label {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem; font-weight: 700;
          color: #1e3a8a; margin-bottom: 0.6rem;
        }
        .card-desc {
          font-size: 0.88rem; color: #6b7280;
          line-height: 1.6; flex: 1;
          margin-bottom: 1.6rem;
        }
        .card-cta {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.88rem; font-weight: 600;
          transition: gap 0.2s ease;
        }
        .portal-card:hover .card-cta { gap: 0.6rem; }

        .footer {
          position: relative; z-index: 1;
          margin-top: 4rem;
          font-size: 0.78rem; color: #9ca3af;
          letter-spacing: 0.05em;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .portals { grid-template-columns: 1fr; }
          .hero-title { font-size: 2rem; }
        }
      `}</style>
    </main>
  )
}
