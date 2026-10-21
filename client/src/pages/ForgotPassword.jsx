import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STEP 1: Request 6-Digit OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach backend server. Ensure Express is running on port 5000.');
      } else {
        setError(err.response.data?.message || 'Failed to send reset code.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Proceed to Password Input
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setMessage('Code format accepted. Enter your new password below.');
    setStep(3);
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be between 6 and 12 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword
      });
      setMessage(res.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach backend server.');
      } else {
        setError(err.response.data?.message || 'Invalid or expired code.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .eco-post-container {
          background-color: #f8f9fa;
          min-height: calc(100vh - 70px);
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .eco-post-card {
          background: #ffffff;
          padding: 34px 38px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 480px;
          width: 100%;
        }

        .eco-post-title {
          margin: 0 0 6px 0;
          color: #1b4332;
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .eco-post-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          margin-bottom: 24px;
          font-weight: 400;
          text-align: center;
          line-height: 1.4;
        }

        .eco-error-banner {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          font-weight: 700;
          border: 1px solid #fca5a5;
          text-align: center;
        }

        .eco-success-banner {
          background: #e8f5e9;
          color: #1b4332;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          font-weight: 700;
          border: 1px solid #a3b899;
          text-align: center;
        }

        .eco-field-box {
          position: relative;
          background: #f9fafb;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          padding: 12px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-bottom: 16px;
        }

        .eco-field-box:hover {
          border-color: #2d6a4f;
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.12);
        }

        .eco-field-box.has-value {
          border-color: #1b4332;
          background: #eaf4ef;
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.15);
        }

        .eco-field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1b4332;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .eco-required {
          color: #d32f2f;
          font-weight: 800;
        }

        .eco-input-field {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 0.98rem;
          color: #1f2937;
          outline: none;
          font-weight: 600;
          padding: 0;
          margin: 0;
          font-family: inherit;
        }

        .eco-input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .eco-submit-btn {
          width: 100%;
          background-color: #2d6a4f;
          color: #ffffff;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(45, 106, 79, 0.2);
          margin-top: 6px;
        }

        .eco-submit-btn:hover {
          background-color: #1b4332;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.3);
        }

        .eco-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .eco-secondary-btn {
          width: 100%;
          background-color: transparent;
          color: #2d6a4f;
          border: 1.5px solid #2d6a4f;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s ease;
        }

        .eco-secondary-btn:hover {
          background-color: #f1f8f5;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="eco-post-container">
        <div className="eco-post-card">
          <h2 className="eco-post-title">Reset Password</h2>

          {error && <div className="eco-error-banner">{error}</div>}
          {message && <div className="eco-success-banner">{message}</div>}

          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <p className="eco-post-subtitle">
                Enter your registered email address to receive a 6-digit verification code.
              </p>
              
              <div className={`eco-field-box ${email ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>✉️</span> Email Address <span className="eco-required">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="eco-input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="eco-submit-btn">
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <p className="eco-post-subtitle">
                Enter the 6-digit verification code sent to <strong style={{ color: '#1b4332' }}>{email}</strong>.
              </p>

              <div className={`eco-field-box ${otp ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>🔐</span> Verification Code <span className="eco-required">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="eco-input-field"
                  style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}
                  placeholder="------"
                  autoFocus
                />
              </div>

              <button type="submit" className="eco-submit-btn">
                Verify Code
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setMessage('');
                }}
                className="eco-secondary-btn"
              >
                Back to Email
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <p className="eco-post-subtitle">Create a new password for your account.</p>
              
              {/* New Password */}
              <div className={`eco-field-box ${newPassword ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>🔑</span> New Password (6-12 chars) <span className="eco-required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={12}
                    className="eco-input-field"
                    style={{ paddingRight: '80px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '0',
                      backgroundColor: '#e8f5e9',
                      color: '#2d6a4f',
                      border: '1.5px solid #a3b899',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      padding: '7px 14px',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d8f3dc';
                      e.currentTarget.style.borderColor = '#2d6a4f';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8f5e9';
                      e.currentTarget.style.borderColor = '#a3b899';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className={`eco-field-box ${confirmPassword ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>🔑</span> Confirm New Password <span className="eco-required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={12}
                    className="eco-input-field"
                    style={{ paddingRight: '80px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0',
                      backgroundColor: '#e8f5e9',
                      color: '#2d6a4f',
                      border: '1.5px solid #a3b899',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      padding: '7px 14px',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d8f3dc';
                      e.currentTarget.style.borderColor = '#2d6a4f';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8f5e9';
                      e.currentTarget.style.borderColor = '#a3b899';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="eco-submit-btn">
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
            Remembered your password?{' '}
            <Link 
              to="/login" 
              style={{
                color: '#2d6a4f',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#1b4332';
                e.target.style.textDecoration = 'underline';
                e.target.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#2d6a4f';
                e.target.style.textDecoration = 'none';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;