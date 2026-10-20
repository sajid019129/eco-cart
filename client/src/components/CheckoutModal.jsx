import React, { useState } from 'react';

const CheckoutModal = ({ product, user, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bKash'); // bKash, Nagad, Upay, Mastercard, Cash on Delivery
  const [accountNumber, setAccountNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [shippingLocation, setShippingLocation] = useState(user?.address || user?.location || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = 70;
  const itemPrice = Number(product?.price || 0);
  const subtotal = itemPrice * quantity;
  const totalAmount = subtotal + shippingFee;

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1) setQuantity(newQty);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to complete your order.');
      return;
    }

    if (!shippingPhone.trim() || !shippingLocation.trim()) {
      setError('Please provide a valid shipping address and phone number.');
      return;
    }

    if (['bKash', 'Nagad', 'Upay'].includes(paymentMethod) && (!accountNumber.trim() || !trxId.trim())) {
      setError(`Please provide your ${paymentMethod} account number and Transaction ID (TrxID).`);
      return;
    }

    if (paymentMethod === 'Mastercard' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
      setError('Please provide valid Mastercard details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user._id || user.id,
          items: [{ productId: product._id, quantity }],
          paymentMethod: ['bKash', 'Nagad', 'Upay', 'Mastercard'].includes(paymentMethod) ? 'Digital' : 'COD',
          paymentDetails: {
            provider: paymentMethod,
            accountNumber: ['bKash', 'Nagad', 'Upay'].includes(paymentMethod) ? accountNumber : (paymentMethod === 'Mastercard' ? cardNumber : ''),
            trxId: ['bKash', 'Nagad', 'Upay'].includes(paymentMethod) ? trxId : (paymentMethod === 'Mastercard' ? 'CARD-SECURE-PAY' : 'COD')
          },
          shippingAddress: { phone: shippingPhone, location: shippingLocation }
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
          animation: fadeIn 0.25s ease-out;
        }

        .modal-card {
          background: #ffffff;
          width: 92%;
          max-width: 540px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #e63946;
        }

        .prod-summary {
          display: flex;
          gap: 14px;
          align-items: center;
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          margin-bottom: 16px;
        }

        .prod-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #2d6a4f;
        }

        .qty-picker {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }

        .qty-btn {
          background: #2d6a4f;
          color: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .qty-btn:hover {
          background: #1b4332;
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-label {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: #2d6a4f;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid #cccccc;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          border-color: #52b788;
          box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.25);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .pay-card {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 700;
          font-size: 0.88rem;
          color: #2d6a4f;
          background: #fdfdfd;
        }

        .pay-card.selected {
          border-color: #52b788;
          background: rgba(82, 183, 136, 0.15);
          color: #1b4332;
        }

        .pay-card.full-width {
          grid-column: span 2;
        }

        .price-breakdown {
          background: #e8f5e9;
          border: 1px solid #52b788;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .row-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #1b4332;
          margin-bottom: 4px;
        }

        .row-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1b4332;
          border-top: 1.5px dashed #52b788;
          padding-top: 6px;
          margin-top: 6px;
        }

        .btn-confirm {
          width: 100%;
          background-color: #52b788;
          color: #081c15;
          padding: 12px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-confirm:hover {
          background-color: #74c69d;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
          transform: translateY(-2px);
        }

        .btn-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-banner {
          background: #ffe3e3;
          color: #d62828;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.88rem;
          margin-bottom: 12px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">⚡ Quick Buy Checkout</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="prod-summary">
            <img src={product?.image || product?.imageUrl || '/placeholder.png'} alt={product?.title} className="prod-img" />
            <div>
              <div style={{ fontWeight: 700, color: '#1b4332' }}>{product?.title}</div>
              <div style={{ color: '#2d6a4f', fontSize: '0.9rem', fontWeight: 600 }}>৳ {itemPrice}</div>
              <div className="qty-picker">
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Qty:</span>
                <button type="button" className="qty-btn" onClick={() => handleQuantityChange(-1)}>-</button>
                <span style={{ fontWeight: 700 }}>{quantity}</span>
                <button type="button" className="qty-btn" onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="017XXXXXXXX"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Location / Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="House, Road, City, District"
                value={shippingLocation}
                onChange={(e) => setShippingLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Payment Method</label>
              <div className="payment-grid">
                <div
                  className={`pay-card ${paymentMethod === 'bKash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('bKash')}
                >
                  🩷 bKash
                </div>
                <div
                  className={`pay-card ${paymentMethod === 'Nagad' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Nagad')}
                >
                  🧡 Nagad
                </div>
                <div
                  className={`pay-card ${paymentMethod === 'Upay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Upay')}
                >
                  💚 Upay
                </div>
                <div
                  className={`pay-card ${paymentMethod === 'Mastercard' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Mastercard')}
                >
                  💳 Mastercard
                </div>
                <div
                  className={`pay-card full-width ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                >
                  💵 Cash on Delivery
                </div>
              </div>
            </div>

            {['bKash', 'Nagad', 'Upay'].includes(paymentMethod) && (
              <div style={{ background: '#f0fff4', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #52b788' }}>
                <div className="form-group">
                  <label className="form-label">Your {paymentMethod} Account Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`01XXXXXXXXX`}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 9J8A7B6C5D"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'Mastercard' && (
              <div style={{ background: '#f0fff4', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #52b788' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="5412 7500 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">CVC</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="123"
                      maxLength="4"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="price-breakdown">
              <div className="row-item">
                <span>Subtotal ({quantity} item)</span>
                <span>৳ {subtotal}</span>
              </div>
              <div className="row-item">
                <span>Eco-Cart All-BD Flat Shipping</span>
                <span>৳ {shippingFee}</span>
              </div>
              <div className="row-total">
                <span>Total Amount</span>
                <span>৳ {totalAmount}</span>
              </div>
            </div>

            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Processing Order...' : 'Confirm Order 🛍️'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;