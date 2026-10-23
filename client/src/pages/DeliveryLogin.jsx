import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeliveryLogin = ({ setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <>
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

        /* Suppress browser built-in password reveal / eye icons */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-textfield-decoration-container,
        input[type="password"]::-webkit-contacts-auto-fill-button,
        input[type="password"]::-webkit-credentials-auto-fill-button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          position: absolute !important;
          right: 0 !important;
        }

        .eco-input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
      `}</style>

      <div style={styles.pageWrapper}>
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

          <form onSubmit={handleLogin}>
            {/* Username Field */}
            <div className={`eco-field-box ${username ? 'has-value' : ''}`}>
              <label className="eco-field-label">
                <span>👤</span> USERNAME <span style={styles.asterisk}>*</span>
              </label>
              <input
                type="text"
                className="eco-input-field"
                placeholder="Enter dedicated username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email Address Field */}
            <div className={`eco-field-box ${email ? 'has-value' : ''}`}>
              <label className="eco-field-label">
                <span>✉️</span> EMAIL ADDRESS <span style={styles.asterisk}>*</span>
              </label>
              <input
                type="email"
                className="eco-input-field"
                placeholder="Enter dedicated email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field with Custom Show/Hide Button */}
            <div className={`eco-field-box ${password ? 'has-value' : ''}`}>
              <label className="eco-field-label">
                <span>🔑</span> PASSWORD <span style={styles.asterisk}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="eco-input-field"
                  placeholder="Enter dedicated password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '80px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1b4332';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(27, 67, 50, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2d6a4f';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(45, 106, 79, 0.25)';
                }
              }}
            >
              {loading ? 'Authenticating...' : 'Login as Delivery Team'}
            </button>
          </form>
        </div>
      </div>
    </>
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
    fontSize: '1.05rem',
    color: '#4b5563',
    fontWeight: '700',
    margin: '0 0 24px 0'
  },
  errorBox: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    marginBottom: '20px',
    fontWeight: '700',
    border: '1px solid #fca5a5',
    textAlign: 'center'
  },
  asterisk: {
    color: '#e63946',
    fontWeight: '800',
    marginLeft: '2px'
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '1.12rem',
    marginTop: '6px',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 14px rgba(45, 106, 79, 0.25)'
  }
};

export default DeliveryLogin;