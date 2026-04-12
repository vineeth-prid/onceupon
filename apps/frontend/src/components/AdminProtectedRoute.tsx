import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        color: '#888',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
      }}>
        Loading...
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (isAuthenticated && user?.role !== 'ADMIN') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '1.5rem',
          }}>
            !
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 8px' }}>
            Access Denied
          </h2>
          <p style={{ color: '#666', fontSize: '0.88rem', margin: '0 0 28px', lineHeight: 1.6 }}>
            This area is restricted to administrators only. You are signed in as <strong style={{ color: '#999' }}>{user?.email}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a
              href="/"
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: '#999',
                border: '1px solid #333',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 500,
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Go Home
            </a>
            <button
              onClick={() => { logout(); setError(''); }}
              style={{
                padding: '10px 24px',
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Sign in as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and admin, show admin content
  if (isAuthenticated && user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Not authenticated — show admin login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      // After login, the component re-renders. If role !== ADMIN, the access denied screen shows.
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const getInputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    border: `1.5px solid ${focusedField === field ? '#555' : '#2a2a2a'}`,
    borderRadius: 10,
    fontSize: '0.92rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#e0e0e0',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    backgroundColor: focusedField === field ? '#1a1a1a' : '#141414',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Card */}
        <div style={{
          background: '#111',
          borderRadius: 20,
          padding: '40px 32px',
          border: '1px solid #1e1e1e',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '1.2rem',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#e0e0e0',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}>
              Admin Portal
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.82rem',
              color: '#555',
              margin: 0,
            }}>
              Sign in with your administrator credentials
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '11px 14px',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: 10,
              fontSize: '0.82rem',
              color: '#f87171',
              marginBottom: 20,
              fontFamily: "'Inter', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#666',
                  marginBottom: 8,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@onceuponatime.com"
                  required
                  autoFocus
                  autoComplete="email"
                  style={getInputStyle('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#666',
                  marginBottom: 8,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={{ ...getInputStyle('password'), paddingRight: 52 }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#555',
                      fontSize: '0.78rem',
                      fontFamily: "'Inter', sans-serif",
                      padding: 0,
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: 12,
                fontSize: '0.88rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'opacity 0.2s ease',
                marginTop: 24,
                letterSpacing: '0.01em',
              }}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: '0.75rem',
          color: '#444',
          fontFamily: "'Inter', sans-serif",
        }}>
          <a href="/" style={{ color: '#555', textDecoration: 'none' }}>
            Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
