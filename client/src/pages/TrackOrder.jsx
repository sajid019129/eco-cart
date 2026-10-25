import React, { useState } from 'react';
import InvoiceModal from '../components/InvoiceModal';

const TRACKING_STEPS = [
  { key: 'collectedFromSeller', label: 'Package successfully collected from seller(s)' },
  { key: 'shipped', label: 'Package dispatched for transit' },
  { key: 'reachedWarehouse', label: 'Package arrived at Eco-Cart main sorting warehouse' },
  { key: 'reachedHub', label: 'Package sorted and routed to your local delivery hub' },
  { key: 'outForDelivery', label: 'Package out for final delivery to your address' },
  { key: 'delivered', label: 'Package Delivered Successfully' }
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
        throw new Error(data.error || 'Consignment manifest not found.');
      }

      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInput = () => {
    setOrderNumberInput('');
  };

  const formatManifestDate = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    const datePart = dateObj.toLocaleDateString();
    const timePart = dateObj.toLocaleTimeString();
    return `${datePart} at ${timePart}`;
  };

  const isStepCompleted = (orderObj, stepKey) => {
    if (!orderObj) return false;
    if (orderObj.logisticsSteps && orderObj.logisticsSteps[stepKey]) {
      return true;
    }
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
          max-width: 680px;
          margin: 30px auto;
          padding: 0 16px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .track-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 26px 30px;
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.08);
          border: 1px solid #e5e7eb;
          animation: fadeInCard 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .track-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0 0 4px 0;
          letter-spacing: 0.4px;
        }

        .track-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .eco-field-box {
          flex: 1;
          position: relative;
          background: #f9fafb;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          padding: 10px 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .track-input {
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

        .track-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .input-clear-x {
          background: transparent;
          border: none;
          font-size: 1.1rem;
          font-weight: 800;
          color: #6b7280;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
          margin-left: 8px;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease;
          flex-shrink: 0;
        }

        .input-clear-x:hover {
          color: #d32f2f;
          transform: scale(1.3);
        }

        .btn-track {
          background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.98rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(27, 67, 50, 0.2);
          letter-spacing: 0.4px;
          white-space: nowrap;
          height: fit-content;
        }

        .btn-track:hover {
          background: linear-gradient(135deg, #52b788 0%, #2d6a4f 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(45, 106, 79, 0.3);
        }

        .error-alert {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
          margin-bottom: 16px;
          border: 1px solid #fca5a5;
        }

        .order-result-box {
          background: #fdfdfd;
          border-radius: 12px;
          padding: 24px;
          border: 1.5px solid #e5e7eb;
          margin-top: 20px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.03);
          animation: slideDownBox 0.35s ease-out forwards;
        }

        .premium-vertical-timeline {
          margin-top: 24px;
          position: relative;
          padding-left: 48px;
        }

        .premium-vertical-timeline::before {
          content: '';
          position: absolute;
          left: 21px;
          top: 12px;
          bottom: 12px;
          width: 3.5px;
          background: #e5e7eb;
          border-radius: 4px;
        }

        .timeline-step-row {
          position: relative;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .timeline-step-row:last-child {
          margin-bottom: 0;
        }

        .timeline-step-icon {
          position: absolute;
          left: -48px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
          color: #9ca3af;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          z-index: 2;
        }

        .timeline-step-row.completed .timeline-step-icon {
          background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
          border-color: #2e7d32;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(46, 125, 50, 0.3);
          transform: scale(1.08);
        }

        .timeline-step-row.failed .timeline-step-icon {
          background: #c62828;
          border-color: #c62828;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(198, 40, 40, 0.3);
          transform: scale(1.08);
        }

        .timeline-step-card {
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          padding: 14px 18px;
          border-radius: 10px;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .timeline-step-row.completed .timeline-step-card {
          background: #e8f5e9;
          border-color: #2e7d32;
        }

        .timeline-step-row.failed .timeline-step-card {
          background: #ffebee;
          border-color: #c62828;
        }

        .timeline-step-title {
          font-size: 1.02rem;
          font-weight: 750;
          color: #4b5563;
        }

        .timeline-step-row.completed .timeline-step-title {
          color: #1b4332;
          font-weight: 850;
        }

        .timeline-step-row.failed .timeline-step-title {
          color: #c62828;
          font-weight: 850;
        }

        .invoice-btn-wrap {
          margin-top: 28px;
          text-align: right;
        }

        .btn-invoice {
          background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
          color: #ffffff;
          padding: 12px 26px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.98rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(27, 67, 50, 0.2);
          letter-spacing: 0.4px;
          display: inline-block;
        }

        .btn-invoice:hover {
          background: linear-gradient(135deg, #52b788 0%, #2d6a4f 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(45, 106, 79, 0.3);
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
          <h1 className="track-title">Track Consignment 🚚</h1>
          <p className="track-subtitle">Enter your Eco-Cart Consignment Reference</p>

          <form onSubmit={handleTrackSearch} className="search-box">
            <div className={`eco-field-box ${orderNumberInput ? 'has-value' : ''}`}>
              <input
                type="text"
                className="track-input"
                placeholder="e.g. ECO-012345-6789"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                required
              />
              {orderNumberInput && (
                <button
                  type="button"
                  className="input-clear-x"
                  onClick={handleClearInput}
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn-track" disabled={loading}>
              {loading ? 'Searching...' : '🚚 Track'}
            </button>
          </form>

          {error && <div className="error-alert">{error}</div>}

          {order && (
            <div className="order-result-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1b4332', fontSize: '1.25rem', fontWeight: '800' }}>Consignment Reference: #{order.orderNumber}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px', fontWeight: '650' }}>
                    Manifest Generated: {formatManifestDate(order.createdAt)}
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
                    {isCancelledOrFailed ? '✕ Consignment Cancelled' : (order.orderStatus || 'Order Placed')}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '1rem', color: '#1b4332', marginBottom: '20px', fontWeight: '750', background: '#eaf4ef', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #b7e4c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Settlement (including shipping fee of ৳70):</span>
                <span style={{ fontSize: '1.15rem', color: '#2d6a4f' }}>৳{order.totalAmount} ({order.paymentMethod})</span>
              </div>

              <div style={{ fontWeight: '800', color: '#1b4332', marginBottom: '4px', fontSize: '1.1rem' }}>
                Delivery Progress Journey <span style={{ color: '#2d6a4f' }}>✨</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#6b7280', fontStyle: 'italic', marginBottom: '16px', fontWeight: '650' }}>
                These steps are verified and updated by the Eco-Cart Delivery Team
              </div>

              <div className="premium-vertical-timeline">
                {TRACKING_STEPS.map((stepObj, index) => {
                  const isDeliveredStep = stepObj.key === 'delivered';
                  const isCompleted = isStepCompleted(order, stepObj.key) && (!isDeliveredStep || !isCancelledOrFailed);
                  const isFailedStep = isDeliveredStep && isCancelledOrFailed;

                  let rowClass = '';
                  let iconSymbol = index + 1;

                  if (isCompleted) {
                    rowClass = 'completed';
                    iconSymbol = '✓';
                  } else if (isFailedStep) {
                    rowClass = 'failed';
                    iconSymbol = '✕';
                  }

                  return (
                    <div key={index} className={`timeline-step-row ${rowClass}`}>
                      <div className="timeline-step-icon">
                        {iconSymbol}
                      </div>
                      <div className="timeline-step-card">
                        <div className="timeline-step-title">
                          {isFailedStep ? 'Package Delivery Failed / Cancelled' : stepObj.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="invoice-btn-wrap">
                <button type="button" className="btn-invoice" onClick={() => setShowInvoice(true)}>
                  📄 View Invoice
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