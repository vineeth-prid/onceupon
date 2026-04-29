import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';

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

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');
    setMessage('');
    
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setStatus('success');
      setMessage('Password has been successfully reset. You can now sign in.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    }
  };

  const strength = getPasswordStrength(password);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 12,
    fontSize: '0.95rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#1a1a1a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    backgroundColor: '#fafafa',
  };

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
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Choose New Password
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: '#888',
            margin: '8px 0 0',
          }}>
            Create a strong password for your account.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 12,
              fontSize: '0.9rem',
              color: '#065F46',
              marginBottom: 24,
              fontFamily: "'Inter', sans-serif",
            }}>
              {message}
            </div>
            <button 
              onClick={() => navigate('/login')}
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
                cursor: 'pointer',
              }}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
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
                {message}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  style={{ ...inputStyle, paddingRight: 48 }}
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!token}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: token ? 'pointer' : 'default',
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

            <button
              type="submit"
              disabled={status === 'loading' || !token}
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
                cursor: status === 'loading' || !token ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' || !token ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/login" style={{
                fontSize: '0.85rem',
                color: '#888',
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}>
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
