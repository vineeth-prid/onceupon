import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Tab = 'login' | 'register';

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length < 4) return { label: '', color: '#e5e5e5', width: '0%' };
  if (pw.length < 6) return { label: 'Weak', color: '#e74c3c', width: '25%' };
  if (pw.length < 8) return { label: 'Fair', color: '#f39c12', width: '50%' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score >= 2) return { label: 'Strong', color: '#27ae60', width: '100%' };
  return { label: 'Good', color: '#2ecc71', width: '75%' };
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid #e5e5e5',
  borderRadius: 10,
  fontSize: '0.9rem',
  fontFamily: 'Inter, sans-serif',
  color: '#000',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
  backgroundColor: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#6F6F6F',
  display: 'block',
  marginBottom: 6,
};

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/create';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(firstName, lastName, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let initialized = false;
    const renderGoogle = () => {
      if (!initialized && (window as any).google?.accounts?.id && document.getElementById('google-btn')) {
        (window as any).google.accounts.id.initialize({
          client_id: '131535683460-jji94fgcvgoiip28ntpaj6f7o9pnp6ei.apps.googleusercontent.com',
          callback: async (response: any) => {
            setLoading(true);
            try {
              await googleLogin(response.credential);
              navigate(from, { replace: true });
            } catch (err: any) {
               setError(err.response?.data?.message || 'Google authentication failed');
            } finally {
               setLoading(false);
            }
          }
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: '100%', text: tab === 'login' ? 'signin_with' : 'signup_with' }
        );
        initialized = true;
      }
    };
    renderGoogle();
    const interval = Object.keys((window as any).google || {}).length ? 0 : setInterval(() => {
      if ((window as any).google) {
        clearInterval(interval);
        renderGoogle();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [tab, googleLogin, navigate, from]);
  
  const strength = getPasswordStrength(password);

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem', backgroundColor: '#FAFAFA' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="no-underline">
            <span className="font-display text-2xl" style={{ color: '#000' }}>
              Once Upon a Time
            </span>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: 100, padding: 4 }}>
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className="font-body"
              style={{
                flex: 1,
                padding: '0.55rem',
                border: 'none',
                borderRadius: 100,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: tab === t ? 600 : 400,
                backgroundColor: tab === t ? '#000' : 'transparent',
                color: tab === t ? '#fff' : '#6F6F6F',
                transition: 'all 0.2s',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '0.7rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: '#dc2626',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <div id="google-btn" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }}></div>
          <span className="font-body" style={{ padding: '0 0.8rem', color: '#6F6F6F', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }}></div>
        </div>

        {tab === 'login' ? (
          <>
            <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#000', marginBottom: 6 }}>
              Welcome back.
            </h2>
            <p className="font-body" style={{ fontSize: '0.85rem', color: '#6F6F6F', marginBottom: '1.5rem' }}>
              Sign in to continue your book or access your orders.
            </p>
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1rem' }}>
                <div>
                  <label className="font-body" style={labelStyle}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#000')} onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')} />
                </div>
                <div>
                  <label className="font-body" style={labelStyle}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#000')} onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
                <span className="font-body" style={{ fontSize: '0.78rem', color: '#6F6F6F', cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
              <button type="submit" disabled={loading} className="font-body" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.85rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#000', marginBottom: 6 }}>
              Create your account.
            </h2>
            <p className="font-body" style={{ fontSize: '0.85rem', color: '#6F6F6F', marginBottom: '1.5rem' }}>
              Join thousands of families preserving their stories.
            </p>
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="font-body" style={labelStyle}>First name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Sarah" required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#000')} onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')} />
                  </div>
                  <div>
                    <label className="font-body" style={labelStyle}>Last name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Johnson" required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#000')} onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')} />
                  </div>
                </div>
                <div>
                  <label className="font-body" style={labelStyle}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#000')} onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')} />
                </div>
                <div>
                  <label className="font-body" style={labelStyle}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#000')} onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')} />
                  {password.length > 0 && (
                    <>
                      <div style={{ height: 4, borderRadius: 2, backgroundColor: '#f0f0f0', marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, borderRadius: 2, transition: 'width 0.3s, background-color 0.3s' }} />
                      </div>
                      <div className="font-body" style={{ fontSize: '0.7rem', color: strength.color, marginTop: 3 }}>{strength.label}</div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '1.2rem' }}>
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
                <label className="font-body" style={{ fontSize: '0.78rem', color: '#6F6F6F', lineHeight: 1.5 }}>
                  I agree to the <span style={{ color: '#000', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#000', cursor: 'pointer' }}>Privacy Policy</span>
                </label>
              </div>
              <button type="submit" disabled={loading} className="font-body" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.85rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
