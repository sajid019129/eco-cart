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
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to Eco-Cart</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.shapeBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d8f3dc';
                e.currentTarget.style.borderColor = '#2d6a4f';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e8f5e9';
                e.currentTarget.style.borderColor = '#a3b899';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div style={styles.forgotBox}>
            <Link 
              to="/forgot-password" 
              style={styles.forgotLink}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
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
            Register here
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
    marginBottom: '25px',
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
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: '12px 65px 12px 15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  shapeBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#e8f5e9',
    color: '#2d6a4f',
    border: '1px solid #a3b899',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    padding: '5px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  forgotBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-5px',
  },
  forgotLink: {
    color: '#2d6a4f',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s ease',
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
  errorAlert: {
    backgroundColor: '#ffedd5',
    color: '#c2410c',
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

export default Login;