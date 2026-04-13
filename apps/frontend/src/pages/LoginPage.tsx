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

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
          { theme: 'outline', size: 'large', width: 360, text: tab === 'login' ? 'signin_with' : 'signup_with', shape: 'pill' }
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

  const getInputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '14px 16px',
    border: `1.5px solid ${focusedField === field ? '#E86B4A' : '#e0e0e0'}`,
    borderRadius: 12,
    fontSize: '0.95rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#1a1a1a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    backgroundColor: focusedField === field ? '#fff' : '#fafafa',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(232, 107, 74, 0.1)' : 'none',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#444',
    display: 'block',
    marginBottom: 8,
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF5F2 0%, #FFF 40%, #F8F6FF 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        position: 'relative',
      }}>
        {/* Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#1a1a1a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}>
                Once Upon a Time
              </h1>
            </Link>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              color: '#888',
              margin: '8px 0 0',
            }}>
              {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 28,
            backgroundColor: '#f5f5f5',
            borderRadius: 14,
            padding: 4,
          }}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  borderRadius: 11,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: tab === t ? 600 : 500,
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#1a1a1a' : '#888',
                  transition: 'all 0.25s ease',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  letterSpacing: '0.02em',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              fontSize: '0.84rem',
              color: '#DC2626',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Inter', sans-serif",
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>!</span>
              {error}
            </div>
          )}

          {/* Google Button */}
          <div id="google-btn" style={{
            marginBottom: 0,
            display: 'flex',
            justifyContent: 'center',
          }} />

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #e0e0e0)' }} />
            <span style={{
              padding: '0 16px',
              color: '#aaa',
              fontSize: '0.78rem',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #e0e0e0)' }} />
          </div>

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={getInputStyle('login-email')}
                    onFocus={() => setFocusedField('login-email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>Password</label>
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#E86B4A',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      marginBottom: 8,
                    }}>
                      Forgot password?
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{ ...getInputStyle('login-pw'), paddingRight: 48 }}
                      onFocus={() => setFocusedField('login-pw')}
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
                        color: '#999',
                        fontSize: '0.8rem',
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
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#E86B4A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  marginTop: 24,
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p style={{
                textAlign: 'center',
                marginTop: 20,
                fontSize: '0.84rem',
                color: '#888',
                fontFamily: "'Inter', sans-serif",
              }}>
                Don't have an account?{' '}
                <span
                  onClick={() => { setTab('register'); setError(''); }}
                  style={{ color: '#E86B4A', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign up
                </span>
              </p>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Sarah"
                      required
                      style={getInputStyle('reg-fn')}
                      onFocus={() => setFocusedField('reg-fn')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Johnson"
                      required
                      style={getInputStyle('reg-ln')}
                      onFocus={() => setFocusedField('reg-ln')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={getInputStyle('reg-email')}
                    onFocus={() => setFocusedField('reg-email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      style={{ ...getInputStyle('reg-pw'), paddingRight: 48 }}
                      onFocus={() => setFocusedField('reg-pw')}
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
                        color: '#999',
                        fontSize: '0.8rem',
                        fontFamily: "'Inter', sans-serif",
                        padding: 0,
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{
                        height: 4,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: strength.width,
                          backgroundColor: strength.color,
                          borderRadius: 4,
                          transition: 'width 0.3s ease, background-color 0.3s ease',
                        }} />
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        color: strength.color,
                        marginTop: 4,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                      }}>
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms checkbox */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginTop: 20,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{
                    marginTop: 2,
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    accentColor: '#E86B4A',
                    cursor: 'pointer',
                  }}
                />
                <span style={{
                  fontSize: '0.82rem',
                  color: '#666',
                  lineHeight: 1.5,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  I agree to the{' '}
                  <span style={{ color: '#E86B4A', fontWeight: 500, cursor: 'pointer' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: '#E86B4A', fontWeight: 500, cursor: 'pointer' }}>Privacy Policy</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#E86B4A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  marginTop: 20,
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <p style={{
                textAlign: 'center',
                marginTop: 20,
                fontSize: '0.84rem',
                color: '#888',
                fontFamily: "'Inter', sans-serif",
              }}>
                Already have an account?{' '}
                <span
                  onClick={() => { setTab('login'); setError(''); }}
                  style={{ color: '#E86B4A', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign in
                </span>
              </p>
            </form>
          )}
        </div>

        {/* Footer text outside card */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: '0.78rem',
          color: '#aaa',
          fontFamily: "'Inter', sans-serif",
        }}>
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
