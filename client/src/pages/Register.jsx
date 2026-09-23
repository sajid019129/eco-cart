import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register({ setUser }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      if (res.data && res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } else {
        setError('Registration succeeded but auto-login details were missing.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
        <h2>Register for Eco-Cart</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required 
          style={styles.input}
          autoComplete="off"
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          required 
          style={styles.input}
          autoComplete="off"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          required 
          style={styles.input}
          autoComplete="new-password"
        />
        <button type="submit" style={styles.button}>Register</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', marginTop: '3rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' },
  input: { padding: '0.5rem', fontSize: '1rem' },
  button: { padding: '0.5rem', backgroundColor: '#2e7d32', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }
};

export default Register;