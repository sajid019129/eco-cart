import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InspectTrackModal from '../components/InspectTrackModal';

const LogisticsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for Total Active Orders alert bubble popup
  const [activeOrdersAlertOpen, setActiveOrdersAlertOpen] = useState(false);
  const [activeOrdersAlertMounted, setActiveOrdersAlertMounted] = useState(false);
  const activeOrdersAlertTimerRef = useRef(null);
  const activeOrdersBtnRef = useRef(null);

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

  const triggerActiveOrdersAlert = () => {
    if (activeOrdersAlertTimerRef.current) clearTimeout(activeOrdersAlertTimerRef.current);

    setActiveOrdersAlertMounted(true);
    setActiveOrdersAlertOpen(true);

    activeOrdersAlertTimerRef.current = setTimeout(() => {
      closeActiveOrdersAlert();
    }, 3500);
  };

  const closeActiveOrdersAlert = () => {
    setActiveOrdersAlertOpen(false);
    if (activeOrdersAlertTimerRef.current) clearTimeout(activeOrdersAlertTimerRef.current);
    activeOrdersAlertTimerRef.current = setTimeout(() => {
      setActiveOrdersAlertMounted(false);
      activeOrdersAlertTimerRef.current = null;
    }, 180);
  };

  const handleActiveOrdersClick = () => {
    if (activeOrdersAlertOpen) {
      closeActiveOrdersAlert();
    } else {
      triggerActiveOrdersAlert();
    }
  };

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeOrdersBtnRef.current && !activeOrdersBtnRef.current.contains(event.target)) {
        if (activeOrdersAlertOpen) closeActiveOrdersAlert();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (activeOrdersAlertTimerRef.current) clearTimeout(activeOrdersAlertTimerRef.current);
    };
  }, [activeOrdersAlertOpen]);

  const handleStepToggle = async (orderId, stepName, currentVal) => {
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
    if (p.includes('bkash')) return '/bKash.jpg';
    if (p.includes('nagad')) return '/Nagad.jpg';
    if (p.includes('upay')) return '/Upay.jpg';
    if (p.includes('mastercard')) return '/MasterCard.png';
    if (p.includes('cod') || p.includes('cash')) return '/Cash on Delivery.jpg';
    return '/Bank.png';
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '30px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative'
    }}>
      <style>{`
        @keyframes preciseGapFadeTravelEvenFaster {
          0% {
            left: 440px;
            opacity: 0;
            transform: translateY(-50%) scaleX(-1);
          }
          10% {
            opacity: 1;
            transform: translateY(-50%) scaleX(-1);
          }
          90% {
            opacity: 1;
            transform: translateY(-50%) scaleX(-1);
          }
          100% {
            left: calc(100% - 370px);
            opacity: 0;
            transform: translateY(-50%) scaleX(-1);
          }
        }

        .precise-banner-truck-even-faster {
          position: absolute;
          top: 50%;
          animation: preciseGapFadeTravelEvenFaster 2.5s linear infinite;
          will-change: left, opacity;
          font-size: 2.2rem;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes dropdownExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-7px) scale(0.97); }
        }

        .nav-alert-bubble {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: auto;
          white-space: nowrap;
          padding: 10px 16px;
          background: #ffffff;
          border-radius: 13px;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.23), 0 3px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          z-index: 10;
          transform-origin: top right;
          color: #1b4332;
          font-size: 0.92rem;
          font-weight: 750;
          text-align: left;
        }

        .nav-alert-bubble::before {
          content: '';
          position: absolute;
          top: -7px;
          right: 25px;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 2px;
        }

        .nav-alert-bubble.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .nav-alert-bubble.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }
      `}</style>

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
          gap: '20px',
          position: 'relative'
        }}>
          {/* Left aligned text group */}
          <div style={{ zIndex: 2 }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
              Enterprise Logistics & Fulfillment Portal
            </h1>
            <p style={{ margin: '6px 0 0 0', color: '#b7e4c7', fontSize: '1.05rem', fontWeight: '700', fontStyle: 'italic' }}>
              Eco-Cart Supply Chain Management & Consignment Control
            </p>
          </div>

          {/* Traveling truck emoji with even faster speed */}
          <span className="precise-banner-truck-even-faster">🚚</span>
          
          {/* Always Highlighted Total Active Orders Button Container */}
          <div ref={activeOrdersBtnRef} style={{ zIndex: 2, flexShrink: 0, position: 'relative' }}>
            <div 
              onClick={handleActiveOrdersClick}
              style={{
                backgroundColor: 'rgba(82, 183, 136, 0.35)',
                border: '2px solid #52b788',
                padding: '12px 24px',
                borderRadius: '24px',
                fontWeight: '800',
                fontSize: '1.1rem',
                color: '#ffffff',
                boxShadow: '0 0 16px rgba(82, 183, 136, 0.45)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(82, 183, 136, 0.55)';
                e.currentTarget.style.borderColor = '#74c69d';
                e.currentTarget.style.boxShadow = '0 0 22px rgba(82, 183, 136, 0.7)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(82, 183, 136, 0.35)';
                e.currentTarget.style.borderColor = '#52b788';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(82, 183, 136, 0.45)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Active Consignments: {orders.length}
            </div>

            {/* Perfectly Aligned Popup Bubble under the Button */}
            {activeOrdersAlertMounted && (
              <div className={`nav-alert-bubble ${activeOrdersAlertOpen ? 'open' : 'closing'}`}>
                <div>All active fulfillment consignments displayed below</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.1rem', color: '#2d6a4f' }}>
            Synchronizing active logistics manifests... 🚚
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
            <h3>No active fulfillment records found in the queue.</h3>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
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
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    border: isDelivered 
                      ? '2px solid #52b788' 
                      : isFailed 
                      ? '2px solid #e63946' 
                      : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(45, 106, 79, 0.18)';
                    e.currentTarget.style.borderColor = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = isDelivered ? '#52b788' : isFailed ? '#e63946' : '#e0e0e0';
                  }}
                >
                  {/* Strict Inner Margin Container for Absolute Alignment */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Top Reference & Status Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800', letterSpacing: '0.5px' }}>
                          Consignment ID
                        </span>
                        <span style={{
                          fontWeight: '800',
                          fontSize: '1.02rem',
                          color: '#1b4332',
                          backgroundColor: '#e8f5e9',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          display: 'inline-block',
                          width: 'fit-content'
                        }}>
                          #{order.orderNumber}
                        </span>
                      </div>
                      
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        backgroundColor: isDelivered ? '#2d6a4f' : isFailed ? '#d32f2f' : '#fef3c7',
                        color: isDelivered || isFailed ? '#ffffff' : '#92400e',
                        letterSpacing: '0.3px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        flexShrink: 0
                      }}>
                        {isDelivered ? '✓ Delivered Successfully' : isFailed ? '✕ Consignment Cancelled' : order.orderStatus}
                      </span>
                    </div>

                    {/* Parties & Details Breakdown */}
                    <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', backgroundColor: '#f9fafb', padding: '14px', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', flexShrink: 0 }}>Buyer :</span>
                        <strong style={{ color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>{order.buyer?.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', flexShrink: 0 }}>Seller :</span>
                        <strong style={{ color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>{order.seller?.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', flexShrink: 0 }}>Manifest Quantity :</span>
                        <strong style={{ color: '#1b4332', whiteSpace: 'nowrap', textAlign: 'right' }}>{order.items?.length || 0} Unit(s)</strong>
                      </div>
                    </div>

                    {/* Financial Settlement Amount */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800', letterSpacing: '0.5px' }}>
                        Total Settlement
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2d6a4f' }}>
                        ৳{order.totalAmount}
                      </span>
                    </div>

                    {/* Footer Payment & Action Indicator */}
                    <div style={{
                      paddingTop: '12px',
                      borderTop: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
                        <img 
                          src={getPaymentLogo(order.paymentMethod, order.paymentDetails?.provider)} 
                          alt={order.paymentMethod} 
                          style={{ height: '24px', objectFit: 'contain', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.paymentDetails?.provider || order.paymentMethod}
                        </span>
                      </div>

                      <span 
                        style={{ 
                          backgroundColor: '#1b4332',
                          color: '#ffffff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.82rem', 
                          fontWeight: 'bold',
                          transition: 'background-color 0.2s ease',
                          letterSpacing: '0.3px',
                          flexShrink: 0,
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d6a4f'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#1b4332'}
                      >
                        Inspect & Track →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rendered Dedicated Inspect & Track Modal */}
      {selectedOrder && (
        <InspectTrackModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onStepToggle={handleStepToggle} 
        />
      )}
    </div>
  );
};

export default LogisticsDashboard;