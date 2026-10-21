import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const InvoiceModal = ({ order, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  if (!order) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleDownloadJPEG = async () => {
    if (!invoiceRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // High resolution image capture
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imageURL = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `Invoice-${order.orderNumber || 'EcoCart'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating image invoice:', err);
      alert('Failed to generate image invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        .invoice-overlay {
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
          z-index: 3000;
          animation: ${isClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.25s ease-out'};
        }

        .invoice-card {
          background: #ffffff;
          width: 90%;
          max-width: 580px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid #e5e7eb;
          animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
          box-sizing: border-box;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #1b4332;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }

        .brand-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1b4332;
          margin: 0;
          font-family: inherit;
        }

        .invoice-badge {
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

        .invoice-details-grid {
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

        .invoice-details-grid strong {
          color: #1b4332;
        }

        .invoice-table-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          font-family: inherit;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          font-family: inherit;
        }

        .invoice-table th, .invoice-table td {
          padding: 10px 14px;
          text-align: left;
          font-size: 0.88rem;
          font-family: inherit;
        }

        .invoice-table th {
          background: #1b4332;
          color: #ffffff;
          font-weight: 700;
          border-bottom: none;
        }

        .invoice-table tr:not(:last-child) td {
          border-bottom: 1px solid #f0f0f0;
        }

        .invoice-table td {
          color: #4b5563;
        }

        .invoice-summary {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 16px 18px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
          color: #4b5563;
          font-weight: 600;
          font-family: inherit;
        }

        .invoice-summary-row {
          display: flex;
          justify-content: space-between;
          font-family: inherit;
        }

        .invoice-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.15rem;
          font-weight: 700;
          color: #1b4332;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
          margin-top: 4px;
          font-family: inherit;
          letter-spacing: -0.2px;
        }

        .invoice-actions {
          display: flex;
          gap: 10px;
          font-family: inherit;
        }

        .btn-print {
          flex: 1;
          background: transparent;
          color: #2d6a4f;
          border: 1.5px solid #2d6a4f;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
        }

        .btn-print:hover {
          background-color: #2d6a4f;
          color: #ffffff;
          border-color: #2d6a4f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
        }

        .btn-close-inv {
          flex: 1;
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
        }

        .btn-close-inv:hover {
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

      <div className="invoice-overlay" onClick={handleClose}>
        <div className="invoice-card" onClick={(e) => e.stopPropagation()}>
          {/* Capture Area for Image Rendering */}
          <div ref={invoiceRef} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px' }}>
            <div className="invoice-header">
              <div>
                <h2 className="brand-title">Eco-Cart 🛍️</h2>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>Official Invoice</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="invoice-badge">Order ID: {order.orderNumber}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="invoice-details-grid">
              <div>
                <strong>Billed To:</strong><br />
                {order.buyer?.name || order.shippingAddress?.fullName || 'Valued Customer'}<br />
                Phone: {order.buyer?.phone || order.shippingAddress?.phone || 'N/A'}<br />
                Address: {order.buyer?.location || order.shippingAddress?.location || 'N/A'}
              </div>
              <div>
                <strong>Seller Info:</strong><br />
                {order.seller?.name || order.sellerName || 'Eco-Cart Official'}<br />
                Phone: {order.seller?.phone || order.sellerPhone || '+880 1912-915937'}<br />
                Payment: <strong>{order.paymentDetails?.provider || order.paymentMethod || 'COD'}</strong>
              </div>
            </div>

            <div className="invoice-table-container">
              <table className="invoice-table">
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
                      <td style={{ fontWeight: 600, color: '#1b4332' }}>{item.title || item.product?.title || 'Product'}</td>
                      <td>৳ {Number(item.price || 0).toFixed(2)}</td>
                      <td>{item.quantity || 1}</td>
                      <td style={{ fontWeight: 600, color: '#1b4332' }}>৳ {Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-summary">
              <div className="invoice-summary-row">
                <span>Subtotal:</span>
                <span>৳ {Number(order.subtotal || order.totalAmount - (order.shippingFee || 70)).toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row">
                <span>Eco-Cart Flat Shipping Fee (All Over BD):</span>
                <span>৳ {Number(order.shippingFee || 70).toFixed(2)}</span>
              </div>
              <div className="invoice-total">
                <span>Grand Total:</span>
                <span>৳ {Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="invoice-actions" style={{ marginTop: '16px' }}>
            <button type="button" className="btn-print" onClick={handleDownloadJPEG} disabled={isDownloading}>
              {isDownloading ? 'Generating Image...' : 'Download Invoice'}
            </button>
            <button type="button" className="btn-close-inv" onClick={handleClose}>
              Close Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceModal;