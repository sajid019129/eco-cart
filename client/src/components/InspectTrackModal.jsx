import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const InspectTrackModal = ({ order: initialOrder, onClose, onUpdateOrder }) => {
  const [order, setOrder] = useState(initialOrder);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

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

  const buyerName = order.buyer?.name || order.shippingAddress?.fullName || 'Customer';
  const steps = order.logisticsSteps || {};
  const isDeliveredChecked = Boolean(steps.delivered);
  const isFailedChecked = Boolean(steps.failed);

  // Check if all 5 main supply chain milestones are completed
  const areAllMilestonesCompleted = 
    Boolean(steps.collectedFromSeller) &&
    Boolean(steps.shipped) &&
    Boolean(steps.reachedWarehouse) &&
    Boolean(steps.reachedHub) &&
    Boolean(steps.outForDelivery);

  // Strict sequential dependency rule for milestones & final actions
  const isStepAccessible = (stepKey) => {
    if (steps[stepKey]) return true; // Already checked
    if (isDeliveredChecked || isFailedChecked) return false; // Locked if final decision reached

    if (stepKey === 'collectedFromSeller') return true;
    if (stepKey === 'shipped') return Boolean(steps.collectedFromSeller);
    if (stepKey === 'reachedWarehouse') return Boolean(steps.shipped);
    if (stepKey === 'reachedHub') return Boolean(steps.reachedWarehouse);
    if (stepKey === 'outForDelivery') return Boolean(steps.reachedHub);
    
    // Final two options require ALL 5 supply chain steps to be ticked first
    if (stepKey === 'delivered' || stepKey === 'failed') {
      return areAllMilestonesCompleted;
    }
    return false;
  };

  const handleStepToggle = async (stepKey, currentVal) => {
    if (currentVal) return;
    
    if (!isStepAccessible(stepKey)) {
      if (stepKey === 'delivered' || stepKey === 'failed') {
        alert('You must complete and verify all 5 preceding supply chain milestones before selecting final fulfillment status!');
      } else {
        alert('You must complete the previous supply chain milestones in sequential order first!');
      }
      return;
    }

    if (stepKey === 'delivered' && isFailedChecked) return;
    if (stepKey === 'failed' && isDeliveredChecked) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/orders/logistics/${order._id}`, {
        logisticsSteps: { [stepKey]: true }
      });
      
      const updatedOrder = res.data.order;
      setOrder(updatedOrder);
      if (onUpdateOrder) {
        onUpdateOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Error updating logistics steps:', err);
      alert(err.response?.data?.error || 'Failed to update logistics steps.');
    }
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
            max-width: 620px;
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

          .smallest-close-x {
            position: absolute;
            top: 10px;
            right: 12px;
            background: transparent;
            border: none;
            font-size: 1.15rem;
            font-weight: 800;
            color: #6b7280;
            cursor: pointer;
            padding: 2px;
            line-height: 1;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease;
          }

          .smallest-close-x:hover {
            color: #d32f2f;
            transform: scale(1.25);
          }

          .inspect-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1b4332;
            padding-bottom: 14px;
            margin-bottom: 16px;
            padding-right: 20px;
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
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 0.88rem;
            color: #374151;
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

          .milestone-field-box {
            position: relative;
            background: #ffffff;
            border: 1.5px solid #d1d5db;
            border-radius: 8px;
            padding: 10px 14px;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            display: flex;
            align-items: center;
            gap: 14px;
            cursor: pointer;
            font-weight: 650;
            font-size: 0.88rem;
            color: #374151;
          }

          .milestone-field-box:hover {
            border-color: #2d6a4f;
            background: #ffffff;
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 8px 24px rgba(45, 106, 79, 0.18);
          }

          .milestone-field-box input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #1b4332;
            cursor: pointer;
            pointer-events: auto;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s ease;
          }

          .milestone-field-box.is-checked {
            background: #e8f5e9;
            border-color: #2e7d32;
            color: #1b4332;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .milestone-field-box.is-failed {
            background: #ffebee;
            border-color: #c62828;
            color: #c62828;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .milestone-field-box.is-disabled {
            opacity: 0.45;
            cursor: not-allowed;
            pointer-events: none;
            background: #f3f4f6;
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
            <button 
              type="button" 
              className="smallest-close-x" 
              onClick={handleClose}
              title="Close"
            >
              ✕
            </button>

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

            <div className="inspect-details-grid">
              <div style={{ fontWeight: '600', lineHeight: '1.6' }}>
                <strong style={{ color: '#1b4332', fontSize: '0.92rem' }}>Buyer Credentials:</strong><br />
                <span>Name: {buyerName}</span><br />
                <span>Email Address: {order.buyer?.email || 'N/A'}</span><br />
                <span>Phone Number: {order.buyer?.phone || order.shippingAddress?.phone}</span><br />
                <span>Destination: {order.buyer?.location || order.shippingAddress?.location}</span>
              </div>
            </div>

            <div className="inspect-table-container">
              <table className="inspect-table">
                <thead>
                  <tr>
                    <th>Item Description & Seller</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => {
                    const sellerObj = item.seller || item.product?.seller || {};

                    const itemSellerName = 
                      sellerObj.name || 
                      sellerObj.fullName || 
                      item.sellerName || 
                      item.product?.sellerName || 
                      'Eco-Cart Official Partner';

                    const itemSellerEmail = 
                      sellerObj.email || 
                      item.sellerEmail || 
                      item.product?.sellerEmail || 
                      'support@ecocart.com';

                    const itemSellerPhone = 
                      sellerObj.phone || 
                      item.phoneNumber || 
                      item.sellerPhone || 
                      item.product?.sellerPhone || 
                      '+880 1700-000000';

                    const itemSellerHub = 
                      sellerObj.location || 
                      sellerObj.address || 
                      item.sellerLocation || 
                      item.product?.location || 
                      'Eco-Cart Central Hub, Dhaka';

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#1b4332' }}>
                          {item.title || item.product?.title || 'Product'}
                          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginTop: '5px' }}>
                            <span>Seller:</span> {itemSellerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#374151', fontWeight: '600', marginTop: '2px' }}>
                            <span>Email Address:</span> {itemSellerEmail}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#374151', fontWeight: '600', marginTop: '2px' }}>
                            <span>Phone Number:</span> {itemSellerPhone}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#374151', fontWeight: '600', marginTop: '2px' }}>
                            <span>Origin Hub:</span> {itemSellerHub}
                          </div>
                        </td>
                        <td>৳{item.price || item.product?.price}</td>
                        <td>{item.quantity || 1}</td>
                        <td style={{ fontWeight: 600, color: '#1b4332' }}>
                          ৳{(item.price || item.product?.price || 0) * (item.quantity || 1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="inspect-summary">
              <span>Total Settlement (including shipping fee of ৳70):</span>
              <span style={{ fontSize: '1.2rem', color: '#2d6a4f' }}>৳{order.totalAmount}</span>
            </div>

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

            <div>
              <div style={{ fontWeight: '700', color: '#1b4332', fontSize: '0.95rem', marginBottom: '10px' }}>
                Supply Chain Execution Milestones <span style={{ color: '#d32f2f' }}>*</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'collectedFromSeller', label: 'Consignment successfully collected from seller(s)' },
                  { key: 'shipped', label: 'Consignment dispatched into line-haul transit' },
                  { key: 'reachedWarehouse', label: 'Consignment arrived at Eco-Cart main sorting warehouse' },
                  { key: 'reachedHub', label: "Consignment sorted and routed to destination delivery hub" },
                  { key: 'outForDelivery', label: 'Consignment assigned to field courier for final delivery' }
                ].map((step) => {
                  const isChecked = Boolean(steps[step.key]);
                  const accessible = isStepAccessible(step.key);

                  return (
                    <div
                      key={step.key}
                      className={`milestone-field-box ${isChecked ? 'is-checked' : ''} ${!accessible && !isChecked ? 'is-disabled' : ''}`}
                      onClick={() => accessible && !isChecked && handleStepToggle(step.key, isChecked)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isChecked || !accessible}
                        onChange={() => accessible && !isChecked && handleStepToggle(step.key, isChecked)}
                      />
                      <span>{step.label}</span>
                      {isChecked && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#2e7d32' }}>Verified</span>}
                    </div>
                  );
                })}

                <hr style={{ border: 'none', borderTop: '1.5px dashed #e5e7eb', margin: '8px 0' }} />

                {/* Fulfillment Status: Success */}
                {(() => {
                  const accessible = isStepAccessible('delivered');
                  return (
                    <div
                      className={`milestone-field-box ${isDeliveredChecked ? 'is-checked' : ''} ${isFailedChecked || !accessible ? 'is-disabled' : ''}`}
                      onClick={() => accessible && !isDeliveredChecked && !isFailedChecked && handleStepToggle('delivered', isDeliveredChecked)}
                    >
                      <input
                        type="checkbox"
                        checked={isDeliveredChecked}
                        disabled={isDeliveredChecked || isFailedChecked || !accessible}
                        onChange={() => accessible && !isDeliveredChecked && !isFailedChecked && handleStepToggle('delivered', isDeliveredChecked)}
                      />
                      <span style={{ fontWeight: '800', color: isFailedChecked || !accessible ? '#9ca3af' : '#2e7d32' }}>
                        Fulfillment Status : Consignment Successfully Delivered
                      </span>
                      {isDeliveredChecked && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#2e7d32' }}>Verified</span>}
                    </div>
                  );
                })()}

                {/* Fulfillment Exception: Failed / Cancelled */}
                {(() => {
                  const accessible = isStepAccessible('failed');
                  return (
                    <div
                      className={`milestone-field-box ${isFailedChecked ? 'is-failed' : ''} ${isDeliveredChecked || !accessible ? 'is-disabled' : ''}`}
                      onClick={() => accessible && !isFailedChecked && !isDeliveredChecked && handleStepToggle('failed', isFailedChecked)}
                    >
                      <input
                        type="checkbox"
                        checked={isFailedChecked}
                        disabled={isFailedChecked || isDeliveredChecked || !accessible}
                        onChange={() => accessible && !isFailedChecked && !isDeliveredChecked && handleStepToggle('failed', isFailedChecked)}
                      />
                      <span style={{ fontWeight: '800', color: isDeliveredChecked || !accessible ? '#9ca3af' : '#c62828' }}>
                        Fulfillment Exception : Delivery Failed / Cancelled by {buyerName}
                      </span>
                      {isFailedChecked && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#c62828' }}>Cancelled</span>}
                    </div>
                  );
                })()}
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