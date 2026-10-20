import React from 'react';

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
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
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
          animation: fadeIn 0.25s ease-out;
        }

        .invoice-card {
          background: #ffffff;
          width: 92%;
          max-width: 650px;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #1b4332;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .brand-title {
          font-size: 1.8rem;
          font-weight: 900;
          color: #1b4332;
          margin: 0;
        }

        .invoice-badge {
          background: #52b788;
          color: #081c15;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.85rem;
          display: inline-block;
          margin-top: 4px;
        }

        .invoice-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          font-size: 0.92rem;
          color: #2d6a4f;
          background: #f8f9fa;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .invoice-table th, .invoice-table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
          font-size: 0.92rem;
        }

        .invoice-table th {
          background: #1b4332;
          color: #ffffff;
          font-weight: 700;
        }

        .invoice-summary {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          margin-bottom: 24px;
          font-size: 0.95rem;
          color: #1b4332;
        }

        .invoice-total {
          font-size: 1.2rem;
          font-weight: 800;
          border-top: 2px solid #52b788;
          padding-top: 6px;
          margin-top: 4px;
          color: #1b4332;
        }

        .invoice-actions {
          display: flex;
          gap: 12px;
        }

        .btn-print {
          flex: 1;
          background-color: #52b788;
          color: #081c15;
          padding: 12px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .btn-print:hover {
          background-color: #74c69d;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
        }

        .btn-close-inv {
          flex: 1;
          background-color: #e9ecef;
          color: #495057;
          padding: 12px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close-inv:hover {
          background-color: #ced4da;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-card, .invoice-card * {
            visibility: visible;
          }
          .invoice-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            box-shadow: none;
            padding: 10px;
          }
          .invoice-actions {
            display: none;
          }
        }
      `}</style>

      <div className="invoice-overlay" onClick={onClose}>
        <div className="invoice-card" onClick={(e) => e.stopPropagation()}>
          <div className="invoice-header">
            <div>
              <h2 className="brand-title">Eco-Cart 🛍️</h2>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Official Cash Memo & Invoice</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="invoice-badge">Order ID: {order.orderNumber}</div>
              <div style={{ fontSize: '0.82rem', color: '#6c757d', marginTop: '4px' }}>
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="invoice-details-grid">
            <div>
              <strong>Billed To:</strong><br />
              {order.buyer?.name}<br />
              Phone: {order.buyer?.phone}<br />
              Address: {order.buyer?.location}
            </div>
            <div>
              <strong>Seller Info:</strong><br />
              {order.seller?.name}<br />
              Phone: {order.seller?.phone}<br />
              Payment Method: <strong>{order.paymentMethod}</strong>
              {order.paymentMethod === 'Digital' && ` (${order.paymentDetails?.provider})`}
            </div>
          </div>

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
                  <td>{item.title}</td>
                  <td>৳ {item.price}</td>
                  <td>{item.quantity}</td>
                  <td>৳ {item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-summary">
            <div>Subtotal: ৳ {order.subtotal}</div>
            <div>Eco-Cart Flat Shipping (All-BD): ৳ {order.shippingFee || 70}</div>
            <div className="invoice-total">Grand Total: ৳ {order.totalAmount}</div>
          </div>

          <div className="invoice-actions">
            <button type="button" className="btn-print" onClick={handlePrint}>
              🖨️ Print / Download Memo
            </button>
            <button type="button" className="btn-close-inv" onClick={onClose}>
              Close Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceModal;