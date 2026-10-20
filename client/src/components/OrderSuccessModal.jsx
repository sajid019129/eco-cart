import React, { useState } from 'react';
import InvoiceModal from './InvoiceModal';

const OrderSuccessModal = ({ order, onClose, onViewTrack }) => {
  const [showInvoice, setShowInvoice] = useState(false);

  if (!order) return null;

  return (
    <>
      <style>{`
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2500;
          animation: fadeIn 0.3s ease-out;
        }

        .success-card {
          background: #ffffff;
          width: 92%;
          max-width: 480px;
          border-radius: 14px;
          padding: 32px 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
          position: relative;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          background: #d8f3dc;
          color: #2d6a4f;
          font-size: 2.2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          border: 2px solid #52b788;
        }

        .success-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #1b4332;
          margin-bottom: 6px;
        }

        .order-number-box {
          background: #f8f9fa;
          border: 1.5px dashed #52b788;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .order-num-label {
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 700;
          text-transform: uppercase;
        }

        .order-num-value {
          font-size: 1.25rem;
          font-weight: 900;
          color: #1b4332;
          letter-spacing: 0.5px;
        }

        .summary-box {
          text-align: left;
          background: #fdfdfd;
          border: 1px solid #e9ecef;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #2d6a4f;
          margin-bottom: 20px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-action-primary {
          background-color: #52b788;
          color: #081c15;
          padding: 12px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.98rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-primary:hover {
          background-color: #74c69d;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
          transform: translateY(-1px);
        }

        .btn-action-secondary {
          background-color: #1b4332;
          color: #ffffff;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.98rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-secondary:hover {
          background-color: #2d6a4f;
        }

        .btn-close-text {
          background: none;
          border: none;
          color: #6c757d;
          font-weight: 600;
          margin-top: 12px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-close-text:hover {
          color: #1b4332;
        }
      `}</style>

      <div className="success-overlay">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Order Placed Successfully!</h2>
          <p style={{ color: '#495057', fontSize: '0.92rem' }}>
            Thank you for shopping sustainably with Eco-Cart. Your order has been registered.
          </p>

          <div className="order-number-box">
            <div className="order-num-label">Your Unique Order Number</div>
            <div className="order-num-value">{order.orderNumber}</div>
          </div>

          <div className="summary-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Total Amount:</span>
              <strong>৳ {order.totalAmount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Payment Method:</span>
              <strong>{order.paymentDetails?.provider || order.paymentMethod}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status:</span>
              <strong style={{ color: '#2d6a4f' }}>{order.orderStatus}</strong>
            </div>
          </div>

          <div className="action-buttons">
            <button type="button" className="btn-action-primary" onClick={() => setShowInvoice(true)}>
              📄 View & Print Invoice / Cash Memo
            </button>
            <button type="button" className="btn-action-secondary" onClick={() => onViewTrack(order.orderNumber)}>
              🚚 Track This Order
            </button>
          </div>

          <button type="button" className="btn-close-text" onClick={onClose}>
            Back to Home
          </button>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </>
  );
};

export default OrderSuccessModal;