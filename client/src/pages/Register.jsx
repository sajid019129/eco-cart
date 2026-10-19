import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

function Register({ setUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [calculatedAge, setCalculatedAge] = useState(null);

  const [otp, setOtp] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '1', name: 'January' },
    { value: '2', name: 'February' },
    { value: '3', name: 'March' },
    { value: '4', name: 'April' },
    { value: '5', name: 'May' },
    { value: '6', name: 'June' },
    { value: '7', name: 'July' },
    { value: '8', name: 'August' },
    { value: '9', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      const today = new Date();
      const birthDate = new Date(Number(dobYear), Number(dobMonth) - 1, Number(dobDay));
      let age = today.getFullYear() - birthDate.getFullYear();
      const mDiff = today.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [dobDay, dobMonth, dobYear]);

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

  const handleRequestRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password.length < 6 || formData.password.length > 12) {
      setError('Password must be between 6 and 12 characters long.');
      return;
    }

    if (calculatedAge === null || calculatedAge < 18) {
      setError('You must be at least 18 years old to register an account.');
      return;
    }

    setLoading(true);
    const avatarUrl = preview || DEFAULT_AVATAR;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: calculatedAge,
        avatar: avatarUrl,
      });
      setMessage(res.data.message || 'Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      console.error('Registration Error:', err.response || err.message);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-register', {
        email: formData.email,
        otp: otp.trim()
      });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      const loggedInUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      if (setUser) setUser(loggedInUser);

      navigate('/');
    } catch (err) {
      console.error('Verification Error:', err.response || err.message);
      setError(
        err.response?.data?.message || 
        'Invalid or expired verification code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create your Eco-Cart Account</h2>
        {error && <div style={styles.errorAlert}>{error}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestRegister} style={styles.form}>
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
              <label style={styles.label}>Password (6 to 12 characters)</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength="6"
                  maxLength="12"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.passwordInput}
                  placeholder="6-12 characters"
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
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. +880 19xx-xxxxxx"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Date of Birth (Must be 18+)</label>
              <div style={styles.dobRow}>
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="" disabled>Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="" disabled>Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>

                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="" disabled>Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {calculatedAge !== null && calculatedAge < 18 && (
                <div style={{ ...styles.ageInfo, color: '#d90429' }}>
                  (Must be 18+ to register)
                </div>
              )}
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
              disabled={loading || (calculatedAge !== null && calculatedAge < 18)} 
              style={{
                ...styles.submitBtn,
                opacity: (calculatedAge !== null && calculatedAge < 18) ? 0.6 : 1,
                cursor: (calculatedAge !== null && calculatedAge < 18) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading && !(calculatedAge !== null && calculatedAge < 18)) {
                  e.target.style.backgroundColor = '#1b4332';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !(calculatedAge !== null && calculatedAge < 18)) {
                  e.target.style.backgroundColor = '#2d6a4f';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? 'Sending Code...' : 'Continue & Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} style={styles.form}>
            <p style={styles.instruction}>
              Enter the 6-digit verification code sent to <strong>{formData.email}</strong>.
            </p>

            <div style={styles.field}>
              <label style={styles.label}>6-Digit Verification Code</label>
              <input
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ ...styles.input, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
                placeholder="6-Digit Verification Code"
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
              {loading ? 'Verifying...' : 'Verify & Register'}
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
                e.target.style.backgroundColor = '#f1f8f5';
                e.target.style.color = '#1b4332';
                e.target.style.borderColor = '#52b788';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#2d6a4f';
                e.target.style.borderColor = '#2d6a4f';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Back to Registration Details
            </button>
          </form>
        )}

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
  card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px', boxSizing: 'border-box' },
  title: { color: '#1b4332', textAlign: 'center', marginBottom: '20px', fontSize: '1.8rem', fontWeight: '700' },
  instruction: { fontSize: '0.9rem', color: '#555', marginBottom: '15px', textAlign: 'center', lineHeight: '1.4' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#2d6a4f' },
  input: { padding: '12px 15px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  passwordContainer: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  passwordInput: { width: '100%', padding: '12px 65px 12px 15px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  shapeBtn: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#e8f5e9', color: '#2d6a4f', border: '1px solid #a3b899', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
  dobRow: { display: 'flex', gap: '8px' },
  select: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '0.9rem', backgroundColor: '#fff', outline: 'none' },
  ageInfo: { fontSize: '0.85rem', fontWeight: 'bold', marginTop: '4px' },
  fileInput: { fontSize: '0.85rem' },
  previewBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8f5e9', padding: '10px 15px', borderRadius: '8px' },
  previewLabel: { fontSize: '0.85rem', color: '#2d6a4f', fontWeight: '600' },
  avatarPreview: { width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #52b788' },
  submitBtn: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '5px', transition: 'all 0.2s ease' },
  secondaryButton: { backgroundColor: 'transparent', color: '#2d6a4f', border: '1px solid #2d6a4f', padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' },
  errorAlert: { backgroundColor: '#ffedd5', color: '#c2410c', padding: '10px 12px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' },
  successAlert: { backgroundColor: '#d8f3dc', color: '#1b4332', padding: '10px 12px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' },
  footerText: { textAlign: 'center', fontSize: '0.9rem', marginTop: '20px', color: '#666' },
  link: { color: '#2d6a4f', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease' },
};

export default Register;