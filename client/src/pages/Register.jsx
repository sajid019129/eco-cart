import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

function Register({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const avatarUrl = preview || DEFAULT_AVATAR;

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      avatar: avatarUrl,
    };

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      const loggedInUser = res.data.user || userData;
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      if (setUser) setUser(loggedInUser);

      navigate('/login');
    } catch (err) {
      console.error('Registration Error:', err.response || err.message);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please check server logs or network status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create your Eco-Cart Account</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="John Doe"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="user@example.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Profile Picture (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </div>

          <div style={styles.previewBox}>
            <span style={styles.previewLabel}>Selected Avatar Preview:</span>
            <img
              src={preview || DEFAULT_AVATAR}
              alt="Avatar Preview"
              style={styles.avatarPreview}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={styles.submitBtn}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
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
  container: { minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6', padding: '20px' },
  card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title: { color: '#1b4332', textAlign: 'center', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#2d6a4f' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '0.95rem' },
  fileInput: { fontSize: '0.85rem' },
  previewBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8f5e9', padding: '10px 15px', borderRadius: '8px' },
  previewLabel: { fontSize: '0.85rem', color: '#2d6a4f', fontWeight: '600' },
  avatarPreview: { width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #52b788' },
  submitBtn: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px', transition: 'all 0.2s ease' },
  error: { color: '#d90429', fontSize: '0.85rem', textAlign: 'center' },
  footerText: { textAlign: 'center', fontSize: '0.9rem', marginTop: '15px', color: '#555' },
  link: { color: '#2d6a4f', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease' },
};

export default Register;