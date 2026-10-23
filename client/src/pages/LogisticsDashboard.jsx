import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LogisticsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/all');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStepToggle = async (orderId, stepName, currentVal) => {
    // Once checked, step is freezed up and cannot be un-checked
    if (currentVal) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/logistics`, {
        step: stepName,
        value: true
      });
      
      const updatedOrder = res.data.order;
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Error updating logistics step:', err);
      alert(err.response?.data?.error || 'Failed to update logistics step.');
    }
  };

  const getPaymentLogo = (method, provider) => {
    const p = (provider || method || '').toLowerCase();
    if (p.includes('bkash')) return '/bKash.png';
    if (p.includes('nagad')) return '/Nagad.png';
    if (p.includes('upay')) return '/Upay.png';
    if (p.includes('mastercard')) return '/MasterCard.png';
    if (p.includes('cod') || p.includes('cash')) return '/Cash on Delivery.png';
    return '/Bank.png';
  };

  return (
    <div style={{
      backgroundColor: '#f4f7f5',
      minHeight: '100vh',
      padding: '30px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: '#1b4332',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px 30px',
          marginBottom: '30px',
          boxShadow: '0 8px 24px rgba(27, 67, 50, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
              🚚 Logistics & Delivery Portal
            </h1>
            <p style={{ margin: '6px 0 0 0', color: '#b7e4c7', fontSize: '0.98rem' }}>
              Eco-Cart Delivery Management System
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '8px 18px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            Total Active Orders: {orders.length}
          </div>
        </div>

        {/* Order Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.1rem', color: '#2d6a4f' }}>
            Loading order records... 🚚
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '50px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            color: '#6b7280'
          }}>
            <h3>No orders available at the moment.</h3>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {orders.map((order) => {
              const isDelivered = order.logisticsSteps?.delivered || order.orderStatus === 'Delivered';
              const isFailed = order.logisticsSteps?.failed || order.orderStatus === 'Cancelled';

              return (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '22px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    border: isDelivered 
                      ? '2px solid #52b788' 
                      : isFailed 
                      ? '2px solid #e63946' 
                      : '1.5px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{
                      fontWeight: '800',
                      fontSize: '1.05rem',
                      color: '#1b4332',
                      backgroundColor: '#e8f5e9',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      #{order.orderNumber}
                    </span>
                    
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: isDelivered ? '#2d6a4f' : isFailed ? '#d32f2f' : '#fef3c7',
                      color: isDelivered || isFailed ? '#ffffff' : '#92400e'
                    }}>
                      {isDelivered ? '✓ Delivered' : isFailed ? '✕ Cancelled' : order.orderStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', color: '#374151', lineHeight: '1.6' }}>
                    <p style={{ margin: '4px 0' }}><strong>Buyer:</strong> {order.buyer?.name}</p>
                    <p style={{ margin: '4px 0' }}><strong>Seller:</strong> {order.seller?.name}</p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Items:</strong> {order.items?.length || 0} Product(s)
                    </p>
                    <p style={{ margin: '6px 0', fontSize: '1.08rem', fontWeight: '800', color: '#1b4332' }}>
                      Total Amount: ৳{order.totalAmount}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={getPaymentLogo(order.paymentMethod, order.paymentDetails?.provider)} 
                        alt={order.paymentMethod} 
                        style={{ height: '26px', objectFit: 'contain' }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#4b5563' }}>
                        {order.paymentDetails?.provider || order.paymentMethod}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.85rem', color: '#1b4332', fontWeight: 'bold' }}>
                      View Details & Track →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Order Modal */}
        {selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              boxSizing: 'border-box'
            }}>
              {/* Modal Top Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '16px',
                marginBottom: '22px'
              }}>
                <div>
                  <h2 style={{ margin: 0, color: '#1b4332', fontSize: '1.4rem', fontWeight: '800' }}>
                    Order Invoice Details
                  </h2>
                  <span style={{ fontSize: '0.92rem', color: '#6b7280', fontWeight: '600' }}>
                    Order Number: #{selectedOrder.orderNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Full Registration & Checkout Info Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '22px'
              }}>
                {/* Buyer Info */}
                <div style={{
                  backgroundColor: '#f8faf9',
                  border: '1px solid #d8eddf',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1b4332', fontSize: '1.02rem', borderBottom: '1px solid #d8eddf', paddingBottom: '6px' }}>
                    👤 Buyer Information
                  </h4>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Name:</strong> {selectedOrder.buyer?.name}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Email:</strong> {selectedOrder.buyer?.email}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Phone:</strong> {selectedOrder.buyer?.phone}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Location:</strong> {selectedOrder.buyer?.location}</p>
                </div>

                {/* Seller Info */}
                <div style={{
                  backgroundColor: '#f8faf9',
                  border: '1px solid #d8eddf',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1b4332', fontSize: '1.02rem', borderBottom: '1px solid #d8eddf', paddingBottom: '6px' }}>
                    🏪 Seller Information
                  </h4>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Name:</strong> {selectedOrder.seller?.name}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Email:</strong> {selectedOrder.seller?.email}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Phone:</strong> {selectedOrder.seller?.phone}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Location:</strong> {selectedOrder.seller?.location}</p>
                </div>
              </div>

              {/* Purchased Products Breakdown */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1b4332', fontSize: '1.05rem' }}>
                  📦 Purchased Items & Stock Information
                </h4>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px solid #f3f4f6',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                          Quantity: {item.quantity} | Unit Price: ৳{item.price}
                        </div>
                      </div>
                      <div style={{ fontWeight: '800', color: '#1b4332', fontSize: '1rem' }}>
                        ৳{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '800',
                    fontSize: '1.08rem',
                    color: '#1b4332'
                  }}>
                    <span>Total Order Amount (incl. shipping ৳70):</span>
                    <span>৳{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details with Official Logo */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800' }}>
                    Payment Method
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1b4332', marginTop: '2px' }}>
                    {selectedOrder.paymentDetails?.provider || selectedOrder.paymentMethod}
                  </div>
                </div>
                <img 
                  src={getPaymentLogo(selectedOrder.paymentMethod, selectedOrder.paymentDetails?.provider)} 
                  alt="" 
                  style={{ height: '36px', objectFit: 'contain' }}
                />
              </div>

              {/* Freezable Interactive Logistics Checklist */}
              <div>
                <h4 style={{ margin: '0 0 14px 0', color: '#1b4332', fontSize: '1.1rem', fontWeight: '800' }}>
                  ☑️ Execute Logistics Checklist Steps
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'collectedFromSeller', label: 'Product collected from seller' },
                    { key: 'shipped', label: 'Product shipped' },
                    { key: 'reachedWarehouse', label: 'Product reached Eco-Cart warehouse' },
                    { key: 'reachedHub', label: "Product sent to your area's nearby Eco-Cart delivery hub" },
                    { key: 'outForDelivery', label: 'Product out for delivery' }
                  ].map((step) => {
                    const isChecked = Boolean(selectedOrder.logisticsSteps?.[step.key]);

                    return (
                      <label
                        key={step.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          backgroundColor: isChecked ? '#e8f5e9' : '#ffffff',
                          border: isChecked ? '1.5px solid #2e7d32' : '1.5px solid #d1d5db',
                          cursor: isChecked ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          color: isChecked ? '#1b4332' : '#374151',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isChecked}
                          onChange={() => handleStepToggle(selectedOrder._id, step.key, isChecked)}
                          style={{ width: '20px', height: '20px', accentColor: '#1b4332', cursor: 'pointer' }}
                        />
                        <span>{step.label}</span>
                        {isChecked && <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#2e7d32' }}>[Freezed ✓]</span>}
                      </label>
                    );
                  })}

                  <hr style={{ border: 'none', borderTop: '2px dashed #e5e7eb', margin: '10px 0' }} />

                  {/* Mutual Exclusion: Success (Green) vs Failure (Red) */}
                  {/* Success: Product Delivered */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      backgroundColor: selectedOrder.logisticsSteps?.delivered ? '#e8f5e9' : '#ffffff',
                      border: '2px solid #2e7d32',
                      cursor: (selectedOrder.logisticsSteps?.delivered || selectedOrder.logisticsSteps?.failed) ? 'not-allowed' : 'pointer',
                      fontWeight: '800',
                      fontSize: '0.98rem',
                      color: '#2e7d32',
                      opacity: selectedOrder.logisticsSteps?.failed ? 0.4 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(selectedOrder.logisticsSteps?.delivered)}
                      disabled={Boolean(selectedOrder.logisticsSteps?.delivered || selectedOrder.logisticsSteps?.failed)}
                      onChange={() => handleStepToggle(selectedOrder._id, 'delivered', selectedOrder.logisticsSteps?.delivered)}
                      style={{ width: '22px', height: '22px', accentColor: '#2e7d32', cursor: 'pointer' }}
                    />
                    <span>for success: Product delivered</span>
                  </label>

                  {/* Failure: Product Not Delivered / Cancelled */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      backgroundColor: selectedOrder.logisticsSteps?.failed ? '#ffebee' : '#ffffff',
                      border: '2px solid #c62828',
                      cursor: (selectedOrder.logisticsSteps?.delivered || selectedOrder.logisticsSteps?.failed) ? 'not-allowed' : 'pointer',
                      fontWeight: '800',
                      fontSize: '0.98rem',
                      color: '#c62828',
                      opacity: selectedOrder.logisticsSteps?.delivered ? 0.4 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(selectedOrder.logisticsSteps?.failed)}
                      disabled={Boolean(selectedOrder.logisticsSteps?.delivered || selectedOrder.logisticsSteps?.failed)}
                      onChange={() => handleStepToggle(selectedOrder._id, 'failed', selectedOrder.logisticsSteps?.failed)}
                      style={{ width: '22px', height: '22px', accentColor: '#c62828', cursor: 'pointer' }}
                    />
                    <span>for failure: Product not delivered order cancelled by {selectedOrder.buyer?.name}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsDashboard;