import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const userData = res.data.user || res.data;
      
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
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <div style={styles.forgotBox}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
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
  }
};

export default Login;