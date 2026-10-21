import React, { useState } from 'react';

const formatMediaSrc = (img) => {
  if (!img) return null;
  if (typeof img === 'object') {
    img = img.url || img.path || img.src || null;
  }
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    if (trimmed.startsWith('http') || trimmed.startsWith('data:image') || trimmed.startsWith('data:video') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    if (trimmed.length > 50) {
      const prefix = trimmed.startsWith('AAAA') || trimmed.includes('video') ? 'data:video/mp4;base64,' : 'data:image/jpeg;base64,';
      return `${prefix}${trimmed}`;
    }
    if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
      return `http://localhost:5000/${trimmed.replace(/^\//, '')}`;
    }
    return trimmed;
  }
  return null;
};

const isVideoUrl = (url) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.includes('video/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
};

const getFirstImageThumbnail = (product) => {
  if (!product) return null;
  let list = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images.map(formatMediaSrc).filter(Boolean);
  } else if (Array.isArray(product.photos) && product.photos.length > 0) {
    list = product.photos.map(formatMediaSrc).filter(Boolean);
  }
  if (list.length === 0) {
    const single = formatMediaSrc(product.image || product.imageUrl || product.photo);
    if (single) list.push(single);
  }

  for (let media of list) {
    if (!isVideoUrl(media)) {
      return media;
    }
  }
  return list[0] || null;
};

const CheckoutModal = ({ user, cart = [], onClose, onSuccess }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    cart.forEach((item, idx) => {
      const id = item.product?._id || item.product?.id || item._id || idx;
      initial[id] = item.quantity || 1;
    });
    return initial;
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [shippingLocation, setShippingLocation] = useState('');
  
  // OTP Screen State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const fullName = activeUser.name || activeUser.username || activeUser.fullName || 'Valued Customer';
  const phoneVal = activeUser.phone || activeUser.phoneNumber || activeUser.contact || '+880 1543-791537';
  const emailVal = activeUser.email || 'customer@ecocart.com';

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleQtyChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => {
      const prod = item.product || item;
      const id = prod._id || prod.id;
      const qty = quantities[id] || item.quantity || 1;
      const price = Number(prod.price || 0);
      return acc + price * qty;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = cart.length > 0 ? 70 : 0;
  const totalAmount = subtotal + shippingFee;

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!activeUser) {
      setError('Please login to complete your order.');
      return;
    }

    if (!shippingLocation.trim()) {
      setError('Please provide your delivery location / address.');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (['bKash', 'Nagad', 'Upay'].includes(paymentMethod) && !accountNumber.trim()) {
      setError(`Please provide your ${paymentMethod} account number.`);
      return;
    }

    if (paymentMethod === 'Mastercard' && !cardNumber.trim()) {
      setError('Please provide your Mastercard number.');
      return;
    }

    setError('');

    // Digital Payment: Show OTP Verification step first
    if (['bKash', 'Nagad', 'Upay', 'Mastercard'].includes(paymentMethod)) {
      setShowOtpScreen(true);
    } else {
      // Cash on Delivery: Process Order directly
      processFinalOrder();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.trim() !== '12345') {
      setError('Invalid 5-digit verification code. Please try again.');
      return;
    }
    setError('');
    processFinalOrder();
  };

  const processFinalOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderItems = cart.map(item => {
        const prod = item.product || item;
        const id = prod._id || prod.id;
        const qty = quantities[id] || item.quantity || 1;
        return { productId: id, quantity: qty };
      });

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: activeUser._id || activeUser.id,
          items: orderItems,
          paymentMethod: ['bKash', 'Nagad', 'Upay', 'Mastercard'].includes(paymentMethod) ? 'Digital' : 'COD',
          paymentDetails: {
            provider: paymentMethod,
            accountNumber: ['bKash', 'Nagad', 'Upay'].includes(paymentMethod) ? accountNumber : (paymentMethod === 'Mastercard' ? cardNumber : ''),
            trxId: ['bKash', 'Nagad', 'Upay'].includes(paymentMethod) ? 'ONLINE-OTP-PAID' : (paymentMethod === 'Mastercard' ? 'CARD-SECURE-PAY' : 'COD')
          },
          shippingAddress: { phone: phoneVal, location: shippingLocation }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      onSuccess(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          animation: ${isClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.25s ease-out'};
        }

        .modal-card {
          background: #ffffff;
          width: 90%;
          max-width: 580px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
          border: 1px solid #e5e7eb;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 4px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0;
        }

        .modal-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          margin-bottom: 16px;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.6rem;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          line-height: 1;
        }

        .close-btn:hover {
          color: #d32f2f;
          transform: scale(1.2);
        }

        .prod-summary-container {
          max-height: 220px;
          overflow-y: auto;
          padding-right: 4px;
          margin-bottom: 18px;
        }

        .prod-summary-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .prod-summary-item {
          display: flex;
          gap: 14px;
          align-items: center;
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
          transition: all 0.25s ease;
        }

        .prod-summary-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(27, 67, 50, 0.1);
          border-color: #2d6a4f;
        }

        .prod-img {
          width: 55px;
          height: 55px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #f3f4f6;
        }

        .qty-box {
          display: flex;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
          background: #f9fafb;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          margin-top: 4px;
          width: fit-content;
        }

        .qty-btn {
          border: none;
          background-color: #f1f3f5;
          color: #1b4332;
          padding: 4px 10px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .qty-btn:hover {
          background-color: #2d6a4f;
          color: #ffffff;
        }

        .qty-text {
          padding: 0 10px;
          font-weight: bold;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .form-section-box {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }

        .section-box-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1b4332;
          margin: 0 0 12px 0;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1b4332;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          background: #fff;
          color: #1f2937;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: #1b4332;
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.15);
        }

        .form-input-frozen {
          background-color: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
          border: 1px solid #d1d5db;
        }

        .otp-verification-input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 1.25rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          background: #fff;
          color: #1f2937;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          letter-spacing: 3px;
          font-weight: 700;
        }

        .otp-verification-input::placeholder {
          color: #9ca3af;
          font-size: 1.05rem;
          letter-spacing: 1px;
          font-weight: 500;
        }

        .otp-verification-input:focus {
          border-color: #1b4332;
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.15);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .pay-card {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 700;
          font-size: 1.05rem;
          color: #1b4332;
          background: #ffffff;
          text-align: center;
          position: relative;
        }

        .pay-card.full-width {
          grid-column: span 2;
        }

        .pay-card:hover {
          border-color: #2d6a4f;
          background: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.08);
        }

        /* HIGH-CONTRAST SELECTED PAYMENT CARD HIGHLIGHT */
        .pay-card.selected {
          border: 2px solid #1b4332;
          background: #eaf4ef;
          box-shadow: 0 6px 18px rgba(27, 67, 50, 0.18);
          transform: translateY(-2px);
        }

        .pay-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 8px;
          background: #fff;
          border: 1px solid #e5e7eb;
          padding: 4px;
          flex-shrink: 0;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 18px 20px;
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          margin-bottom: 16px;
          font-family: inherit;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #555;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .shipping-note {
          font-size: 0.88rem;
          color: #d32f2f;
          font-weight: 700;
          margin-top: 4px;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.15rem;
          font-weight: bold;
          color: #1b4332;
          border-top: 1px solid #eee;
          padding-top: 12px;
          margin-top: 12px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .checkout-btn {
          flex: 1;
          background: transparent;
          color: #2d6a4f;
          border: 1.5px solid #2d6a4f;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checkout-btn:hover {
          background-color: #2d6a4f;
          color: #ffffff;
          border-color: #2d6a4f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
        }

        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          flex: 1;
          background: transparent;
          color: #d32f2f;
          border: 1.5px solid #fca5a5;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background-color: #d32f2f;
          color: #ffffff;
          border-color: #d32f2f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.25);
        }

        .error-banner {
          background: #ffebee;
          color: #d32f2f;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 0.95rem;
          margin-bottom: 16px;
          font-weight: 600;
          border: 1px solid #fca5a5;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.96); }
        }
      `}</style>

      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              {showOtpScreen ? `${paymentMethod} Verification 🔐` : 'Secure Checkout 💸'}
            </h3>
            <button className="close-btn" onClick={handleClose}>&times;</button>
          </div>
          <div className="modal-subtitle">
            {showOtpScreen 
              ? `Verification code sent to ${accountNumber || cardNumber}`
              : 'Review your items and complete your order securely'}
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* SCREEN 2: OTP VERIFICATION FORM */}
          {showOtpScreen ? (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-section-box" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>📲</div>
                <h4 className="section-box-title" style={{ fontSize: '1.3rem', marginBottom: '12px' }}>
                  Enter Verification Code
                </h4>
                <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '22px', lineHeight: '1.5' }}>
                  A 5-digit OTP verification code has been sent to your <strong>{paymentMethod}</strong> number: <br />
                  <strong style={{ color: '#1b4332', fontSize: '1.15rem', letterSpacing: '0.5px' }}>{accountNumber || cardNumber}</strong>
                </p>

                <div className="form-group" style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
                  <input
                    type="text"
                    className="otp-verification-input"
                    placeholder="Enter 5-digit verification code"
                    maxLength={5}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="button-group" style={{ marginTop: '20px' }}>
                <button type="submit" className="checkout-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Complete Order'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowOtpScreen(false);
                    setError('');
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            /* SCREEN 1: STANDARD CHECKOUT FORM */
            <>
              <div className="prod-summary-container">
                <div className="prod-summary-list">
                  {cart.map((item, idx) => {
                    const prod = item.product || item;
                    const id = prod._id || prod.id || idx;
                    const qty = quantities[id] || item.quantity || 1;
                    const price = Number(prod.price || 0);
                    const thumb = getFirstImageThumbnail(prod);

                    return (
                      <div key={id} className="prod-summary-item">
                        <img src={thumb || '/placeholder.png'} alt={prod.title || 'Product'} className="prod-img" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#2b2b2b', fontSize: '1rem' }}>{prod.title || prod.name}</div>
                          <div style={{ color: '#2d6a4f', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '2px' }}>৳ {price.toFixed(2)}</div>
                          <div className="qty-box">
                            <button 
                              type="button"
                              className="qty-btn" 
                              onClick={() => handleQtyChange(id, -1)}
                            >
                              -
                            </button>
                            <span className="qty-text">{qty}</span>
                            <button 
                              type="button"
                              className="qty-btn" 
                              onClick={() => handleQtyChange(id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleInitialSubmit}>
                <div className="form-section-box">
                  <h4 className="section-box-title">Customer Details</h4>
                  <div className="form-group">
                    <label className="form-label">Full Name <span style={{ color: '#d32f2f' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input form-input-frozen"
                      value={fullName}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number <span style={{ color: '#d32f2f' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input form-input-frozen"
                      value={phoneVal}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address <span style={{ color: '#d32f2f' }}>*</span></label>
                    <input
                      type="email"
                      className="form-input form-input-frozen"
                      value={emailVal}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Location / Address <span style={{ color: '#d32f2f' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your current location"
                      value={shippingLocation}
                      onChange={(e) => setShippingLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-section-box">
                  <h4 className="section-box-title">Select Payment Method <span style={{ color: '#d32f2f' }}>*</span></h4>
                  <div className="payment-grid">
                    <div
                      className={`pay-card ${paymentMethod === 'bKash' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('bKash')}
                    >
                      <img src="/bKash.jpg" alt="bKash" className="pay-logo" />
                      <span>bKash</span>
                    </div>
                    <div
                      className={`pay-card ${paymentMethod === 'Nagad' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Nagad')}
                    >
                      <img src="/Nagad.jpg" alt="Nagad" className="pay-logo" />
                      <span>Nagad</span>
                    </div>
                    <div
                      className={`pay-card ${paymentMethod === 'Upay' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Upay')}
                    >
                      <img src="/Upay.jpg" alt="Upay" className="pay-logo" />
                      <span>Upay</span>
                    </div>
                    <div
                      className={`pay-card ${paymentMethod === 'Mastercard' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Mastercard')}
                    >
                      <img src="/MasterCard.png" alt="Mastercard" className="pay-logo" />
                      <span>Mastercard</span>
                    </div>
                    <div
                      className={`pay-card full-width ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                    >
                      <img src="/Cash on Delivery.jpg" alt="Cash on Delivery" className="pay-logo" />
                      <span>Cash on Delivery</span>
                    </div>
                  </div>
                </div>

                {['bKash', 'Nagad', 'Upay'].includes(paymentMethod) && (
                  <div className="form-section-box">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Your {paymentMethod} Account Number <span style={{ color: '#d32f2f' }}>*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 019xxxxxxxx"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Mastercard' && (
                  <div className="form-section-box">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Your Mastercard number <span style={{ color: '#d32f2f' }}>*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. xxxx xxxx xxxx xxxx"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="summary-card">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>৳ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>Shipping Fee</span>
                      <span className="shipping-note">
                        Flat Delivery All Over BD!
                      </span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#1b4332' }}>৳ {shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>৳ {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="button-group">
                  <button type="submit" className="checkout-btn" disabled={loading}>
                    Confirm Order
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleClose}>
                    Cancel Order
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;