import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const InspectTrackModal = ({ order, onClose, onStepToggle }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [order]);

  if (!order) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const getPaymentLogo = (method, provider) => {
    const p = (provider || method || '').toLowerCase();
    if (p.includes('bkash')) return '/bKash.jpg';
    if (p.includes('nagad')) return '/Nagad.jpg';
    if (p.includes('upay')) return '/Upay.jpg';
    if (p.includes('mastercard')) return '/MasterCard.png';
    if (p.includes('cod') || p.includes('cash')) return '/Cash on Delivery.jpg';
    return '/Bank.png';
  };

  return ReactDOM.createPortal(
    (
      <>
        <style>{`
          .inspect-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.75) !important;
            backdrop-filter: blur(5px);
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 99999999 !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
            animation: ${isClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.25s ease-out'};
          }

          .inspect-card {
            background: #ffffff;
            width: 100%;
            max-width: 580px;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            box-sizing: border-box;
            border: 1px solid #e5e7eb;
            animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
            margin: auto;
          }

          .inspect-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1b4332;
            padding-bottom: 14px;
            margin-bottom: 16px;
          }

          .brand-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: #1b4332;
            margin: 0;
            font-family: inherit;
          }

          .inspect-badge {
            background: #e8f5e9;
            color: #2d6a4f;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.82rem;
            display: inline-block;
            border: 1px solid #b7e4c7;
            font-family: inherit;
          }

          .inspect-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 0.88rem;
            color: #4b5563;
            background: #ffffff;
            padding: 14px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            font-family: inherit;
          }

          .inspect-details-grid strong {
            color: #1b4332;
          }

          .inspect-table-container {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            font-family: inherit;
          }

          .inspect-table {
            width: 100%;
            border-collapse: collapse;
            font-family: inherit;
          }

          .inspect-table th, .inspect-table td {
            padding: 10px 14px;
            text-align: left;
            font-size: 0.88rem;
            font-family: inherit;
          }

          .inspect-table th {
            background: #1b4332;
            color: #ffffff;
            font-weight: 700;
            border-bottom: none;
          }

          .inspect-table tr:not(:last-child) td {
            border-bottom: 1px solid #f0f0f0;
          }

          .inspect-table td {
            color: #4b5563;
          }

          .inspect-summary {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            padding: 14px 18px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.95rem;
            font-weight: 700;
            color: #1b4332;
            font-family: inherit;
          }

          .payment-gateway-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 12px 14px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .btn-close-inspect {
            width: 100%;
            background: transparent;
            color: #d32f2f;
            border: 1.5px solid #fca5a5;
            padding: 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            margin-top: 16px;
          }

          .btn-close-inspect:hover {
            background-color: #d32f2f;
            color: #ffffff;
            border-color: #d32f2f;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(211, 47, 47, 0.25);
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

        <div className="inspect-overlay" onClick={handleClose}>
          <div className="inspect-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="inspect-header">
              <div>
                <h2 className="brand-title">Official Consignment Manifest</h2>
                <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px', fontWeight: '600' }}>
                  Consignment Reference: #{order.orderNumber}
                </div>
              </div>
              <div>
                <div className="inspect-badge">Status: {order.orderStatus}</div>
              </div>
            </div>

            {/* Buyer & Seller Info Grid */}
            <div className="inspect-details-grid">
              <div>
                <strong>Buyer Credentials:</strong><br />
                Name: {order.buyer?.name}<br />
                Email: {order.buyer?.email}<br />
                Phone: {order.buyer?.phone}<br />
                Destination: {order.buyer?.location}
              </div>
              <div>
                <strong>Seller Partner Details:</strong><br />
                Name: {order.seller?.name}<br />
                Email: {order.seller?.email}<br />
                Phone: {order.seller?.phone}<br />
                Origin Hub: {order.seller?.location}
              </div>
            </div>

            {/* Purchased Products Breakdown Table */}
            <div className="inspect-table-container">
              <table className="inspect-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#1b4332' }}>{item.title}</td>
                      <td>৳{item.price}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 600, color: '#1b4332' }}>৳{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Settlement Amount */}
            <div className="inspect-summary">
              <span>Total Settlement (incl. shipping ৳70):</span>
              <span style={{ fontSize: '1.2rem', color: '#2d6a4f' }}>৳{order.totalAmount}</span>
            </div>

            {/* Payment Details with Official Logo */}
            <div className="payment-gateway-box">
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800' }}>
                  Payment Gateway Method
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1b4332', marginTop: '2px' }}>
                  {order.paymentDetails?.provider || order.paymentMethod}
                </div>
              </div>
              <img 
                src={getPaymentLogo(order.paymentMethod, order.paymentDetails?.provider)} 
                alt="" 
                style={{ height: '30px', objectFit: 'contain' }}
              />
            </div>

            {/* Freezable Interactive Logistics Checklist */}
            <div>
              <div style={{ fontWeight: '700', color: '#1b4332', fontSize: '0.95rem', marginBottom: '10px' }}>
                ☑️ Supply Chain Execution Milestones
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'collectedFromSeller', label: 'Consignment successfully collected from seller' },
                  { key: 'shipped', label: 'Consignment dispatched into line-haul transit' },
                  { key: 'reachedWarehouse', label: 'Consignment arrived at Eco-Cart main sorting warehouse' },
                  { key: 'reachedHub', label: "Consignment sorted and routed to destination delivery hub" },
                  { key: 'outForDelivery', label: 'Consignment assigned to field courier for final delivery' }
                ].map((step) => {
                  const isChecked = Boolean(order.logisticsSteps?.[step.key]);

                  return (
                    <label
                      key={step.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: isChecked ? '#e8f5e9' : '#ffffff',
                        border: isChecked ? '1.5px solid #2e7d32' : '1.5px solid #d1d5db',
                        cursor: isChecked ? 'not-allowed' : 'pointer',
                        fontWeight: '650',
                        fontSize: '0.88rem',
                        color: isChecked ? '#1b4332' : '#374151',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isChecked}
                        onChange={() => onStepToggle(order._id, step.key, isChecked)}
                        style={{ width: '18px', height: '18px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>{step.label}</span>
                      {isChecked && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#2e7d32' }}>[Verified ✓]</span>}
                    </label>
                  );
                })}

                <hr style={{ border: 'none', borderTop: '1.5px dashed #e5e7eb', margin: '8px 0' }} />

                {/* Success: Product Delivered */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: order.logisticsSteps?.delivered ? '#e8f5e9' : '#ffffff',
                    border: '1.5px solid #2e7d32',
                    cursor: (order.logisticsSteps?.delivered || order.logisticsSteps?.failed) ? 'not-allowed' : 'pointer',
                    fontWeight: '750',
                    fontSize: '0.9rem',
                    color: '#2e7d32',
                    opacity: order.logisticsSteps?.failed ? 0.4 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(order.logisticsSteps?.delivered)}
                    disabled={Boolean(order.logisticsSteps?.delivered || order.logisticsSteps?.failed)}
                    onChange={() => onStepToggle(order._id, 'delivered', order.logisticsSteps?.delivered)}
                    style={{ width: '20px', height: '20px', accentColor: '#2e7d32', cursor: 'pointer' }}
                  />
                  <span>Fulfillment Status : Consignment Successfully Delivered</span>
                </label>

                {/* Failure: Product Not Delivered / Cancelled */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: order.logisticsSteps?.failed ? '#ffebee' : '#ffffff',
                    border: '1.5px solid #c62828',
                    cursor: (order.logisticsSteps?.delivered || order.logisticsSteps?.failed) ? 'not-allowed' : 'pointer',
                    fontWeight: '750',
                    fontSize: '0.9rem',
                    color: '#c62828',
                    opacity: order.logisticsSteps?.delivered ? 0.4 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(order.logisticsSteps?.failed)}
                    disabled={Boolean(order.logisticsSteps?.delivered || order.logisticsSteps?.failed)}
                    onChange={() => onStepToggle(order._id, 'failed', order.logisticsSteps?.failed)}
                    style={{ width: '20px', height: '20px', accentColor: '#c62828', cursor: 'pointer' }}
                  />
                  <span>Fulfillment Exception : Delivery Failed / Cancelled by {order.buyer?.name}</span>
                </label>
              </div>
            </div>

            <button type="button" className="btn-close-inspect" onClick={handleClose}>
              Close Manifest
            </button>
          </div>
        </div>
      </>
    ),
    document.body
  );
};

export default InspectTrackModal;