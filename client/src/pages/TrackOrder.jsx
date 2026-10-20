import React, { useState } from 'react';
import InvoiceModal from '../components/InvoiceModal';

const TRACKING_STEPS = [
  'Order Placed',
  'Seller Started Packing',
  'Product Packed',
  'Handed to Logistics',
  'Arrived at Facility',
  'Out for Delivery',
  'Delivered'
];

const TrackOrder = () => {
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`http://localhost:5000/api/orders/track/${encodeURIComponent(orderNumberInput.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order not found.');
      }

      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status) => {
    const idx = TRACKING_STEPS.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <>
      <style>{`
        .track-page {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .track-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
        }

        .track-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1b4332;
          margin-bottom: 8px;
          text-align: center;
        }

        .track-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 24px;
          font-weight: 400;
        }

        .search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }

        .track-input {
          flex: 1;
          padding: 12px 16px;
          border: 1.5px solid #ced4da;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .track-input:focus {
          border-color: #52b788;
          box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.25);
        }

        .btn-track {
          background-color: #2d6a4f;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-track:hover {
          background-color: #1b4332;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);
        }

        .error-alert {
          background: #ffe3e3;
          color: #d62828;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .order-result-box {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 24px;
          border: 1px solid #dee2e6;
          margin-top: 20px;
        }

        .timeline {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }

        .timeline-step {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
          z-index: 2;
          transition: all 0.3s;
        }

        .timeline-step.completed .step-icon {
          background: #52b788;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(82, 183, 136, 0.5);
        }

        .timeline-step.active .step-icon {
          background: #1b4332;
          color: #ffffff;
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(27, 67, 50, 0.6);
        }

        .step-label {
          font-weight: 600;
          color: #6c757d;
          font-size: 0.95rem;
        }

        .timeline-step.completed .step-label,
        .timeline-step.active .step-label {
          color: #1b4332;
          font-weight: 700;
        }

        .invoice-btn-wrap {
          margin-top: 24px;
          text-align: right;
        }

        .btn-invoice {
          background: #1b4332;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-invoice:hover {
          background: #2d6a4f;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(27, 67, 50, 0.3);
        }
      `}</style>

      <div className="track-page">
        <div className="track-card">
          <h1 className="track-title">📦 Track Your Order</h1>
          <p className="track-subtitle">Enter your Eco-Cart Order Number to view real-time shipping status and cash memo</p>

          <form onSubmit={handleTrackSearch} className="search-box">
            <input
              type="text"
              className="track-input"
              placeholder="e.g. ECO-123456-7890"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              required
            />
            <button type="submit" className="btn-track" disabled={loading}>
              {loading ? 'Searching...' : 'Track 🔍'}
            </button>
          </form>

          {error && <div className="error-alert">{error}</div>}

          {order && (
            <div className="order-result-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1b4332' }}>Order: {order.orderNumber}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '2px' }}>
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#e8f5e9', color: '#2d6a4f', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #52b788' }}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.92rem', color: '#2d6a4f', marginBottom: '16px' }}>
                <strong>Total Amount:</strong> ৳ {order.totalAmount} ({order.paymentMethod})
              </div>

              <div style={{ fontWeight: 'bold', color: '#1b4332', marginBottom: '12px' }}>Fulfillment Progress:</div>
              <div className="timeline">
                {TRACKING_STEPS.map((step, index) => {
                  const currentIndex = getCurrentStepIndex(order.orderStatus);
                  const isCompleted = index < currentIndex;
                  const isActive = index === currentIndex;

                  return (
                    <div key={index} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="step-icon">
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="step-label">{step}</div>
                    </div>
                  );
                })}
              </div>

              <div className="invoice-btn-wrap">
                <button type="button" className="btn-invoice" onClick={() => setShowInvoice(true)}>
                  📄 View Cash Memo Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </>
  );
};

export default TrackOrder;