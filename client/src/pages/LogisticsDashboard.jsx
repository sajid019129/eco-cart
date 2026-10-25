import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InspectTrackModal from '../components/InspectTrackModal';

const LogisticsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeOrdersAlertOpen, setActiveOrdersAlertOpen] = useState(false);
  const [activeOrdersAlertMounted, setActiveOrdersAlertMounted] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  const activeOrdersAlertTimerRef = useRef(null);
  const blinkingTimerRef = useRef(null);
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
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isBlinking) {
      if (blinkingTimerRef.current) clearTimeout(blinkingTimerRef.current);
      blinkingTimerRef.current = setTimeout(() => {
        setIsBlinking(false);
      }, 900);
    }
    return () => {
      if (blinkingTimerRef.current) clearTimeout(blinkingTimerRef.current);
    };
  }, [isBlinking]);

  const triggerActiveOrdersAlert = () => {
    if (activeOrdersAlertTimerRef.current) clearTimeout(activeOrdersAlertTimerRef.current);

    setActiveOrdersAlertMounted(true);
    setActiveOrdersAlertOpen(true);
    setIsBlinking(true);

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
      if (blinkingTimerRef.current) clearTimeout(blinkingTimerRef.current);
    };
  }, [activeOrdersAlertOpen]);

  const handleStepToggle = async (orderId, stepName, currentVal) => {
    if (currentVal) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/orders/logistics/${orderId}`, {
        logisticsSteps: { [stepName]: true }
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

  const getOrderSellers = (order) => {
    let rawSellers = [];
    if (order.items && order.items.length > 0) {
      rawSellers = order.items.map(item => item.seller?.name || item.sellerName || '');
    }
    if (order.seller?.name) {
      rawSellers.push(order.seller.name);
    }

    const parsedNames = [];
    rawSellers.forEach(str => {
      if (!str) return;
      if (str.includes('Multiple Sellers') && str.includes('(') && str.includes(')')) {
        const inner = str.substring(str.indexOf('(') + 1, str.lastIndexOf(')'));
        inner.split(',').forEach(n => {
          const trimmed = n.trim();
          if (trimmed) parsedNames.push(trimmed);
        });
      } else {
        const trimmed = str.trim();
        if (trimmed && !trimmed.toLowerCase().includes('multiple sellers')) {
          parsedNames.push(trimmed);
        }
      }
    });

    const uniqueCleanSellers = Array.from(new Set(parsedNames));
    return uniqueCleanSellers.length > 0 ? uniqueCleanSellers : ['Eco-Cart Merchant'];
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
          0% { left: 440px; opacity: 0; transform: translateY(-50%) scaleX(-1); }
          10% { opacity: 1; transform: translateY(-50%) scaleX(-1); }
          90% { opacity: 1; transform: translateY(-50%) scaleX(-1); }
          100% { left: calc(100% - 370px); opacity: 0; transform: translateY(-50%) scaleX(-1); }
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

        @keyframes blinkFourTimesFaster {
          0% { opacity: 1; border-color: #1b4332; box-shadow: 0 12px 28px rgba(45, 106, 79, 0.22); transform: translateY(-4px); }
          12.5% { opacity: 0.15; border-color: #52b788; box-shadow: 0 4px 10px rgba(82, 183, 136, 0.1); transform: translateY(0); }
          25% { opacity: 1; border-color: #1b4332; box-shadow: 0 12px 28px rgba(45, 106, 79, 0.22); transform: translateY(-4px); }
          37.5% { opacity: 0.15; border-color: #52b788; box-shadow: 0 4px 10px rgba(82, 183, 136, 0.1); transform: translateY(0); }
          50% { opacity: 1; border-color: #1b4332; box-shadow: 0 12px 28px rgba(45, 106, 79, 0.22); transform: translateY(-4px); }
          62.5% { opacity: 0.15; border-color: #52b788; box-shadow: 0 4px 10px rgba(82, 183, 136, 0.1); transform: translateY(0); }
          75% { opacity: 1; border-color: #1b4332; box-shadow: 0 12px 28px rgba(45, 106, 79, 0.22); transform: translateY(-4px); }
          87.5% { opacity: 0.15; border-color: #52b788; box-shadow: 0 4px 10px rgba(82, 183, 136, 0.1); transform: translateY(0); }
          100% { opacity: 1; border-color: #1b4332; box-shadow: 0 4px 14px rgba(0,0,0,0.06); transform: translateY(0); }
        }

        .card-four-blink {
          animation: blinkFourTimesFaster 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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

        .inspect-track-btn {
          background-color: #1b4332;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: bold;
          letter-spacing: 0.3px;
          flex-shrink: 0;
          white-space: nowrap;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 5px rgba(27, 67, 50, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .inspect-track-btn:hover {
          background-color: #2d6a4f;
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.3);
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <div style={{ zIndex: 2 }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
              Logistics & Delivery Portal
            </h1>
            <p style={{ margin: '6px 0 0 0', color: '#b7e4c7', fontSize: '1.05rem', fontWeight: '700', fontStyle: 'italic' }}>
              Eco-Cart Delivery Management System
            </p>
          </div>

          <span className="precise-banner-truck-even-faster">🚚</span>
          
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
                cursor: 'default',
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

            {activeOrdersAlertMounted && (
              <div className={`nav-alert-bubble ${activeOrdersAlertOpen ? 'open' : 'closing'}`}>
                <div>All active fulfillment consignments are displayed below</div>
              </div>
            )}
          </div>
        </div>

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
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px'
          }}>
            {orders.map((order) => {
              const isDelivered = order.logisticsSteps?.delivered || order.orderStatus === 'Delivered';
              const isFailed = order.logisticsSteps?.failed || order.orderStatus === 'Cancelled';
              const sellersList = getOrderSellers(order);

              return (
                <div
                  key={order._id}
                  className={isBlinking ? 'card-four-blink' : ''}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    border: '1px solid #e5e7eb',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 14px 30px rgba(27, 67, 50, 0.15)';
                    e.currentTarget.style.borderColor = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800', letterSpacing: '0.5px' }}>
                        Consignment ID
                      </span>
                      
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        backgroundColor: isDelivered ? '#2d6a4f' : isFailed ? '#d32f2f' : '#fef3c7',
                        color: isDelivered || isFailed ? '#ffffff' : '#92400e',
                        letterSpacing: '0.3px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap'
                      }}>
                        {isDelivered ? '✓ Delivered Successfully' : isFailed ? '✕ Consignment Cancelled' : order.orderStatus}
                      </span>
                    </div>

                    <div style={{
                      fontWeight: '800',
                      fontSize: '1.1rem',
                      color: '#1b4332',
                      backgroundColor: '#e8f5e9',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      width: 'fit-content',
                      letterSpacing: '0.3px',
                      whiteSpace: 'nowrap'
                    }}>
                      #{order.orderNumber}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', backgroundColor: '#f9fafb', padding: '14px', borderRadius: '10px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px', alignItems: 'baseline' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', flexShrink: 0 }}>Buyer :</span>
                        <strong style={{ color: '#1f2937', textAlign: 'right', wordBreak: 'break-word' }}>{order.buyer?.name}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', flexShrink: 0, paddingTop: '1px' }}>
                          Seller(s) :
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'right', flexGrow: 1 }}>
                          {sellersList.map((sName, sIdx) => (
                            <strong key={sIdx} style={{ color: '#1f2937', wordBreak: 'break-word' }}>
                              {sName}
                            </strong>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px', alignItems: 'baseline', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
                        <span style={{ color: '#6b7280', fontWeight: '600', flexShrink: 0 }}>Manifest Quantity :</span>
                        <strong style={{ color: '#1b4332', textAlign: 'right' }}>{order.items?.length || 0} Unit(s)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800', letterSpacing: '0.5px' }}>
                        Total Settlement
                      </span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2d6a4f' }}>
                        ৳{order.totalAmount}
                      </span>
                    </div>

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

                      <button 
                        type="button"
                        className="inspect-track-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        Inspect & Track →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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