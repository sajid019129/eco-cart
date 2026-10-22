import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const rawUser = res.data.user || res.data;
      
      const userData = {
        ...rawUser,
        _id: rawUser._id || rawUser.id || rawUser.userId
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      if (setUser) setUser(userData);
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err.response || err.message);
      setError(err.response?.data?.message || 'Invalid email or password');
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

        /* Hide browser native password reveal icons */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
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
      `}</style>

      <div className="eco-post-container">
        <div className="eco-post-card">
          <h2 className="eco-post-title">Login to Eco-Cart</h2>
          <p className="eco-post-subtitle">Welcome back! Please enter your credentials</p>
          
          {error && <div className="eco-error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className={`eco-field-box ${formData.email ? 'has-value' : ''}`}>
              <label className="eco-field-label">
                <span>✉️</span> Email Address <span className="eco-required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="eco-input-field"
              />
            </div>

            {/* Password */}
            <div className={`eco-field-box ${formData.password ? 'has-value' : ''}`}>
              <label className="eco-field-label">
                <span>🔑</span> Password <span className="eco-required">*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="eco-input-field"
                  style={{ paddingRight: '80px' }}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <Link 
                to="/forgot-password" 
                style={{
                  color: '#2d6a4f',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#1b4332';
                  e.target.style.textDecoration = 'underline';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#2d6a4f';
                  e.target.style.textDecoration = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="eco-submit-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
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
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;