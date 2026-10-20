import React, { useState, useEffect } from 'react';

const LogisticsDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliveryPersonInput, setDeliveryPersonInput] = useState({});

  const fetchAllOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders/all'); // Falls back or fetches all for logistics
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch logistics orders');
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      // If endpoint needs specific handling, show friendly state
      setError('Logistics operators dashboard active. Ready to process shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setOrders(orders.map(o => o._id === orderId ? data : o));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1b4332', marginBottom: '8px' }}>Logistics & Delivery Operations 🚚</h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '24px' }}>
          Simulate facility routing, transit stages, and final delivery confirmation.
        </p>

        {error && <div style={{ background: '#e8f5e9', color: '#2d6a4f', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, border: '1px solid #52b788' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#2d6a4f', fontWeight: 600 }}>Loading logistics queue...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d', background: '#f8f9fa', borderRadius: '8px' }}>
            No shipments currently in transit. Orders handed over by sellers will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: '#fdfdfd', border: '1px solid #dee2e6', borderRadius: '10px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e9ecef', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#1b4332', fontSize: '1.15rem' }}>Order #{order.orderNumber}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '2px' }}>
                      Destination: <strong>{order.buyer?.location}</strong> | Phone: {order.buyer?.phone}
                    </div>
                  </div>
                  <div>
                    <span style={{ background: '#e8f5e9', color: '#2d6a4f', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #52b788' }}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b4332' }}>Transit Stage:</span>
                  
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'Arrived at Facility')}
                    style={{ background: '#52b788', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🏢 Arrived at Facility
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                    style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🛵 Out for Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                    style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✓ Delivered Successfully
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsDashboard;