import React, { useState } from 'react';
import InvoiceModal from '../components/InvoiceModal';

const TRACKING_BOXES = [
  { key: 'collectedFromSeller', label: 'Product collected from seller' },
  { key: 'shipped', label: 'Product shipped' },
  { key: 'reachedWarehouse', label: 'Product reached Eco-Cart warehouse' },
  { key: 'reachedHub', label: "Product sent to your area's nearby Eco-Cart delivery hub" },
  { key: 'outForDelivery', label: 'Product out for delivery' },
  { key: 'delivered', label: 'Product delivered successfully' }
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

  const isStepCompleted = (orderObj, stepKey) => {
    if (!orderObj) return false;
    if (orderObj.logisticsSteps && orderObj.logisticsSteps[stepKey]) {
      return true;
    }
    // Fallback checks on milestones or status strings
    const milestones = orderObj.completedMilestones || [];
    if (stepKey === 'delivered' && (orderObj.orderStatus === 'Delivered' || milestones.some(m => m.toLowerCase().includes('delivered')))) {
      return true;
    }
    if (stepKey === 'shipped' && (orderObj.orderStatus === 'Shipped' || milestones.some(m => m.toLowerCase().includes('shipped')))) {
      return true;
    }
    if (stepKey === 'outForDelivery' && (orderObj.orderStatus === 'Out for Delivery' || milestones.some(m => m.toLowerCase().includes('out for delivery')))) {
      return true;
    }
    return milestones.some(m => m.toLowerCase().includes(stepKey.toLowerCase()));
  };

  const isCancelledOrFailed = order?.logisticsSteps?.failed || order?.orderStatus === 'Cancelled' || order?.isCancelled;

  return (
    <>
      <style>{`
        .track-page {
          max-width: 820px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .track-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 34px 38px;
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.08);
          border: 1px solid #e5e7eb;
          animation: fadeInCard 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .track-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0 0 6px 0;
          letter-spacing: 0.5px;
        }

        .track-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          margin-bottom: 24px;
          font-weight: 400;
        }

        .search-box {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .track-input {
          flex: 1;
          padding: 13px 18px;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.98rem;
          outline: none;
          font-weight: 600;
          color: #1f2937;
          background: #f9fafb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }

        .track-input:focus {
          border-color: #2d6a4f;
          background: #ffffff;
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.12);
        }

        .btn-track {
          background-color: #2d6a4f;
          color: #ffffff;
          padding: 13px 26px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.98rem;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(45, 106, 79, 0.2);
          white-space: nowrap;
        }

        .btn-track:hover {
          background-color: #1b4332;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.3);
        }

        .error-alert {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
          margin-bottom: 20px;
          border: 1px solid #fca5a5;
        }

        .order-result-box {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 26px;
          border: 1px solid #e5e7eb;
          margin-top: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          animation: slideDownBox 0.3s ease-out forwards;
        }

        .boxes-grid {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tracking-status-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          border-radius: 10px;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }

        .tracking-status-box:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 6px 18px rgba(45, 106, 79, 0.1);
          border-color: #52b788;
        }

        .tracking-status-box.completed {
          background: #e8f5e9;
          border-color: #2e7d32;
          box-shadow: 0 4px 14px rgba(46, 125, 50, 0.12);
        }

        .box-icon-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f3f5;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
          flex-shrink: 0;
          border: 1px solid #d1d5db;
          transition: all 0.2s ease;
        }

        .tracking-status-box.completed .box-icon-indicator {
          background: #2e7d32;
          color: #ffffff;
          border-color: #2e7d32;
          box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
        }

        .box-label-text {
          font-weight: 650;
          color: #4b5563;
          font-size: 0.96rem;
        }

        .tracking-status-box.completed .box-label-text {
          color: #1b4332;
          font-weight: 800;
        }

        .invoice-btn-wrap {
          margin-top: 24px;
          text-align: right;
        }

        .btn-invoice {
          background: #1b4332;
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(27, 67, 50, 0.2);
        }

        .btn-invoice:hover {
          background: #2d6a4f;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 106, 79, 0.3);
        }

        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDownBox {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="track-page">
        <div className="track-card">
          <h1 className="track-title">Track Your Order 🚚</h1>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1b4332', fontSize: '1.25rem', fontWeight: '800' }}>Order: #{order.orderNumber}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '3px', fontWeight: '600' }}>
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ 
                    backgroundColor: isCancelledOrFailed ? '#ffebee' : '#e8f5e9', 
                    color: isCancelledOrFailed ? '#c62828' : '#2d6a4f', 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontWeight: '800', 
                    fontSize: '0.9rem', 
                    border: `1.5px solid ${isCancelledOrFailed ? '#fca5a5' : '#52b788'}`,
                    display: 'inline-block',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}>
                    {isCancelledOrFailed ? '✕ Cancelled / Failed' : (order.orderStatus || 'Order Placed')}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.95rem', color: '#1b4332', marginBottom: '18px', fontWeight: '700', background: '#eaf4ef', padding: '10px 14px', borderRadius: '8px', border: '1px solid #b7e4c7' }}>
                <strong>Total Amount:</strong> ৳ {order.totalAmount} ({order.paymentMethod})
              </div>

              <div style={{ fontWeight: '800', color: '#1b4332', marginBottom: '12px', fontSize: '1.05rem' }}>
                Fulfillment Progress Status Boxes:
              </div>

              <div className="boxes-grid">
                {TRACKING_BOXES.map((stepObj, index) => {
                  const isCompleted = isStepCompleted(order, stepObj.key) && !isCancelledOrFailed;

                  return (
                    <div key={index} className={`tracking-status-box ${isCompleted ? 'completed' : ''}`}>
                      <div className="box-icon-indicator">
                        {isCompleted ? '✓' : '•'}
                      </div>
                      <div className="box-label-text">{stepObj.label}</div>
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