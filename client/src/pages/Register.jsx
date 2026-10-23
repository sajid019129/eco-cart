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

  const [isSeller, setIsSeller] = useState(false);
  const [sellerAccounts, setSellerAccounts] = useState({
    bKash: '',
    nagad: '',
    upay: '',
    masterCard: '',
    bankName: '',
    bankAccountNumber: ''
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

  const handleSellerAccountChange = (e) => {
    setSellerAccounts({ ...sellerAccounts, [e.target.name]: e.target.value });
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

    if (isSeller) {
      const bdPhoneRegex = /^01[0-9]{9}$/;
      const cardRegex = /^[0-9]{16}$/;

      if (sellerAccounts.bKash && !bdPhoneRegex.test(sellerAccounts.bKash.trim())) {
        setError('Please enter a valid 11-digit mobile number starting with 01 for bKash Account.');
        return;
      }
      if (sellerAccounts.nagad && !bdPhoneRegex.test(sellerAccounts.nagad.trim())) {
        setError('Please enter a valid 11-digit mobile number starting with 01 for Nagad Account.');
        return;
      }
      if (sellerAccounts.upay && !bdPhoneRegex.test(sellerAccounts.upay.trim())) {
        setError('Please enter a valid 11-digit mobile number starting with 01 for Upay Account.');
        return;
      }
      if (sellerAccounts.masterCard) {
        const cleanCard = sellerAccounts.masterCard.replace(/\s+/g, '');
        if (!cardRegex.test(cleanCard)) {
          setError('Please enter a valid 16-digit MasterCard Account number.');
          return;
        }
      }
      if (!sellerAccounts.bankName.trim() || !sellerAccounts.bankAccountNumber.trim()) {
        setError('Please fill in both Bank Name and Bank Account Number for seller payouts.');
        return;
      }
    }

    setLoading(true);
    const avatarUrl = preview || DEFAULT_AVATAR;
    const formattedDob = `${dobDay}/${dobMonth}/${dobYear}`;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formattedDob,
        age: calculatedAge,
        avatar: avatarUrl,
        isSeller,
        sellerAccounts: isSeller ? {
          bKash: sellerAccounts.bKash,
          nagad: sellerAccounts.nagad,
          upay: sellerAccounts.upay,
          masterCard: sellerAccounts.masterCard,
          bank: {
            bankName: sellerAccounts.bankName,
            accountNumber: sellerAccounts.bankAccountNumber
          }
        } : null
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
      await axios.post('http://localhost:5000/api/auth/verify-register', {
        email: formData.email,
        otp: otp.trim()
      });
      
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
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
          max-width: 620px;
          width: 100%;
          text-align: center;
        }

        .avatar-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #e8f5e9;
          margin: 0 auto 16px auto;
          overflow: hidden;
          border: 3px solid #2d6a4f;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          font-size: 1.05rem;
          color: #4b5563;
          font-weight: 700;
          margin: 0 0 24px 0;
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
          text-align: left;
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

        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }

        .eco-input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .eco-select-dropdown {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #fff;
          outline: none;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .eco-select-dropdown:hover {
          border-color: #2d6a4f;
          background: #f4fbf7;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.1);
        }

        .eco-file-input {
          font-size: 0.88rem;
          cursor: pointer;
          margin-top: 4px;
          margin-bottom: 10px;
          padding: 6px;
          border: 1px solid transparent;
          border-radius: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .eco-file-input:hover {
          background-color: #f1f8f5;
          border-color: #2d6a4f;
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.08);
        }

        .eco-seller-toggle-box {
          background-color: #eaf4ef;
          border: 1.5px solid #2d6a4f;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-align: left;
        }

        .eco-seller-toggle-box:hover {
          background-color: #d8f3dc;
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 6px 18px rgba(45, 106, 79, 0.15);
        }

        .eco-seller-section {
          background: #f1f8f5;
          border: 1.5px solid #c8e6c9;
          border-radius: 12px;
          padding: 18px;
          margin-top: 14px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.04);
          transform-origin: top;
          animation: sellerSectionEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          text-align: left;
        }

        @keyframes sellerSectionEnter {
          0% {
            opacity: 0;
            transform: translateY(-15px) scaleY(0.95);
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
            overflow: hidden;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
            max-height: 1200px;
            padding: 18px;
          }
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

        .provider-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #d1d5db;
          padding: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
      `}</style>

      <div className="eco-post-container">
        <div className="eco-post-card">
          <div className="avatar-container">
            <img 
              src="/Eco-Cart Profile Picture.jpg" 
              alt="Eco-Cart Logo" 
              className="avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <h2 className="eco-post-title">Create your Eco-Cart Account</h2>
          <p className="eco-post-subtitle">Join our community marketplace</p>

          {error && <div className="eco-error-banner">{error}</div>}
          {message && <div className="eco-success-banner">{message}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestRegister}>
              {/* Full Name */}
              <div className={`eco-field-box ${formData.name ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>👤</span> Full Name <span className="eco-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="eco-input-field"
                />
              </div>

              {/* Email Address */}
              <div className={`eco-field-box ${formData.email ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>✉️</span> Email Address <span className="eco-required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="eco-input-field"
                />
              </div>

              {/* Password */}
              <div className={`eco-field-box ${formData.password ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>🔑</span> Password (6 to 12 characters) <span className="eco-required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength="6"
                    maxLength="12"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="6 to 12 characters"
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

              {/* Phone Number */}
              <div className={`eco-field-box ${formData.phone ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>📞</span> Phone Number <span className="eco-required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +880 19xx-xxxxxx"
                  className="eco-input-field"
                />
              </div>

              {/* Date of Birth */}
              <div className="eco-field-box">
                <label className="eco-field-label">
                  <span>📅</span> Date of Birth (Must be 18+) <span className="eco-required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <select
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className="eco-select-dropdown"
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
                    className="eco-select-dropdown"
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
                    className="eco-select-dropdown"
                    required
                  >
                    <option value="" disabled>Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {calculatedAge !== null && calculatedAge < 18 && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '6px', color: '#d90429' }}>
                    (Must be 18+ to register an account)
                  </div>
                )}
              </div>

              {/* Profile Picture & Default Avatar Notice */}
              <div className="eco-field-box">
                <label className="eco-field-label">
                  <span>🖼️</span> Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="eco-file-input"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f8f5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                  <img src={preview || DEFAULT_AVATAR} alt="Avatar Preview" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2d6a4f' }} />
                  <div style={{ fontSize: '0.82rem', color: '#1b4332', lineHeight: '1.3' }}>
                    <strong>{preview ? "Custom Avatar Selected" : "Default Avatar Assigned:"}</strong> 
                    <div>{preview ? "Your chosen photo will be used." : "This default avatar will be used if no photo is uploaded."}</div>
                  </div>
                </div>
              </div>

              {/* Seller Checkbox Toggle */}
              <div className="eco-seller-toggle-box">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '700', color: '#1b4332', cursor: 'pointer', width: '100%' }}>
                  <input
                    type="checkbox"
                    checked={isSeller}
                    onChange={(e) => setIsSeller(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#1b4332', cursor: 'pointer', transform: 'scale(1.15)', transition: 'transform 0.2s ease' }}
                  />
                  <span>I want to sell products on Eco-Cart 🛍️</span>
                </label>
              </div>

              {/* Dynamic Seller Financial & Payout Accounts */}
              {isSeller && (
                <div className="eco-seller-section">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1b4332', margin: '0 0 6px 0' }}>
                    Seller Payout & Cash-Out Accounts 💸
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Provide your financial account details so cash on delivery (COD) or digital order earnings paid by buyers are routed directly to your account.
                  </p>

                  {/* bKash Account Number */}
                  <div className={`eco-field-box ${sellerAccounts.bKash ? 'has-value' : ''}`}>
                    <label className="eco-field-label">
                      <img src="/bKash.jpg" alt="bKash" className="provider-logo-img" />
                      <span>bKash Account Number</span> <span className="eco-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="bKash"
                      value={sellerAccounts.bKash}
                      onChange={handleSellerAccountChange}
                      placeholder="e. g. 019xxxxxxxx"
                      maxLength={11}
                      className="eco-input-field"
                      required={isSeller}
                    />
                  </div>

                  {/* Nagad Account Number */}
                  <div className={`eco-field-box ${sellerAccounts.nagad ? 'has-value' : ''}`}>
                    <label className="eco-field-label">
                      <img src="/Nagad.jpg" alt="Nagad" className="provider-logo-img" />
                      <span>Nagad Account Number</span> <span className="eco-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="nagad"
                      value={sellerAccounts.nagad}
                      onChange={handleSellerAccountChange}
                      placeholder="e. g. 019xxxxxxxx"
                      maxLength={11}
                      className="eco-input-field"
                      required={isSeller}
                    />
                  </div>

                  {/* Upay Account Number */}
                  <div className={`eco-field-box ${sellerAccounts.upay ? 'has-value' : ''}`}>
                    <label className="eco-field-label">
                      <img src="/Upay.jpg" alt="Upay" className="provider-logo-img" />
                      <span>Upay Account Number</span> <span className="eco-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="upay"
                      value={sellerAccounts.upay}
                      onChange={handleSellerAccountChange}
                      placeholder="e. g. 019xxxxxxxx"
                      maxLength={11}
                      className="eco-input-field"
                      required={isSeller}
                    />
                  </div>

                  {/* MasterCard Account Number */}
                  <div className={`eco-field-box ${sellerAccounts.masterCard ? 'has-value' : ''}`}>
                    <label className="eco-field-label">
                      <img src="/MasterCard.png" alt="MasterCard" className="provider-logo-img" />
                      <span>MasterCard Account Number</span> <span className="eco-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="masterCard"
                      value={sellerAccounts.masterCard}
                      onChange={handleSellerAccountChange}
                      placeholder="e. g. xxxx xxxx xxxx xxxx"
                      maxLength={19}
                      className="eco-input-field"
                      required={isSeller}
                    />
                  </div>

                  {/* Bank Account Details */}
                  <div style={{ borderTop: '1px solid #d1e7dd', paddingTop: '14px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <img src="/Bank.png" alt="Bank" className="provider-logo-img" />
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1b4332' }}>
                        Bank Account Details (COD Payouts) <span className="eco-required">*</span>
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#555', margin: '0 0 12px 0', lineHeight: '1.3' }}>
                      Sellers will receive money paid on Cash on Delivery (COD) by buyers here.
                    </p>

                    {/* Bank Name Field */}
                    <div className={`eco-field-box ${sellerAccounts.bankName ? 'has-value' : ''}`}>
                      <label className="eco-field-label">
                        Bank Name <span className="eco-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={sellerAccounts.bankName}
                        onChange={handleSellerAccountChange}
                        placeholder="e. g. BRAC Bank PLC"
                        className="eco-input-field"
                        required={isSeller}
                      />
                    </div>

                    {/* Bank Account Number Field */}
                    <div className={`eco-field-box ${sellerAccounts.bankAccountNumber ? 'has-value' : ''}`} style={{ marginBottom: 0 }}>
                      <label className="eco-field-label">
                        Bank Account Number <span className="eco-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={sellerAccounts.bankAccountNumber}
                        onChange={handleSellerAccountChange}
                        placeholder="e. g. xxxxxxxx"
                        className="eco-input-field"
                        required={isSeller}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || (calculatedAge !== null && calculatedAge < 18)} 
                className="eco-submit-btn"
                style={{
                  opacity: (calculatedAge !== null && calculatedAge < 18) ? 0.6 : 1,
                  cursor: (calculatedAge !== null && calculatedAge < 18) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending Verification Code...' : 'Continue & Send Verification Code'}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION SCREEN */
            <form onSubmit={handleVerifyAndRegister}>
              <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
                Enter the 6-digit verification code sent to <strong style={{ color: '#1b4332' }}>{formData.email}</strong>.
              </p>

              <div className="eco-field-box">
                <label className="eco-field-label">
                  <span>🔐</span> 6-Digit Verification Code <span className="eco-required">*</span>
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '5px', fontWeight: 'bold' }}
                  className="eco-input-field"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} className="eco-submit-btn">
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setMessage('');
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#2d6a4f',
                  border: '1.5px solid #2d6a4f',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '10px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e9';
                  e.currentTarget.style.borderColor = '#1b4332';
                  e.currentTarget.style.color = '#1b4332';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 106, 79, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#2d6a4f';
                  e.currentTarget.style.color = '#2d6a4f';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Back to Registration Details
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '22px', color: '#666' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ color: '#2d6a4f', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease' }}
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

export default Register;