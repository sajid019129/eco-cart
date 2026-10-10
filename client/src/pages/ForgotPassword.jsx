import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError('Password must be at least 6 characters long.');
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
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={styles.form}>
            <p style={styles.instruction}>
              Enter your registered email address to receive a 6-digit verification code.
            </p>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button 
              type="submit" 
              disabled={loading} 
              style={styles.button}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#1b4332';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2d6a4f';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <p style={styles.instruction}>
              Enter the 6-digit verification code sent to <strong>{email}</strong>.
            </p>
            <input
              type="text"
              placeholder="6-Digit Verification Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
            />
            <button 
              type="submit" 
              style={styles.button}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1b4332';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2d6a4f';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Verify Code
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setMessage('');
              }}
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f1f1f1';
                e.target.style.color = '#333';
                e.target.style.borderColor = '#999';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#666';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Back to Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <p style={styles.instruction}>Create a new password for your account.</p>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button 
              type="submit" 
              disabled={loading} 
              style={styles.button}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#1b4332';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2d6a4f';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={styles.footerText}>
          Remembered your password?{' '}
          <Link 
            to="/login" 
            style={styles.link}
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
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#f4f7f6',
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px 35px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#2b2b2b',
    textAlign: 'center',
    marginBottom: '20px',
  },
  instruction: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '15px',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '5px',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorAlert: {
    backgroundColor: '#ffedd5',
    color: '#c2410c',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '15px',
    textAlign: 'center',
  },
  successAlert: {
    backgroundColor: '#d8f3dc',
    color: '#1b4332',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '15px',
    textAlign: 'center',
  },
  footerText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
  },
  link: {
    color: '#2d6a4f',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s ease',
  }
};

export default ForgotPassword;