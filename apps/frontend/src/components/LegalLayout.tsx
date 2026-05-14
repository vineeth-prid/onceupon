import { ReactNode } from 'react';

type LegalLayoutProps = {
  title: string;
  intro?: string;
  children: ReactNode;
};

export function LegalLayout({ title, intro, children }: LegalLayoutProps) {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <section
        style={{
          background: '#000',
          padding: '80px 24px 64px',
          textAlign: 'center',
        }}
      >
        <h1
          className="font-display"
          style={{
            color: '#FFF',
            fontSize: '3rem',
            lineHeight: 1.15,
            margin: '0 0 16px',
          }}
        >
          {title}
        </h1>
        {intro ? (
          <p
            className="font-body"
            style={{
              color: '#9A9A9A',
              fontSize: '1.05rem',
              maxWidth: 620,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {intro}
          </p>
        ) : null}
      </section>

      <section
        className="legal-content font-body"
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: '64px 24px 96px',
          color: '#333',
          fontSize: '1rem',
          lineHeight: 1.75,
        }}
      >
        <style>{`
          .legal-content h2 {
            font-family: var(--font-display, inherit);
            font-size: 1.5rem;
            color: #000;
            margin: 40px 0 14px;
            line-height: 1.3;
          }
          .legal-content h2:first-child { margin-top: 0; }
          .legal-content h3 {
            font-size: 1.1rem;
            color: #000;
            margin: 28px 0 10px;
            font-weight: 600;
          }
          .legal-content p { margin: 0 0 16px; }
          .legal-content ol, .legal-content ul {
            margin: 0 0 16px;
            padding-left: 22px;
          }
          .legal-content li { margin: 0 0 10px; }
          .legal-content strong { color: #000; }
          .legal-content a { color: #E86B4A; text-decoration: none; }
          .legal-content a:hover { text-decoration: underline; }
          .legal-content .legal-card {
            border: 1px solid #E5E5E5;
            border-radius: 12px;
            padding: 24px;
            margin-top: 32px;
            background: #FAFAFA;
          }
          .legal-content .legal-card p { margin: 0 0 6px; }
          .legal-content .legal-card p:last-child { margin: 0; }
        `}</style>
        {children}
      </section>
    </div>
  );
}
