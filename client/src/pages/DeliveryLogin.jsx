import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeliveryLogin = ({ setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/delivery-team-login', {
        username,
        email,
        password
      });

      const rawUser = res.data?.user;
      const token = res.data?.token;

      if (!rawUser || !token) {
        throw new Error('The server did not return an authenticated user and token.');
      }

      const userData = {
        ...rawUser,
        _id: rawUser._id || rawUser.id || rawUser.userId,
        name: rawUser.name || 'Eco-Cart Delivery Team'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      if (setUser) setUser(userData);
      navigate('/logistics-dashboard');
    } catch (err) {
      console.error('Delivery-team login failed:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid delivery team credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes moveTruckLeftRight {
          0% { transform: translateX(0); }
          50% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        .delivery-truck-anim-left {
          display: inline-block;
          animation: moveTruckLeftRight 0.8s ease-in-out infinite;
          margin-right: 12px;
        }
        .delivery-truck-anim-right {
          display: inline-block;
          animation: moveTruckLeftRight 0.8s ease-in-out infinite reverse;
          margin-left: 12px;
        }
        .delivery-input:focus {
          border-color: #2d6a4f !important;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.15) !important;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.avatarContainer}>
          <img 
            src="/Eco-Cart Delivery Team.jpg" 
            alt="Delivery Team" 
            style={styles.avatarImg}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <h2 style={styles.title}>
          <span className="delivery-truck-anim-left">🚚</span>
          <span>Eco-Cart Delivery Team</span>
          <span className="delivery-truck-anim-right">🚚</span>
        </h2>
        <p style={styles.subtitle}>Eco-Cart Secure Logistics Access</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              USERNAME <span style={styles.asterisk}>*</span>
            </label>
            <input
              type="text"
              className="delivery-input"
              placeholder="Enter dedicated username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              EMAIL ADDRESS <span style={styles.asterisk}>*</span>
            </label>
            <input
              type="email"
              className="delivery-input"
              placeholder="Enter dedicated email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              PASSWORD <span style={styles.asterisk}>*</span>
            </label>
            <input
              type="password"
              className="delivery-input"
              placeholder="Enter dedicated password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1b4332';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2d6a4f';
            }}
          >
            {loading ? 'Authenticating...' : 'Login as Delivery Team'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: 'calc(100vh - 70px)',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  avatarContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#e8f5e9',
    margin: '0 auto 16px auto',
    overflow: 'hidden',
    border: '3px solid #2d6a4f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#1b4332',
    margin: '0 0 6px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.2px'
  },
  subtitle: {
    fontSize: '0.92rem', // Decreased font size for Eco-Cart Secure Logistics Access
    color: '#4b5563',
    fontWeight: '600',
    margin: '0 0 24px 0'
  },
  errorBox: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    marginBottom: '18px',
    fontWeight: '600',
    border: '1px solid #ffcdd2'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    textAlign: 'left'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#374151',
    letterSpacing: '0.5px'
  },
  asterisk: {
    color: '#e63946',
    fontWeight: '800',
    marginLeft: '2px'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    transition: 'all 0.2s ease'
  },
  submitBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '1.12rem',
    marginTop: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(45, 106, 79, 0.25)'
  }
};

export default DeliveryLogin;