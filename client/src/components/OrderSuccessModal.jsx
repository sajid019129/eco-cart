import React, { useState } from 'react';
import InvoiceModal from './InvoiceModal';

const OrderSuccessModal = ({ order, onClose, onViewTrack, onBackToHome }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  if (!order) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onBackToHome) {
        onBackToHome();
      } else {
        onClose();
      }
    }, 250);
  };

  const handleInvoiceClick = () => {
    setShowInvoice(true);
  };

  const handleTrackClick = () => {
    if (onViewTrack) {
      onViewTrack(order.orderNumber);
    }
  };

  return (
    <>
      <style>{`
        .success-overlay {
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
          z-index: 2500;
          animation: ${isClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.25s ease-out'};
        }

        .success-card {
          background: #ffffff;
          width: 90%;
          max-width: 480px;
          border-radius: 12px;
          padding: 20px 22px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          border: 1px solid #e5e7eb;
          animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
          box-sizing: border-box;
          text-align: center;
        }

        .success-icon-badge {
          width: 48px;
          height: 48px;
          background: #e8f5e9;
          color: #2d6a4f;
          font-size: 1.6rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px auto;
          border: 2px solid #52b788;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.2);
        }

        .success-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0 0 2px 0;
        }

        .success-subtitle {
          color: #4b5563;
          font-size: 0.85rem;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .order-number-card {
          background: #f8f9fa;
          border: 1.5px dashed #52b788;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }

        .order-num-label {
          font-size: 0.72rem;
          color: #6b7280;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .order-num-value {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1b4332;
          letter-spacing: 0.8px;
        }

        .details-box {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          text-align: left;
        }

        .details-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 0.88rem;
          color: #4b5563;
        }

        .details-row:not(:last-child) {
          border-bottom: 1px dashed #f0f0f0;
        }

        .details-row span {
          font-weight: 600;
          font-size: 0.88rem;
        }

        .details-row strong {
          color: #1b4332;
          font-weight: 700;
          font-size: 0.88rem;
        }

        .status-tag {
          color: #2d6a4f;
          background: #e8f5e9;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          border: 1px solid #b7e4c7;
        }

        .action-button-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-view-invoice {
          width: 100%;
          background: transparent;
          color: #1b4332;
          border: 1.5px solid #1b4332;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-view-invoice:hover {
          background-color: #2d6a4f;
          color: #ffffff;
          border-color: #2d6a4f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
        }

        .btn-track-order {
          width: 100%;
          background: transparent;
          color: #1b4332;
          border: 1.5px solid #1b4332;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-track-order:hover {
          background-color: #2d6a4f;
          color: #ffffff;
          border-color: #2d6a4f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
        }

        .btn-back-home {
          background: transparent;
          border: none;
          color: #6b7280;
          font-weight: 700;
          font-size: 0.95rem;
          margin-top: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .btn-back-home:hover {
          color: #d32f2f;
          transform: scale(1.03);
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

      <div className="success-overlay" onClick={handleClose}>
        <div className="success-card" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon-badge">✓</div>
          
          <h3 className="success-title">Order Placed Successfully!</h3>
          <div className="success-subtitle">
            Your order has been placed successfully.<br />
            Thank you for shopping sustainably with Eco-Cart!
          </div>

          <div className="order-number-card">
            <div className="order-num-label">Your Order Number</div>
            <div className="order-num-value">{order.orderNumber}</div>
          </div>

          <div className="details-box">
            <div className="details-row">
              <span>Total Amount:</span>
              <strong>৳ {Number(order.totalAmount || 0).toFixed(2)}</strong>
            </div>
            <div className="details-row">
              <span>Payment Method:</span>
              <strong>{order.paymentDetails?.provider || order.paymentMethod || 'Cash on Delivery'}</strong>
            </div>
            <div className="details-row">
              <span>Status:</span>
              <span className="status-tag">{order.orderStatus || 'Order Placed'}</span>
            </div>
          </div>

          <div className="action-button-stack">
            <button type="button" className="btn-view-invoice" onClick={handleInvoiceClick}>
              📄 View Invoice
            </button>
            <button type="button" className="btn-track-order" onClick={handleTrackClick}>
              🚚 Track This Order
            </button>
          </div>

          <button type="button" className="btn-back-home" onClick={handleClose}>
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