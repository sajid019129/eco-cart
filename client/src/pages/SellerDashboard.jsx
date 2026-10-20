import React, { useState, useEffect } from 'react';

const SellerDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSellerOrders = async () => {
    if (!user) return;
    try {
      const userId = user._id || user.id;
      const res = await fetch(`http://localhost:5000/api/orders/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      // Refresh orders list
      setOrders(orders.map(o => o._id === orderId ? data : o));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Segoe UI' }}>
        <h2>Please log in as a seller to access the Dashboard.</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1b4332', marginBottom: '8px' }}>Seller Order Processing 📦</h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '24px' }}>
          Manage incoming customer orders, update packing statuses, and hand shipments over to logistics.
        </p>

        {error && <div style={{ background: '#ffe3e3', color: '#d62828', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#2d6a4f', fontWeight: 600 }}>Loading incoming orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d', background: '#f8f9fa', borderRadius: '8px' }}>
            No incoming orders found for your seller account yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: '#fdfdfd', border: '1px solid #dee2e6', borderRadius: '10px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e9ecef', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#1b4332', fontSize: '1.15rem' }}>Order #{order.orderNumber}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '2px' }}>
                      Buyer: <strong>{order.buyer?.name}</strong> ({order.buyer?.phone}) | Address: {order.buyer?.location}
                    </div>
                  </div>
                  <div>
                    <span style={{ background: '#e8f5e9', color: '#2d6a4f', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #52b788' }}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '14px', fontSize: '0.9rem', color: '#2d6a4f' }}>
                  <strong>Products:</strong>
                  <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                    {order.items?.map((it, idx) => (
                      <li key={idx}>{it.title} — Qty: {it.quantity} — ৳ {it.price * it.quantity}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '6px', fontWeight: 'bold', color: '#1b4332' }}>
                    Total: ৳ {order.totalAmount} ({order.paymentMethod})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b4332' }}>Update Fulfillment:</span>
                  
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'Seller Started Packing')}
                    style={{ background: order.orderStatus === 'Seller Started Packing' ? '#1b4332' : '#52b788', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📦 Start Packing
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'Product Packed')}
                    style={{ background: order.orderStatus === 'Product Packed' ? '#1b4332' : '#52b788', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🏷️ Mark Packed
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'Handed to Logistics')}
                    style={{ background: order.orderStatus === 'Handed to Logistics' ? '#1b4332' : '#2d6a4f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🚚 Hand to Logistics
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

export default SellerDashboard;