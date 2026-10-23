import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckoutModal from './CheckoutModal';
import InvoiceModal from './InvoiceModal';
import OrderSuccessModal from './OrderSuccessModal';

const formatMediaSrc = (img) => {
  if (!img) return null;
  if (typeof img === 'object') {
    img = img.url || img.path || img.src || null;
  }
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    if (
      trimmed.startsWith('http') || 
      trimmed.startsWith('data:image') || 
      trimmed.startsWith('data:video') || 
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }
    if (trimmed.length > 50) {
      const prefix = trimmed.startsWith('AAAA') || trimmed.includes('video') ? 'data:video/mp4;base64,' : 'data:image/jpeg;base64,';
      return `${prefix}${trimmed}`;
    }
    if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
      return `http://localhost:5000/${trimmed.replace(/^\//, '')}`;
    }
    return trimmed;
  }
  return null;
};

const isVideoUrl = (url) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.includes('video/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
};

const getProductThumbnail = (product) => {
  if (!product) return null;
  let list = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images.map(formatMediaSrc).filter(Boolean);
  } else if (Array.isArray(product.photos) && product.photos.length > 0) {
    list = product.photos.map(formatMediaSrc).filter(Boolean);
  }
  if (list.length === 0) {
    const single = formatMediaSrc(product.image || product.imageUrl || product.photo);
    if (single) list.push(single);
  }

  for (let media of list.slice(0, 5)) {
    if (!isVideoUrl(media)) {
      return media;
    }
  }
  return list[0] || null;
};

function Cart({ user, cart = [], setCart, setProducts, showToast, onViewDetails }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animatingId, setAnimatingId] = useState(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const activeUser = user || JSON.parse(localStorage.getItem('user') || 'null');
  const userId = activeUser?.id || activeUser?._id;

  const fetchCart = async () => {
    if (!userId) {
      if (setCart) setCart([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      const serverItems = (res.data.items || []).filter(item => item.product !== null);
      const formattedCart = serverItems.map((item) => ({
        ...item.product,
        quantity: item.quantity,
        product: item.product
      }));
      if (setCart) setCart(formattedCart);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    if (setProducts) {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const updateQuantity = async (productId, productTitle, currentQty, delta) => {
    if (!userId) return;
    const newQuantity = currentQty + delta;

    if (newQuantity <= 0) {
      setAnimatingId(productId);
      setTimeout(async () => {
        try {
          const res = await axios.delete(`http://localhost:5000/api/cart/remove/${userId}/${productId}`);
          const serverItems = (res.data.items || []).filter(item => item.product !== null);
          const formattedCart = serverItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            product: item.product
          }));
          if (setCart) setCart(formattedCart);
          await refreshProducts();
        } catch (err) {
          console.error('Error removing item:', err);
        } finally {
          setAnimatingId(null);
        }
      }, 300);
      return;
    }

    try {
      const res = await axios.put('http://localhost:5000/api/cart/update', {
        userId,
        productId,
        quantity: newQuantity
      });

      const serverItems = (res.data.items || []).filter(item => item.product !== null);
      const formattedCart = serverItems.map((item) => ({
        ...item.product,
        quantity: item.quantity,
        product: item.product
      }));
      if (setCart) setCart(formattedCart);
      await refreshProducts();

      if (delta > 0 && showToast) {
        showToast(productTitle, 'success');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert(err.response?.data?.error || 'Failed to update quantity.');
    }
  };

  const removeItem = async (productId, productTitle) => {
    if (!userId) return;

    setAnimatingId(productId);

    setTimeout(async () => {
      try {
        const res = await axios.delete(`http://localhost:5000/api/cart/remove/${userId}/${productId}`);
        const serverItems = (res.data.items || []).filter(item => item.product !== null);
        const formattedCart = serverItems.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          product: item.product
        }));
        if (setCart) setCart(formattedCart);
        await refreshProducts();
      } catch (err) {
        console.error('Error removing item:', err);
        alert('Failed to remove item from cart.');
      } finally {
        setAnimatingId(null);
      }
    }, 300);
  };

  const removeAllCartItems = async () => {
    if (!userId) return;

    try {
      for (const item of cart) {
        const prod = item.product || item;
        const productId = prod._id || prod.id;
        if (productId) {
          await axios.delete(`http://localhost:5000/api/cart/remove/${userId}/${productId}`);
        }
      }
      if (setCart) setCart([]);
      await refreshProducts();
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert('Failed to clear cart items.');
    }
  };

  const handleCheckout = () => {
    if (!userId) {
      alert('Please log in to proceed to checkout.');
      return;
    }
    const validCartItems = cart.filter(item => item.product && (item.product._id || item.product.id));
    if (validCartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = async (orderData) => {
    setCompletedOrder(orderData);
    setIsCheckoutOpen(false);
    if (setCart) setCart([]);
    localStorage.removeItem(`cart_${userId}`);
    await refreshProducts(); // Refreshes global product inventory numbers instantly
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => {
      const prod = item.product;
      if (!prod) return acc;
      const price = prod.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <p style={{ textAlign: 'center', color: '#1b4332', fontSize: '1.2rem' }}>Loading your cart...</p>
      </div>
    );
  }

  const validCartItems = cart.filter(item => item.product && (item.product._id || item.product.id));
  const subtotal = calculateSubtotal();
  const shippingFee = validCartItems.length > 0 ? 70 : 0;
  const total = subtotal + shippingFee;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cartContainer}>
        <h2 style={styles.title}>Your Shopping Cart 🛒</h2>

        {validCartItems.length > 0 ? (
          <div style={styles.layout}>
            <div style={styles.itemsList}>
              {validCartItems.map((item) => {
                const prod = item.product;
                if (!prod) return null;

                const productId = prod._id || prod.id;
                const productTitle = prod.title || prod.name || 'Product';
                const currentQty = item.quantity || 1;
                const isRemoving = animatingId === productId;
                const thumbImg = getProductThumbnail(prod);

                return (
                  <div 
                    key={productId} 
                    style={{
                      ...styles.itemCard,
                      animation: isRemoving ? 'slideOutRight 0.3s ease forwards' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 67, 50, 0.1)';
                      e.currentTarget.style.borderColor = '#2d6a4f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={styles.itemLeftContent}>
                      <div style={styles.thumbContainer}>
                        {thumbImg ? (
                          <img src={thumbImg} alt={productTitle} style={styles.thumbImg} />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>📦</span>
                        )}
                      </div>
                      <div style={styles.itemInfo}>
                        <h3 style={styles.itemTitle}>{productTitle}</h3>
                        <span style={styles.itemPrice}>৳ {Number(prod.price || 0).toFixed(2)}</span>
                        <button 
                          type="button" 
                          onClick={() => onViewDetails && onViewDetails(prod)} 
                          style={styles.detailsBtn}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2d6a4f';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 67, 50, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1b4332';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div style={styles.itemActions}>
                      <div style={styles.qtyBox}>
                        <button 
                          onClick={() => updateQuantity(productId, productTitle, currentQty, -1)} 
                          style={styles.qtyBtn}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2d6a4f';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f3f5';
                            e.currentTarget.style.color = '#1b4332';
                          }}
                        >
                          -
                        </button>
                        <span style={styles.qtyText}>{currentQty}</span>
                        <button 
                          onClick={() => updateQuantity(productId, productTitle, currentQty, 1)} 
                          style={styles.qtyBtn}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2d6a4f';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f3f5';
                            e.currentTarget.style.color = '#1b4332';
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(productId, productTitle)} 
                        style={styles.removeBtn}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#d32f2f';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(211, 47, 47, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#d32f2f';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>৳ {subtotal.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Shipping Fee</span>
                  <span style={{ fontSize: '0.95rem', color: '#d32f2f', fontWeight: '700', marginTop: '6px' }}>
                    Flat Delivery All Over BD!
                  </span>
                </div>
                <span style={{ fontWeight: 'bold', color: '#1b4332' }}>৳ {shippingFee.toFixed(2)}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
              <div style={{ ...styles.summaryRow, fontSize: '1.2rem', fontWeight: 'bold', color: '#1b4332' }}>
                <span>Total</span>
                <span>৳ {total.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={handleCheckout}
                  style={styles.checkoutBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6a4f';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#2d6a4f';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 106, 79, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#2d6a4f';
                    e.currentTarget.style.borderColor = '#2d6a4f';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={removeAllCartItems}
                  style={styles.removeAllBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d32f2f';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#d32f2f';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(211, 47, 47, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#d32f2f';
                    e.currentTarget.style.borderColor = '#fca5a5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Remove All Products
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.emptyCart}>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '20px' }}>Your cart is empty</p>
            <Link
              to="/products"
              style={styles.browseBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1b4332';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d6a4f';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Browse Marketplace 🛍️
            </Link>
          </div>
        )}
      </div>

      {isCheckoutOpen && (
        <CheckoutModal 
          user={activeUser}
          cart={validCartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleOrderSuccess}
          showToast={showToast}
        />
      )}

      {completedOrder && (
        <OrderSuccessModal 
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onViewInvoice={() => setShowInvoice(true)}
          onBackToHome={() => {
            setCompletedOrder(null);
            navigate('/');
          }}
          onViewTrack={(orderNum) => {
            setCompletedOrder(null);
            navigate(`/track-order?orderId=${orderNum}`);
          }}
        />
      )}

      {showInvoice && completedOrder && (
        <InvoiceModal 
          order={completedOrder}
          onClose={() => setShowInvoice(false)}
        />
      )}

      <style>{`
        @keyframes slideOutRight {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(80px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#f4f7f6',
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  cartContainer: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1b4332',
    marginBottom: '25px'
  },
  removeAllBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#d32f2f',
    border: '1px solid #fca5a5',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
  },
  layout: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap'
  },
  itemsList: {
    flex: '2 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    transition: 'all 0.25s ease',
    border: '1px solid #e5e7eb',
    cursor: 'pointer'
  },
  itemLeftContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: '1 1 250px'
  },
  thumbContainer: {
    width: '65px',
    height: '65px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid #e5e7eb'
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  itemTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#2b2b2b',
    fontWeight: '600'
  },
  itemPrice: {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#2d6a4f'
  },
  detailsBtn: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginTop: '6px',
    width: 'fit-content',
    transition: 'all 0.2s ease',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
  },
  qtyBtn: {
    border: 'none',
    backgroundColor: '#f1f3f5',
    color: '#1b4332',
    padding: '8px 14px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'all 0.2s ease'
  },
  qtyText: {
    padding: '0 14px',
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: '0.95rem'
  },
  removeBtn: {
    background: 'transparent',
    color: '#d32f2f',
    border: '1px solid #fca5a5',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  },
  summaryCard: {
    flex: '1 1 300px',
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    height: 'fit-content',
    border: '1px solid #e5e7eb'
  },
  summaryTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#1b4332',
    fontWeight: '700'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    color: '#555'
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#2d6a4f',
    border: '1px solid #2d6a4f',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyCart: {
    backgroundColor: '#ffffff',
    padding: '60px',
    textAlign: 'center',
    borderRadius: '12px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb'
  },
  browseBtn: {
    backgroundColor: '#2d6a4f',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    transition: 'all 0.2s ease'
  }
};

export default Cart;